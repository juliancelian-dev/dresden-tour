import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { asset } from '../data/trip'

const SPARKS = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)

export function CoinBlock() {
  const reduce = useReducedMotion()
  const [taps, setTaps] = useState(0)

  return (
    <section aria-labelledby="coin-title" className="mt-16 overflow-hidden rounded-[28px] bg-cobalt px-6 pb-6 pt-7 text-[#fff9f0] shadow-[var(--shadow)]">
      <h2 id="coin-title" className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
        Landskron Coins
      </h2>
      <p className="mt-2 max-w-[30ch] text-[#e4e8f5]">
        Die Währung des Tages. Gibt es für gewonnene Aufgaben. Wofür man sie ausgibt, verrät August erst vor Ort.
      </p>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="relative">
          <motion.button
            type="button"
            aria-label="Coin antippen"
            onClick={() => setTaps((t) => t + 1)}
            whileTap={{ scale: 0.92 }}
            animate={reduce ? undefined : { rotateY: taps * 360 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="relative block h-32 w-32"
            style={{ transformPerspective: 600 }}
          >
            <img src={asset('img/coin.webp')} alt="" className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
          </motion.button>
          <AnimatePresence>
            {!reduce &&
              SPARKS.map((a, i) => (
                <motion.span
                  key={`${taps}-${i}`}
                  aria-hidden
                  initial={{ x: 0, y: 0, opacity: taps ? 1 : 0, scale: 0.6 }}
                  animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 80, opacity: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-gold"
                />
              ))}
          </AnimatePresence>
          <p className="mt-2 font-display text-lg font-extrabold tabular-nums" aria-live="polite">
            {taps === 0 ? 'Tipp mal drauf' : `${taps} ${taps === 1 ? 'Coin' : 'Coins'} erschnorrt`}
          </p>
          {taps > 0 && <p className="text-sm text-[#c9d1ea]">Zählt nicht. Netter Versuch.</p>}
        </div>
        <img
          src={asset('img/loewe.webp')}
          alt="Der Löwe aus dem Stadtwappen hält einen Coin"
          width={140}
          height={205}
          loading="lazy"
          className="-mb-6 w-[132px] shrink-0 drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]"
        />
      </div>
    </section>
  )
}
