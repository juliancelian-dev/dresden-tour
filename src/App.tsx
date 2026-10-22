import { lazy, Suspense } from 'react'
import { Teaser } from './teaser/Teaser'
import { GAME_OPENS, MAIN_GAME, readGameId } from './game/config'

const GameApp = lazy(() => import('./game/GameApp').then((m) => ({ default: m.GameApp })))

// Teaser until trip day. With ?spiel=test (or any id) the game opens early for testing.
export default function App() {
  const fromUrl = readGameId()
  const gameId = fromUrl ?? (Date.now() >= GAME_OPENS.getTime() ? MAIN_GAME : null)
  if (!gameId) return <Teaser />
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-page" />}>
      <GameApp gameId={gameId} />
    </Suspense>
  )
}
