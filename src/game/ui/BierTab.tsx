import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PLAYER_IDS, crewById, type PlayerId } from '../../data/trip'
import { STATIONS } from '../../data/stations'
import { useGame } from '../GameContext'
import { keys, type Debt } from '../logic'
import { ConfirmButton } from './TaskCard'
import { Avatar, Niche } from './bits'

/** A glass that fills up as beers get paid. */
function BeerGlass({ paid, total }: { paid: number; total: number }) {
  const reduce = useReducedMotion()
  const level = total === 0 ? 0 : paid / total
  return (
    <div className="relative h-36 w-24 shrink-0" aria-hidden>
      <div className="absolute inset-x-0 bottom-0 top-3 overflow-hidden rounded-b-[28px] rounded-t-lg border-4 border-ink/70 bg-surface">
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-gold"
          initial={false}
          animate={{ height: `${level * 100}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        >
          <div className="absolute inset-x-0 -top-3 h-4 rounded-full bg-[#fff9f0]" />
          {!reduce &&
            [18, 42, 66].map((x, i) => (
              <motion.span
                key={x}
                className="absolute bottom-0 h-2 w-2 rounded-full bg-[#fff9f0]/70"
                style={{ left: `${x}%` }}
                animate={{ y: [0, -80], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
              />
            ))}
        </motion.div>
      </div>
      <div className="absolute -right-4 top-10 h-14 w-6 rounded-r-2xl border-4 border-l-0 border-ink/70" />
    </div>
  )
}

/** Open strokes as tally marks, paid rounds stay faint */
function Tally({ open, paid }: { open: number; paid: number }) {
  return (
    <span className="flex h-6 flex-wrap items-end justify-center gap-[3px]" aria-hidden>
      {Array.from({ length: open + paid }, (_, i) => (
        <span key={i} className={`h-5 w-[5px] rounded-full ${i < open ? 'bg-ink' : 'bg-ink/20'}`} />
      ))}
    </span>
  )
}

/** Whoever has the most open strokes buys next, on a tie the one with the oldest stroke */
function nextBuyer(open: Debt[]): { player: PlayerId; debt: Debt } | null {
  if (open.length === 0) return null
  const count = (p: PlayerId) => open.filter((d) => d.debtor === p).length
  const oldest = (p: PlayerId) => open.findIndex((d) => d.debtor === p)
  const player = PLAYER_IDS.filter((p) => count(p) > 0).sort((a, b) => count(b) - count(a) || oldest(a) - oldest(b))[0]
  return { player, debt: open[oldest(player)] }
}

function NextRound({ open }: { open: Debt[] }) {
  const { send } = useGame()
  const reduce = useReducedMotion()
  const next = nextBuyer(open)
  if (!next) return null
  const others = PLAYER_IDS.filter((p) => p !== next.player)
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.section
        key={`${next.debt.station}-${next.player}`}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="rounded-3xl bg-surface p-5 shadow-[var(--shadow)]"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-accent">Nächste Runde</p>
        <div className="mt-2 flex items-center gap-4">
          <Avatar id={next.player} size={72} ring />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[30px] font-extrabold leading-none">{crewById(next.player).name}</p>
            <p className="mt-1 text-[15px] text-ink-soft">3 Bier für {others.map((p) => crewById(p).name).join(', ').replace(/, ([^,]*)$/, ' und $1')}</p>
          </div>
        </div>
        <ConfirmButton
          label="Runde bestellt"
          confirmLabel="Steht sie schon auf dem Tisch?"
          onConfirm={() => send({ key: keys.paid(next.debt.station, next.player), kind: 'paid', player: next.player, task: next.debt.station })}
          className="clay-btn mt-4 h-14 w-full rounded-full bg-accent font-semibold text-on-accent"
        />
      </motion.section>
    </AnimatePresence>
  )
}

export function BierTab() {
  const { game } = useGame()
  const [showLog, setShowLog] = useState(false)
  const total = game.debts.length
  const paid = game.debts.filter((d) => d.paid).length
  const open = game.debts.filter((d) => !d.paid)
  const perPlayer = PLAYER_IDS.map((p) => ({
    p,
    open: open.filter((d) => d.debtor === p).length,
    paid: game.debts.filter((d) => d.debtor === p && d.paid).length,
  }))
  const most = Math.max(...perPlayer.map((x) => x.open + x.paid))
  const worstList = perPlayer.filter((x) => x.open + x.paid === most)
  const worst = most > 0 && worstList.length === 1 ? worstList[0].p : null

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-5">
        <BeerGlass paid={paid} total={total} />
        <div className="mb-2 flex-1">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight">Rundenzettel</h1>
          <p className="text-ink-soft">
            {total === 0 ? 'Noch keine Striche. Das ändert sich.' : open.length === 0 ? `Alle ${total} Runden geholt. Prost.` : `${paid} von ${total} Runden geholt.`}
          </p>
        </div>
      </div>

      <NextRound open={open} />

      {total > 0 && (
        <div>
          <h2 className="font-display text-xl font-extrabold">Striche</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {perPlayer.map(({ p, open: o, paid: pd }) => (
              <div key={p} className="flex flex-col items-center gap-1 rounded-2xl bg-surface p-2 shadow-[var(--shadow)]">
                <Avatar id={p} size={44} />
                <Tally open={o} paid={pd} />
                <span className="text-xs text-ink-soft">{o > 0 ? `${o} offen` : pd > 0 ? `${pd} geholt` : 'sauber'}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-ink-soft">Kräftige Striche sind offen, blasse schon geholt.</p>
        </div>
      )}

      {worst && (
        <div className="flex items-end gap-4 rounded-3xl bg-rose/25 p-4">
          <Niche src="img/hahn-traurig.webp" alt="Der Hahn weint ins Bier" className="h-[110px] w-[76px]" zoom={1.15} focus="50% 40%" />
          <p className="mb-2 flex-1 text-[15px]">
            <span className="font-semibold">{crewById(worst).name}</span> hält gerade die Brauerei am Leben. Danke für deinen Dienst.
          </p>
        </div>
      )}

      {total > 0 && (
        <div>
          <button type="button" onClick={() => setShowLog((v) => !v)} aria-expanded={showLog} className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4">
            {showLog ? 'Verlauf ausblenden' : 'Wer hat wofür einen Strich?'}
          </button>
          {showLog && (
            <ul className="mt-2 divide-y divide-line rounded-3xl bg-surface px-4 shadow-[var(--shadow)]">
              {game.debts.map((d) => (
                <li key={`${d.station}-${d.debtor}`} className="flex items-center gap-3 py-3">
                  <Avatar id={d.debtor} size={32} dim={d.paid} />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{crewById(d.debtor).name}</span>
                    <span className="text-ink-soft"> · {STATIONS.find((s) => s.id === d.station)!.name}</span>
                  </span>
                  <span className={`text-sm font-semibold ${d.paid ? 'text-accent' : 'text-ink-soft'}`}>{d.paid ? 'geholt' : 'offen'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {total === 0 && (
        <div className="flex items-end gap-4">
          <Niche src="img/hahn-denkt.webp" alt="Der Hahn überlegt" className="h-[150px] w-[104px]" zoom={1.15} focus="50% 40%" />
          <p className="mb-3 flex-1 text-ink-soft">Der Hahn wartet schon im Red Rooster. Wer an einer Station Letzter wird, kriegt hier einen Strich. Jeder Strich ist eine Runde.</p>
        </div>
      )}
    </div>
  )
}
