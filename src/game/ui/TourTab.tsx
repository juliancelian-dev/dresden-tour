import { CaretRight, CheckCircle } from '@phosphor-icons/react'
import { crewById } from '../../data/trip'
import { useGame } from '../GameContext'
import { MapView } from './MapView'
import { Niche } from './bits'

export function TourTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { game } = useGame()
  const next = game.nextStation
  const doneCount = game.stations.filter((s) => s.done).length

  return (
    <div className="space-y-6">
      <MapView stations={game.stations} nextId={next?.station.id} onOpen={onOpen} />

      {next ? (
        <button
          type="button"
          onClick={() => onOpen(next.station.id)}
          className="flex w-full items-center gap-4 rounded-3xl bg-accent p-4 text-left text-on-accent shadow-[var(--shadow)] transition-transform active:scale-[0.98]"
        >
          <Niche src={`img/${next.station.pose}.webp`} alt="" className="h-[96px] w-[64px]" />
          <span className="flex-1">
            <span className="block text-sm font-semibold opacity-80">
              {next.started ? 'Läuft gerade' : doneCount === 0 ? 'Erste Station' : 'Nächste Station'} · {next.index + 1} von {game.stations.length}
            </span>
            <span className="block font-display text-2xl font-extrabold leading-tight">{next.station.name}</span>
            <span className="block text-sm opacity-80">{next.station.place}</span>
          </span>
          <CaretRight size={24} weight="bold" />
        </button>
      ) : (
        <div className="rounded-3xl bg-gold p-5 text-[#16302a] shadow-[var(--shadow)]">
          <p className="font-display text-2xl font-extrabold">Tour geschafft.</p>
          <p>Ab zum Watzke, danach ins Red Rooster. Schaut unter Bier, wer was schuldet.</p>
        </div>
      )}

      <section aria-labelledby="stations-title">
        <h2 id="stations-title" className="font-display text-xl font-extrabold">
          Alle Stationen
        </h2>
        <ol className="mt-3 divide-y divide-line overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow)]">
          {game.stations.map((s) => (
            <li key={s.station.id}>
              <button type="button" onClick={() => onOpen(s.station.id)} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:bg-page">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-extrabold ${s.done ? 'bg-gold text-[#16302a]' : s === next ? 'bg-rose text-[#16302a]' : 'bg-page text-ink'}`}
                >
                  {s.done ? <CheckCircle size={20} weight="bold" /> : s.index + 1}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{s.station.name}</span>
                  <span className="block text-sm text-ink-soft">
                    {s.done
                      ? `${s.losers.map((p) => crewById(p).name).join(' und ')} ${s.losers.length > 1 ? 'zahlen' : 'zahlt'} ein Bier`
                      : s.started
                        ? 'Läuft'
                        : s.station.place}
                  </span>
                </span>
                <CaretRight size={18} weight="bold" className="text-ink-soft" />
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-ink-soft">Danach: Watzke am Goldenen Reiter, dann Red Rooster.</p>
      </section>
    </div>
  )
}
