import { useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, BeerStein, NavigationArrow } from '@phosphor-icons/react'
import { PLAYER_IDS, crewById } from '../../data/trip'
import { useGame } from '../GameContext'
import type { StationState } from '../logic'
import { TaskCard } from './TaskCard'
import { Avatar, Niche } from './bits'

const mapsLink = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

function StationResult({ st }: { st: StationState }) {
  const reduce = useReducedMotion()
  const ranked = [...PLAYER_IDS].sort((a, b) => st.points[b] - st.points[a])
  const loserNames = st.losers.map((p) => crewById(p).name).join(' und ')
  const creditorNames =
    st.winners.length === 0 ? 'die anderen' : st.winners.length === 1 ? crewById(st.winners[0]).name : `${st.winners.map((p) => crewById(p).name).join(' oder ')}. Die klären unter sich, wer es kriegt`
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow)]"
    >
      <div className="flex items-end gap-4 bg-rose/25 p-5">
        <Niche src="img/hahn-prost.webp" alt="Der Hahn hebt den Krug" className="h-[120px] w-[84px]" zoom={1.15} focus="50% 40%" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-soft">Station erledigt</p>
          <p className="font-display text-2xl font-extrabold leading-tight">
            {loserNames} {st.losers.length > 1 ? 'schulden' : 'schuldet'} ein Bier.
          </p>
          <p className="text-[15px] text-ink-soft">An {creditorNames}. Wird abends im Red Rooster eingelöst.</p>
        </div>
      </div>
      <ol className="divide-y divide-line px-5 py-2">
        {ranked.map((p) => (
          <li key={p} className="flex items-center gap-3 py-2">
            <span className="w-5 font-display font-extrabold text-ink-soft">{1 + ranked.filter((q) => st.points[q] > st.points[p]).length}</span>
            <Avatar id={p} size={36} />
            <span className="flex-1 font-semibold">{crewById(p).name}</span>
            {st.losers.includes(p) && <BeerStein size={20} weight="bold" className="text-rose" aria-label="zahlt" />}
            <span className="w-14 text-right font-display text-lg font-extrabold tabular-nums">{st.points[p]} P</span>
          </li>
        ))}
      </ol>
    </motion.section>
  )
}

export function StationPage({ stationId, onBack, onNext }: { stationId: string; onBack: () => void; onNext: (id: string) => void }) {
  const { game } = useGame()
  const st = game.stations.find((s) => s.station.id === stationId)!
  const s = st.station
  const following = game.stations.find((x) => x.index > st.index && !x.done)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [stationId])

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="clay-soft flex h-11 items-center gap-2 rounded-full pl-3 pr-4 font-semibold">
          <ArrowLeft size={20} weight="bold" /> Tour
        </button>
        <a href={mapsLink(s.lat, s.lng)} target="_blank" rel="noreferrer" className="clay-soft flex h-11 items-center gap-2 rounded-full px-4 font-semibold">
          <NavigationArrow size={20} weight="bold" /> Hinlaufen
        </a>
      </div>

      <header className="mt-6 flex items-end gap-4">
        <Niche src={`img/${s.pose}.webp`} alt="August" className="h-[170px] w-[112px]" />
        <div className="mb-2 min-w-0 flex-1">
          <p className="text-sm font-semibold text-accent">
            Station {st.index + 1} von {game.stations.length}
          </p>
          <h1 className="font-display text-[clamp(30px,8.5vw,36px)] font-extrabold leading-[1.02] tracking-tight hyphens-auto [overflow-wrap:anywhere]">{s.name}</h1>
          <p className="text-ink-soft">{s.place}</p>
        </div>
      </header>

      <p className="mt-5 rounded-3xl rounded-tl-md bg-surface px-4 py-3 text-[16px] leading-snug shadow-[var(--shadow)]">
        <span className="font-semibold">August: </span>
        {s.intro}
      </p>

      {s.facts.length > 0 && (
        <section aria-label="Kurz erklärt" className="mt-6">
          <h2 className="font-display text-xl font-extrabold">Kurz erklärt</h2>
          <ul className="mt-2 space-y-2">
            {s.facts.map((f) => (
              <li key={f} className="rounded-2xl border-2 border-line p-3 text-[15px] leading-relaxed">
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 space-y-4">
        <TaskCard state={st.slots[0]} number={1} />
        <TaskCard state={st.slots[1]} number={2} />
        {st.tiebreak && <TaskCard state={st.tiebreak} tiebreak />}
        {st.tasksDone && !st.done && st.tiebreak?.phase !== 'done' && (
          <p className="text-center text-sm text-ink-soft">Gleichstand ganz unten. Das Stechen entscheidet, wer zahlt.</p>
        )}
        {st.done && <StationResult st={st} />}
        {st.done && following && (
          <button type="button" onClick={() => onNext(following.station.id)} className="clay-btn h-14 w-full rounded-full bg-accent font-display text-lg font-extrabold text-on-accent">
            Weiter zu {following.station.name}
          </button>
        )}
      </div>
    </div>
  )
}
