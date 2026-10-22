import { motion, useReducedMotion } from 'motion/react'
import { CREW, type PlayerId } from '../../data/trip'
import { Avatar, Niche } from './bits'

export function PickPlayer({ joined, onPick }: { joined: PlayerId[]; onPick: (id: PlayerId) => void }) {
  const reduce = useReducedMotion()
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[560px] flex-col justify-center px-5 pb-[calc(32px+env(safe-area-inset-bottom,0px))] pt-[calc(24px+env(safe-area-inset-top,0px))]">
      <div className="flex items-end gap-4">
        <Niche src="img/august-zeigt.webp" alt="August zeigt auf dich" className="h-[180px] w-[120px]" />
        <div className="mb-4 rounded-3xl rounded-bl-md bg-surface px-4 py-3 text-[15px] leading-snug shadow-[var(--shadow)]">
          Wer bist du? Und lüg nicht, ich sehe alles.
        </div>
      </div>
      <h1 className="mt-6 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight">Wähl dich aus.</h1>
      <p className="mt-2 text-ink-soft">Einmal pro Handy. Der Spielstand hängt an deinem Namen.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {CREW.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => onPick(m.id)}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center rounded-3xl bg-surface p-3 shadow-[var(--shadow)]"
          >
            <Avatar id={m.id} size={112} />
            <span className="mt-2 font-display text-xl font-extrabold">{m.name}</span>
            <span className="text-sm text-ink-soft">{joined.includes(m.id) ? 'schon dabei' : m.tag}</span>
          </motion.button>
        ))}
      </div>
    </main>
  )
}
