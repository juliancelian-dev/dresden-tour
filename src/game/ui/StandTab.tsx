import { motion, useReducedMotion } from 'motion/react'
import { BeerStein, Crown } from '@phosphor-icons/react'
import { PLAYER_IDS, crewById } from '../../data/trip'
import { useGame } from '../GameContext'
import { Avatar, Coin, Niche } from './bits'

export function StandTab() {
  const { game, me } = useGame()
  const reduce = useReducedMotion()
  const owed = (p: string) => game.debts.filter((d) => d.debtor === p && !d.paid).length
  const ranked = [...PLAYER_IDS].sort((a, b) => game.totals[b] - game.totals[a] || owed(a) - owed(b))
  const leader = game.totals[ranked[0]] > 0 && game.totals[ranked[0]] !== game.totals[ranked[1]] ? ranked[0] : null
  const done = game.stations.filter((s) => s.done).length

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <Niche src={leader ? 'img/august-jubel.webp' : 'img/august-denkt.webp'} alt="August" className="h-[150px] w-[100px]" />
        <div className="mb-2">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight">Spielstand</h1>
          <p className="text-ink-soft">
            {done} von {game.stations.length} Stationen. {leader ? `${crewById(leader).name} ${done === game.stations.length ? 'hat gewonnen' : 'führt'}.` : done === game.stations.length ? 'Unentschieden an der Spitze.' : 'Noch ist alles offen.'}
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {ranked.map((p) => (
          <motion.li
            key={p}
            layout={!reduce}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-[var(--shadow)] ${p === me ? 'ring-3 ring-accent' : ''}`}
          >
            <span className="w-6 text-center font-display text-xl font-extrabold text-ink-soft">{1 + ranked.filter((q) => game.totals[q] > game.totals[p]).length}</span>
            <div className="relative">
              <Avatar id={p} size={56} />
              {p === leader && (
                <motion.span
                  initial={reduce ? false : { y: -8, rotate: -20, opacity: 0 }}
                  animate={{ y: 0, rotate: -12, opacity: 1 }}
                  className="absolute -left-1 -top-3 text-gold"
                  aria-label="führt"
                >
                  <Crown size={26} weight="fill" />
                </motion.span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-display text-xl font-extrabold leading-tight">{crewById(p).name}</p>
              <p className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="flex items-center gap-1">
                  <Coin size={16} /> {game.coins[p]}
                </span>
                <span className="flex items-center gap-1">
                  <BeerStein size={16} weight="bold" className={owed(p) > 0 ? 'text-rose' : ''} /> {owed(p)} offen
                </span>
              </p>
            </div>
            <span className="font-display text-3xl font-extrabold tabular-nums">{game.totals[p]}</span>
          </motion.li>
        ))}
      </ol>
      <p className="text-sm text-ink-soft">Punkte gibt es pro Aufgabe. Coins sind Startguthaben plus Punkte minus Einkäufe.</p>
    </div>
  )
}
