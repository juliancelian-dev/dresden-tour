import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { asset } from '../data/trip'

const POSES = [
  { src: 'img/hahn-prost.webp', alt: 'Der Red-Rooster-Hahn als Knetfigur hebt einen Bierkrug' },
  { src: 'img/hahn-bier.webp', alt: 'Der Hahn drückt seinen Bierkrug an sich und lacht' },
  { src: 'img/hahn-jubel.webp', alt: 'Der Hahn jubelt im Konfettiregen' },
]

export function RoosterBlock() {
  const reduce = useReducedMotion()
  const [pose, setPose] = useState(0)

  return (
    <section aria-labelledby="rooster-title" className="mt-16">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <span className="text-sm font-semibold text-accent">Endstation</span>
          <h2 id="rooster-title" className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
            Red Rooster
          </h2>
          <p className="mt-2 text-ink-soft">
            Abends wird abgerechnet. Jede verlorene Station ist ein Bier, und der Hahn schaut zu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPose((p) => (p + 1) % POSES.length)}
          aria-label="Hahn antippen"
          className="niche relative h-[200px] w-[136px] shrink-0 transition-transform active:scale-[0.97]"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={pose}
              src={asset(POSES[pose].src)}
              alt={POSES[pose].alt}
              loading="lazy"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute inset-0 h-full w-full scale-[1.15] object-cover object-[50%_40%]"
            />
          </AnimatePresence>
        </button>
      </div>
    </section>
  )
}
