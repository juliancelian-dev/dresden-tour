import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from './config'
import type { PlayerId } from '../data/trip'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } },
})

export type EventKind = 'join' | 'answer' | 'truth' | 'verdict' | 'skip' | 'buy' | 'force' | 'paid'

export type GameEvent = {
  id: number
  key: string
  kind: EventKind
  player: PlayerId | null
  task: string | null
  payload: Record<string, unknown>
  created_at: string
}

export type NewEvent = Pick<GameEvent, 'key' | 'kind'> & Partial<Pick<GameEvent, 'player' | 'task' | 'payload'>>

export type SyncStatus = 'loading' | 'live' | 'offline'

/** stored: in the database. queued: no network, goes out later. rejected: the database said no. */
export type SendResult = 'stored' | 'queued' | 'rejected'

const POLL_MS = 15000

// Postgres and PostgREST errors carry a code, a dead connection does not
const isNetworkError = (error: { code?: string }) => !error.code

const outboxKey = (game: string) => `dt-outbox-${game}`

function loadOutbox(game: string): GameEvent[] {
  try {
    const raw = localStorage.getItem(outboxKey(game))
    return raw ? (JSON.parse(raw) as GameEvent[]) : []
  } catch {
    return []
  }
}

function saveOutbox(game: string, outbox: GameEvent[]) {
  try {
    if (outbox.length) localStorage.setItem(outboxKey(game), JSON.stringify(outbox))
    else localStorage.removeItem(outboxKey(game))
  } catch {
    // Private mode or full storage, the queue then only lives until reload
  }
}

const toRow = (game: string, e: GameEvent) => ({ game, key: e.key, kind: e.kind, player: e.player, task: e.task, payload: e.payload })

function mergeEvents(current: GameEvent[], incoming: GameEvent[]) {
  const byKey = new Map(current.map((e) => [e.key, e]))
  for (const e of incoming) {
    const existing = byKey.get(e.key)
    // A stored row beats an optimistic one, otherwise first one wins
    if (!existing || (existing.id < 0 && e.id > 0)) byKey.set(e.key, e)
  }
  return [...byKey.values()].sort((a, b) => (a.id < 0 ? Infinity : a.id) - (b.id < 0 ? Infinity : b.id))
}

/** Loads the event log of one game, keeps it live and lets the phone add events. */
export function useGameEvents(game: string) {
  // Events that could not be sent yet are shown right away and retried until they are stored
  const outbox = useRef<GameEvent[]>(loadOutbox(game))
  const [events, setEvents] = useState<GameEvent[]>(() => outbox.current)
  const [status, setStatus] = useState<SyncStatus>('loading')
  const tempId = useRef(Math.min(-1, ...outbox.current.map((e) => e.id - 1)))
  const flushing = useRef(false)

  const dropFromOutbox = useCallback(
    (key: string) => {
      outbox.current = outbox.current.filter((e) => e.key !== key)
      saveOutbox(game, outbox.current)
    },
    [game],
  )

  const flush = useCallback(async () => {
    if (flushing.current) return
    flushing.current = true
    try {
      for (const e of [...outbox.current]) {
        const { error } = await supabase.from('events').insert(toRow(game, e))
        if (error && isNetworkError(error)) return
        // Stored, a duplicate (fine) or refused by the database (would never succeed)
        dropFromOutbox(e.key)
        if (error && error.code !== '23505') setEvents((cur) => cur.filter((x) => x.key !== e.key || x.id > 0))
      }
    } finally {
      flushing.current = false
    }
  }, [game, dropFromOutbox])

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.from('events').select('*').eq('game', game).order('id').limit(5000)
    if (error) {
      setStatus('offline')
      return
    }
    // Full replace keeps phones in sync after a test reset, optimistic rows stay until stored
    setEvents((cur) => mergeEvents(data as GameEvent[], cur.filter((e) => e.id < 0)))
    setStatus('live')
    if (outbox.current.length) flush().then(() => outbox.current.length === 0 || setStatus('offline'))
  }, [game, flush])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(`events-${game}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `game=eq.${game}` }, (msg) => {
        setEvents((cur) => mergeEvents(cur, [msg.new as GameEvent]))
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') refetch()
        if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('offline')
      })

    const poll = window.setInterval(refetch, POLL_MS)
    const onVisible = () => document.visibilityState === 'visible' && refetch()
    const onOffline = () => setStatus('offline')
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', refetch)
    window.addEventListener('offline', onOffline)
    return () => {
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refetch)
      window.removeEventListener('offline', onOffline)
      supabase.removeChannel(channel)
    }
  }, [game, refetch])

  const send = useCallback(
    async (ev: NewEvent): Promise<SendResult> => {
      const optimistic: GameEvent = {
        id: tempId.current--,
        key: ev.key,
        kind: ev.kind,
        player: ev.player ?? null,
        task: ev.task ?? null,
        payload: ev.payload ?? {},
        created_at: new Date().toISOString(),
      }
      setEvents((cur) => mergeEvents(cur, [optimistic]))
      const { error } = await supabase.from('events').insert(toRow(game, optimistic))
      if (!error) return 'stored'
      // 23505 = someone was faster with the same key, that is fine
      if (error.code === '23505') {
        refetch()
        return 'stored'
      }
      if (isNetworkError(error)) {
        if (!outbox.current.some((e) => e.key === optimistic.key)) {
          outbox.current = [...outbox.current, optimistic]
          saveOutbox(game, outbox.current)
        }
        setStatus('offline')
        return 'queued'
      }
      setEvents((cur) => cur.filter((e) => e.key !== optimistic.key || e.id > 0))
      return 'rejected'
    },
    [game, refetch],
  )

  const resetTestGame = useCallback(async () => {
    const { error } = await supabase.from('events').delete().eq('game', game)
    if (!error) {
      outbox.current = []
      saveOutbox(game, [])
      setEvents([])
    }
    return !error
  }, [game])

  return { events, status, send, refetch, resetTestGame }
}
