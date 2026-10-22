import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BeerStein, GearSix, MapTrifold, Trophy, WifiSlash } from '@phosphor-icons/react'
import { PLAYER_IDS, crewById, type PlayerId } from '../data/trip'
import { isTestGame } from './config'
import { useGameEvents } from './events'
import { GameContext, type GameCtx } from './GameContext'
import { deriveGame, keys } from './logic'
import { Avatar, Coin } from './ui/bits'
import { BierTab } from './ui/BierTab'
import { Intro } from './ui/Intro'
import { PickPlayer } from './ui/PickPlayer'
import { StandTab } from './ui/StandTab'
import { StationPage } from './ui/StationPage'
import { TourTab } from './ui/TourTab'
import { ConfirmButton } from './ui/TaskCard'

type Tab = 'tour' | 'stand' | 'bier'

const TABS: { id: Tab; label: string; icon: typeof MapTrifold }[] = [
  { id: 'tour', label: 'Tour', icon: MapTrifold },
  { id: 'stand', label: 'Stand', icon: Trophy },
  { id: 'bier', label: 'Bier', icon: BeerStein },
]

function readLocal(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Private mode: the choice just does not survive a reload
  }
}

/** Tab and open station live in the URL hash, so the back button works. */
function readHash(): { tab: Tab; station: string | null } {
  const [tab, station] = window.location.hash.replace('#', '').split('/')
  return { tab: tab === 'stand' || tab === 'bier' ? tab : 'tour', station: tab === 'station' && station ? station : null }
}

export function GameApp({ gameId }: { gameId: string }) {
  const reduce = useReducedMotion()
  const { events, status, send, resetTestGame } = useGameEvents(gameId)
  const game = useMemo(() => deriveGame(events), [events])
  const playerKey = `dt-player-${gameId}`
  const introKey = `dt-intro-${gameId}`
  const [me, setMe] = useState<PlayerId | null>(() => {
    const v = readLocal(playerKey)
    return v && (PLAYER_IDS as string[]).includes(v) ? (v as PlayerId) : null
  })
  const [introSeen, setIntroSeen] = useState(() => readLocal(introKey) === '1')
  const [route, setRoute] = useState(readHash)
  const [menu, setMenu] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (hash: string) => {
    window.location.hash = hash
  }

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg((cur) => (cur === msg ? null : cur)), 3200)
  }, [])

  const sendWithToast = useCallback<GameCtx['send']>(
    async (ev) => {
      const result = await send(ev)
      if (result === 'queued') toast('Kein Netz. Ist gespeichert und geht raus, sobald du wieder Empfang hast.')
      if (result === 'rejected') toast('Hat nicht geklappt. Lad die Seite neu und versuch es nochmal.')
      return result
    },
    [send, toast],
  )

  if (!me) {
    return (
      <PickPlayer
        joined={game.joined}
        onPick={(id) => {
          writeLocal(playerKey, id)
          setMe(id)
          send({ key: keys.join(id), kind: 'join', player: id })
        }}
      />
    )
  }

  if (!introSeen) {
    return (
      <Intro
        me={me}
        onDone={() => {
          writeLocal(introKey, '1')
          setIntroSeen(true)
        }}
      />
    )
  }

  const ctx: GameCtx = { gameId, me, game, status, send: sendWithToast, toast }
  const station = route.station && game.stations.some((s) => s.station.id === route.station) ? route.station : null

  return (
    <GameContext.Provider value={ctx}>
      <div className="mx-auto min-h-[100dvh] max-w-[560px]">
        <header className="sticky top-0 z-[1000] flex items-center gap-3 bg-page/90 px-5 pb-3 pt-[calc(12px+env(safe-area-inset-top,0px))] backdrop-blur">
          <Avatar id={me} size={40} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-lg font-extrabold">{crewById(me).name}</p>
            <p className="truncate text-sm text-ink-soft">
              {game.totals[me]} Punkte{isTestGame(gameId) ? ' · Test' : ''}
            </p>
          </div>
          {status === 'offline' && (
            <span className="flex items-center gap-1 rounded-full bg-rose/30 px-2 py-1 text-xs font-semibold" role="status">
              <WifiSlash size={14} weight="bold" /> offline
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 font-display text-lg font-extrabold tabular-nums shadow-[var(--shadow)]" aria-label={`${game.coins[me]} Landskron Coins`}>
            <Coin size={22} /> {game.coins[me]}
          </span>
          <button type="button" aria-label="Einstellungen" onClick={() => setMenu((m) => !m)} className="grid h-11 w-11 place-items-center rounded-full text-ink-soft active:bg-surface">
            <GearSix size={22} weight="bold" />
          </button>
        </header>

        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="relative z-[1000] mx-5 mb-4 space-y-2 rounded-3xl bg-surface p-4 shadow-[var(--shadow)]"
            >
              <button
                type="button"
                onClick={() => {
                  writeLocal(playerKey, null)
                  setMe(null)
                  setMenu(false)
                }}
                className="clay-soft h-12 w-full rounded-full font-semibold"
              >
                Anderen Spieler wählen
              </button>
              <button
                type="button"
                onClick={() => {
                  writeLocal(introKey, null)
                  setIntroSeen(false)
                  setMenu(false)
                }}
                className="clay-soft h-12 w-full rounded-full font-semibold"
              >
                Regeln nochmal zeigen
              </button>
              {isTestGame(gameId) && (
                <ConfirmButton
                  label="Testspiel zurücksetzen"
                  confirmLabel="Löscht alles in diesem Testspiel. Sicher?"
                  onConfirm={async () => {
                    const ok = await resetTestGame()
                    toast(ok ? 'Testspiel ist leer.' : 'Zurücksetzen hat nicht geklappt.')
                    setMenu(false)
                  }}
                  className="h-12 w-full rounded-full border-2 border-[#c2483a] font-semibold text-[#c2483a]"
                />
              )}
              <p className="pt-1 text-center text-xs text-ink-soft">Spiel: {gameId}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="px-5 pb-[calc(104px+env(safe-area-inset-bottom,0px))] pt-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={station ?? route.tab}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {station ? (
                <StationPage stationId={station} onBack={() => go('tour')} onNext={(id) => go(`station/${id}`)} />
              ) : route.tab === 'stand' ? (
                <StandTab />
              ) : route.tab === 'bier' ? (
                <BierTab />
              ) : (
                <TourTab onOpen={(id) => go(`station/${id}`)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav
          aria-label="Bereiche"
          className="fixed inset-x-0 bottom-0 z-[1000] mx-auto flex max-w-[560px] gap-2 bg-page/90 px-5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = !station && route.tab === id
            const badge = id === 'bier' ? game.debts.filter((d) => !d.paid).length : 0
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-14 flex-1 flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${active ? 'bg-accent text-on-accent' : 'text-ink-soft active:bg-surface'}`}
              >
                <Icon size={22} weight={active ? 'fill' : 'bold'} />
                {label}
                {badge > 0 && (
                  <span className="absolute right-3 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-xs font-bold text-[#16302a]">{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <AnimatePresence>
          {toastMsg && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed inset-x-5 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] z-[1100] mx-auto max-w-[520px] rounded-2xl bg-ink px-4 py-3 text-page shadow-[var(--shadow)]"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameContext.Provider>
  )
}
