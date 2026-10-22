import { motion, useReducedMotion } from 'motion/react'
import { MapPin, BeerStein, Trophy } from '@phosphor-icons/react'
import { Countdown } from './Countdown'
import { Crew } from './Crew'
import { FactDeck } from './FactDeck'
import { CoinBlock } from './CoinBlock'
import { asset } from '../data/trip'

const RULES = [
  { icon: MapPin, title: 'Neun Stationen', body: 'Vom Zwinger bis zum Goldenen Reiter. Die App kennt den Weg.' },
  { icon: Trophy, title: 'An jeder Station ein Duell', body: 'Schätzen, raten, suchen, fotografieren. Wer am besten ist, kassiert Coins.' },
  { icon: BeerStein, title: 'Der Letzte zahlt', body: 'Wer an einer Station hinten liegt, schuldet abends ein Bier. Die App vergisst nichts.' },
]

export function Teaser() {
  const reduce = useReducedMotion()

  return (
    <main className="mx-auto max-w-[560px] px-5 pb-[calc(48px+env(safe-area-inset-bottom,0px))] pt-[calc(20px+env(safe-area-inset-top,0px))]">
      <section className="flex min-h-[100svh] flex-col justify-center gap-6 py-6">
        <div className="flex items-end gap-4">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="niche h-[230px] w-[150px] shrink-0 sm:h-[270px] sm:w-[176px]"
          >
            <motion.img
              src={asset('img/august-zeigt.webp')}
              alt="August der Starke als goldene Knetfigur auf seinem Pferd, er zeigt nach vorn"
              fetchPriority="high"
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-full scale-[1.3] object-cover object-[50%_42%]"
            />
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.12 }}
            className="relative mb-6 rounded-3xl rounded-bl-md bg-surface px-4 py-3 text-[15px] leading-snug shadow-[var(--shadow)]"
          >
            Ich bin August. Am 12.12. jage ich euch durch meine Stadt.
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.2 }}
        >
          <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-tight">
            Dresden ruft.
            <br />
            <span className="text-accent">Einer zahlt.</span>
          </h1>
          <p className="mt-3 max-w-[34ch] text-[17px] text-ink-soft">
            Sightseeing mit Duellen, Coins und einer Bier-Liste, die nicht vergisst.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.28 }}
        >
          <Countdown />
        </motion.div>
      </section>

      <Crew />
      <FactDeck />

      <section aria-labelledby="rules-title" className="mt-16">
        <h2 id="rules-title" className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
          So läuft der Tag
        </h2>
        <ul className="mt-5 space-y-5">
          {RULES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent">
                <Icon size={24} weight="bold" />
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold">{title}</h3>
                <p className="text-ink-soft">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <CoinBlock />

      <section className="mt-16 text-center">
        <div className="niche mx-auto h-[220px] w-[160px]">
          <img
            src={asset('img/august-traurig.webp')}
            alt="August schaut traurig und hält einen Bierkrug hin"
            loading="lazy"
            className="h-full w-full scale-[1.3] object-cover object-[50%_42%]"
          />
        </div>
        <h2 className="mt-6 font-display text-[28px] font-extrabold leading-tight tracking-tight">So guckt der Verlierer.</h2>
        <p className="mx-auto mt-2 max-w-[32ch] text-ink-soft">
          Das Spiel startet am 12.12. in der Altstadt. Bis dahin: Link speichern und zum Homescreen hinzufügen.
        </p>
      </section>
    </main>
  )
}
