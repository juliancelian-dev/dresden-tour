import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CREW, asset } from '../data/trip'

const TEASES = [
  'Schulden: 0 Bier. Noch.',
  'Hat schon mal geübt, ein Bier auszugeben.',
  'Behauptet, er kennt Dresden.',
  'Wird beim Schätzen raten.',
  'Sieht aus wie einer, der zahlt.',
]

export function Crew() {
  const reduce = useReducedMotion()
  const [picked, setPicked] = useState<string | null>(null)
  const [tease, setTease] = useState(TEASES[0])

  const pick = (id: string) => {
    setPicked(id)
    setTease(TEASES[Math.floor(Math.random() * TEASES.length)])
  }

  return (
    <section aria-labelledby="crew-title" className="mt-16">
      <h2 id="crew-title" className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
        Die Verdächtigen
      </h2>
      <p className="mt-2 text-ink-soft">Vier Mann, einer zahlt. Tippt auf einen.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {CREW.map((m, i) => {
          const active = picked === m.id
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => pick(m.id)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-3xl bg-surface p-3 text-left shadow-[var(--shadow)] outline-offset-2 transition-colors ${active ? 'ring-4 ring-accent' : ''}`}
            >
              <motion.img
                src={asset(`img/avatar-${m.id}.webp`)}
                alt={`Knetfigur von ${m.name}`}
                width={240}
                height={240}
                loading="lazy"
                animate={active && !reduce ? { rotate: [0, -6, 6, -3, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="aspect-square w-full rounded-full bg-niche object-cover"
              />
              <span className="mt-2 font-display text-xl font-extrabold">{m.name}</span>
              <span className="min-h-[1.5em] text-sm text-ink-soft">
                {active ? tease : m.nickname ? `alias ${m.nickname}` : 'der mit der App'}
              </span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
