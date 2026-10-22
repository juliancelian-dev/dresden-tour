import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PLAYER_IDS, crewById } from '../../data/trip'
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

function DebtRow({ debt }: { debt: Debt }) {
  const { send } = useGame()
  const reduce = useReducedMotion()
  const station = STATIONS.find((s) => s.id === debt.station)!
  return (
    <motion.li
      layout={!reduce}
      className={`flex items-center gap-3 rounded-3xl p-3 shadow-[var(--shadow)] ${debt.paid ? 'bg-surface/60' : 'bg-surface'}`}
    >
      <div className="flex shrink-0 items-center -space-x-2">
        <Avatar id={debt.debtor} size={44} dim={debt.paid} />
        {debt.creditors.map((c) => (
          <Avatar key={c} id={c} size={32} dim={debt.paid} />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold leading-tight ${debt.paid ? 'text-ink-soft line-through' : ''}`}>
          {crewById(debt.debtor).name} <span className="font-normal text-ink-soft">an</span> {debt.creditors.map((c) => crewById(c).name).join(' oder ')}
        </p>
        <p className="text-sm text-ink-soft">{station.name}</p>
      </div>
      {debt.paid ? (
        <span className="text-sm font-semibold text-accent">bezahlt</span>
      ) : (
        <ConfirmButton
          label="Bezahlt"
          confirmLabel="Echt jetzt?"
          onConfirm={() => send({ key: keys.paid(debt.station, debt.debtor), kind: 'paid', player: debt.debtor, task: debt.station })}
          className="clay-btn h-11 shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-on-accent"
        />
      )}
    </motion.li>
  )
}

export function BierTab() {
  const { game } = useGame()
  const reduce = useReducedMotion()
  const [showPaid, setShowPaid] = useState(false)
  const total = game.debts.length
  const paid = game.debts.filter((d) => d.paid).length
  const open = game.debts.filter((d) => !d.paid)
  const perPlayer = PLAYER_IDS.map((p) => ({ p, n: open.filter((d) => d.debtor === p).length })).sort((a, b) => b.n - a.n)
  const worst = perPlayer[0].n > 0 && perPlayer[0].n !== perPlayer[1].n ? perPlayer[0].p : null

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-5">
        <BeerGlass paid={paid} total={total} />
        <div className="mb-2 flex-1">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight">Bier-Liste</h1>
          <p className="text-ink-soft">
            {total === 0 ? 'Noch schuldet keiner was. Das ändert sich.' : `${paid} von ${total} Bier bezahlt.`}
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {perPlayer.map(({ p, n }) => (
            <div key={p} className="flex flex-col items-center rounded-2xl bg-surface p-2 shadow-[var(--shadow)]">
              <Avatar id={p} size={44} />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={n}
                  initial={reduce ? false : { y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${n > 0 ? 'text-ink' : 'text-ink-soft'}`}
                >
                  {n}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-ink-soft">offen</span>
            </div>
          ))}
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

      {open.length > 0 && (
        <ul className="space-y-2">
          {open.map((d) => (
            <DebtRow key={`${d.station}-${d.debtor}`} debt={d} />
          ))}
        </ul>
      )}

      {paid > 0 && (
        <div>
          <button type="button" onClick={() => setShowPaid((v) => !v)} className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4">
            {showPaid ? 'Bezahlte ausblenden' : `Bezahlte zeigen (${paid})`}
          </button>
          {showPaid && (
            <ul className="mt-2 space-y-2">
              {game.debts
                .filter((d) => d.paid)
                .map((d) => (
                  <DebtRow key={`${d.station}-${d.debtor}`} debt={d} />
                ))}
            </ul>
          )}
        </div>
      )}

      {total === 0 && (
        <div className="flex items-end gap-4">
          <Niche src="img/hahn-denkt.webp" alt="Der Hahn überlegt" className="h-[150px] w-[104px]" zoom={1.15} focus="50% 40%" />
          <p className="mb-3 flex-1 text-ink-soft">Der Hahn wartet schon im Red Rooster. Wer an einer Station Letzter wird, landet hier.</p>
        </div>
      )}
    </div>
  )
}
