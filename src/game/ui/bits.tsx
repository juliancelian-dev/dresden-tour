import { motion, useReducedMotion } from 'motion/react'
import { asset, crewById, type PlayerId } from '../../data/trip'

export function Avatar({ id, size = 40, dim = false, ring = false }: { id: PlayerId; size?: number; dim?: boolean; ring?: boolean }) {
  return (
    <img
      src={asset(`img/avatar-${id}.webp`)}
      alt={crewById(id).name}
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-niche object-cover transition-[opacity,filter] ${dim ? 'opacity-35 grayscale' : ''} ${ring ? 'ring-3 ring-accent' : ''}`}
      style={{ width: size, height: size }}
    />
  )
}

export function Coin({ size = 20 }: { size?: number }) {
  return <img src={asset('img/coin-icon.png')} alt="" aria-hidden width={size} height={size} className="inline-block shrink-0" style={{ width: size, height: size }} />
}

/** August (or another figure) in a sandstone niche. */
export function Niche({ src, alt, className = '', zoom = 1.3, focus = '50% 42%' }: { src: string; alt: string; className?: string; zoom?: number; focus?: string }) {
  return (
    <div className={`niche shrink-0 ${className}`}>
      <img src={asset(src)} alt={alt} className="h-full w-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: focus }} />
    </div>
  )
}

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-display text-[28px] font-extrabold leading-[1.05] tracking-tight">
      {children}
    </h2>
  )
}

/** Small "points flew in" bubble. */
export function PointsPop({ value }: { value: number }) {
  const reduce = useReducedMotion()
  if (value <= 0) return <span className="font-display text-lg font-extrabold text-ink-soft tabular-nums">0</span>
  return (
    <motion.span
      initial={reduce ? false : { scale: 0.4, y: 6, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 font-display text-lg font-extrabold text-[#16302a] tabular-nums"
    >
      +{value}
    </motion.span>
  )
}

export function fmtNumber(n: number) {
  // Years like 1985 read wrong with a thousands dot, so only group from five digits
  return n.toLocaleString('de-DE', { maximumFractionDigits: 2, useGrouping: Math.abs(n) >= 10000 })
}
