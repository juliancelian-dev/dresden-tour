import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { TRIP_START } from '../data/trip'

function remaining(now: number) {
  const ms = Math.max(0, TRIP_START.getTime() - now)
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion()
  const text = label === 'Tage' ? String(value) : String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center rounded-3xl bg-surface px-2 pb-2 pt-3 shadow-[var(--shadow)]">
      <div className="relative h-11 w-full overflow-hidden text-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text}
            initial={reduce ? false : { y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="block font-display text-[40px] font-extrabold leading-[44px] tabular-nums tracking-tight"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-sm text-ink-soft">{label}</span>
    </div>
  )
}

export function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const t = remaining(now)

  if (t.done) {
    return (
      <div className="rounded-3xl bg-accent px-5 py-4 text-center font-display text-2xl font-extrabold text-on-accent">
        Es geht los. Auf nach Dresden.
      </div>
    )
  }

  return (
    <div role="timer" aria-label={`Noch ${t.days} Tage, ${t.hours} Stunden und ${t.minutes} Minuten bis zur Abfahrt`}>
      <div className="grid grid-cols-4 gap-2">
        <Unit value={t.days} label="Tage" />
        <Unit value={t.hours} label="Std" />
        <Unit value={t.minutes} label="Min" />
        <Unit value={t.seconds} label="Sek" />
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">bis zur Abfahrt in Hannover, Samstag 12.12. um 8 Uhr</p>
    </div>
  )
}
