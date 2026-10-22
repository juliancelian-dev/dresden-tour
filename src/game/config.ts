// Public values only. The publishable key is meant to sit in the browser,
// row level security on the events table does the guarding.
export const SUPABASE_URL = 'https://cyxsdyhgzluhnnhcxppp.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_IFyIeCHzVHW-GKW3H9BpiQ_3iZuiIxB'

/** The real game. Anything starting with "test" can be wiped from the app. */
export const MAIN_GAME = 'dresden-2026'

/** Without ?spiel=... the teaser shows until this moment. */
export const GAME_OPENS = new Date('2026-12-12T00:00:00+01:00')

export const START_COINS = 5
export const PRICES = { hint: 3, fifty: 2 } as const

/**
 * Photo and find tasks: 'group' means the four of you decide in the app.
 * 'ai' is prepared for later (see photoCheck.ts) and needs an API key stored
 * as a Supabase secret, never in this file.
 */
export const PHOTO_CHECK: 'group' | 'ai' = 'group'

export function readGameId(): string | null {
  const raw = new URLSearchParams(window.location.search).get('spiel')
  if (raw === null) return null
  const id = raw.trim().toLowerCase()
  if (id === '' || id === '1' || id === 'ja') return MAIN_GAME
  return /^[a-z0-9-]{1,40}$/.test(id) ? id : MAIN_GAME
}

export const isTestGame = (game: string) => game.startsWith('test')
