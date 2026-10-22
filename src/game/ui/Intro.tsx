import { BeerStein, Coins, MapPin, Trophy } from '@phosphor-icons/react'
import { crewById, type PlayerId } from '../../data/trip'
import { PRICES, START_COINS } from '../config'
import { Niche } from './bits'

const RULES = [
  { icon: MapPin, title: 'Neun Stationen', body: 'Vom Zwinger bis zum Goldenen Reiter. Die Karte zeigt, wo es langgeht.' },
  { icon: Trophy, title: 'Zwei Aufgaben pro Station', body: 'Jeder tippt auf seinem Handy. Aufgelöst wird, wenn alle drin sind.' },
  { icon: Coins, title: 'Landskron Coins', body: `Ihr startet mit ${START_COINS}. Jeder Punkt bringt einen Coin. Ein Tipp kostet ${PRICES.hint}, ein 50:50 kostet ${PRICES.fifty}.` },
  { icon: BeerStein, title: 'Der Letzte zahlt', body: 'Wer an einer Station am wenigsten Punkte hat, schuldet dem Sieger abends ein Bier. Bei Gleichstand gibt es ein Stechen.' },
]

export function Intro({ me, onDone }: { me: PlayerId; onDone: () => void }) {
  return (
    <main className="mx-auto max-w-[560px] px-5 pb-[calc(32px+env(safe-area-inset-bottom,0px))] pt-[calc(24px+env(safe-area-inset-top,0px))]">
      <div className="flex items-end gap-4">
        <Niche src="img/august-jubel.webp" alt="August jubelt" className="h-[180px] w-[120px]" />
        <div className="mb-4 rounded-3xl rounded-bl-md bg-surface px-4 py-3 text-[15px] leading-snug shadow-[var(--shadow)]">
          Servus, {crewById(me).name}. Kurz die Regeln, dann geht es los.
        </div>
      </div>
      <ul className="mt-8 space-y-5">
        {RULES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent">
              <Icon size={24} weight="bold" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold">{title}</h2>
              <p className="text-ink-soft">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-2xl bg-surface p-4 text-[15px] text-ink-soft shadow-[var(--shadow)]">
        Keine Lust auf eine Aufgabe? Wenn alle vier auf Überspringen tippen, gibt es eine Ersatzaufgabe. Davon gibt es eine pro Station.
      </p>
      <button type="button" onClick={onDone} className="clay-btn mt-8 h-14 w-full rounded-full bg-accent font-display text-lg font-extrabold text-on-accent">
        Los geht’s
      </button>
    </main>
  )
}
