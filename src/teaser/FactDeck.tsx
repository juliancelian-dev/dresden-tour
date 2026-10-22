import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { FACTS, asset } from '../data/trip'

const SWIPE = 60

export function FactDeck() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const direction = useRef(1)
  const fact = FACTS[index]

  const go = (step: number) => {
    direction.current = step
    setIndex((i) => (i + step + FACTS.length) % FACTS.length)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE) go(1)
    else if (info.offset.x > SWIPE) go(-1)
  }

  const offset = reduce ? 0 : 60

  return (
    <section aria-labelledby="facts-title" className="mt-16">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <h2 id="facts-title" className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
            Schon mal vorglühen
          </h2>
          <p className="mt-2 text-ink-soft">Acht Fakten über Dresden. Keiner davon hilft euch bei den Aufgaben.</p>
        </div>
        <div className="niche h-28 w-20 shrink-0">
          <img src={asset('img/august-denkt.webp')} alt="August grübelt" className="h-full w-full scale-[1.35] object-cover object-[50%_35%]" />
        </div>
      </div>

      <div className="relative mt-5 grid" style={{ touchAction: 'pan-y' }}>
        {/* Invisible copies of every fact keep the box as tall as the longest one */}
        {FACTS.map((f) => (
          <div key={f.title} aria-hidden className="invisible col-start-1 row-start-1 p-6">
            <span className="text-sm">.</span>
            <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight">{f.title}</h3>
            <p className="mt-3 text-[17px] leading-relaxed">{f.body}</p>
          </div>
        ))}
        <AnimatePresence initial={false} mode="popLayout" custom={direction.current}>
          <motion.article
            key={index}
            custom={direction.current}
            drag={reduce ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            initial={{ x: direction.current * offset, opacity: 0, rotate: reduce ? 0 : direction.current * 2 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -direction.current * offset, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute inset-0 flex cursor-grab flex-col rounded-3xl bg-surface p-6 shadow-[var(--shadow)] active:cursor-grabbing"
            aria-live="polite"
          >
            <span className="text-sm font-semibold text-accent">
              Fakt {index + 1} von {FACTS.length}
            </span>
            <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">{fact.title}</h3>
            <p className="mt-3 text-[17px] leading-relaxed">{fact.body}</p>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Vorheriger Fakt"
          className="grid h-12 w-12 place-items-center rounded-full bg-surface text-ink shadow-[var(--shadow)] transition-transform active:scale-95"
        >
          <ArrowLeft size={22} weight="bold" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent/15" aria-hidden>
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${((index + 1) / FACTS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="clay-btn flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-on-accent"
        >
          Weiter
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </section>
  )
}
