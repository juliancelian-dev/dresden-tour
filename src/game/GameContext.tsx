import { createContext, useContext } from 'react'
import type { PlayerId } from '../data/trip'
import type { NewEvent, SendResult, SyncStatus } from './events'
import type { GameState } from './logic'

export type GameCtx = {
  gameId: string
  me: PlayerId
  game: GameState
  status: SyncStatus
  send: (ev: NewEvent) => Promise<SendResult>
  toast: (msg: string) => void
}

export const GameContext = createContext<GameCtx | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame outside GameContext')
  return ctx
}
