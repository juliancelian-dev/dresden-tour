import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle, Lightbulb, LockSimple, SkipForward, XCircle } from '@phosphor-icons/react'
import { CREW, PLAYER_IDS, crewById, type PlayerId } from '../../data/trip'
import type { Task } from '../../data/stations'
import { PRICES } from '../config'
import { useGame } from '../GameContext'
import { fiftyHidden, hasBought, keys, optionOrder, type TaskState } from '../logic'
import { Avatar, Coin, PointsPop, fmtNumber } from './bits'

const TYPE_LABEL: Record<Task['type'], string> = {
  estimate: 'Schätzen',
  count: 'Schätzen und zählen',
  quiz: 'Quiz',
  first: 'Wer zuerst',
  passant: 'Ein Passant entscheidet',
  vote: 'Abstimmung',
}

/** Two taps for anything that affects everyone. */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className,
  disabled,
}: {
  label: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  className: string
  disabled?: boolean
}) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(t)
  }, [armed])
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
      className={className}
    >
      {armed ? confirmLabel : label}
    </button>
  )
}

/** Accepts "23.000", "23000", "14,6" and "14.6". */
export function parseNumber(raw: string) {
  let s = raw.replace(/\s/g, '')
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  const n = Number(s)
  return s !== '' && Number.isFinite(n) ? n : null
}

function formatAnswer(task: Task, v: number | string | undefined) {
  if (v === undefined) return 'nichts'
  if (task.type === 'quiz') return task.options[Number(v)] ?? '?'
  if (task.type === 'vote') return typeof v === 'string' && (PLAYER_IDS as string[]).includes(v) ? crewById(v as PlayerId).name : '?'
  const unit = 'unit' in task && task.unit ? ` ${task.unit}` : ''
  return `${fmtNumber(Number(v))}${unit}`
}

function NumberForm({ unit, onSubmit, cta }: { unit?: string; onSubmit: (n: number) => Promise<void>; cta: string }) {
  const [raw, setRaw] = useState('')
  const [busy, setBusy] = useState(false)
  const value = parseNumber(raw)
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (value === null || busy) return
        setBusy(true)
        await onSubmit(value)
        setBusy(false)
      }}
    >
      <label className="relative flex-1">
        <span className="sr-only">Deine Zahl</span>
        <input
          inputMode="decimal"
          enterKeyHint="send"
          autoComplete="off"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Deine Zahl"
          className="h-14 w-full rounded-2xl border-2 border-line bg-page px-4 font-display text-xl font-extrabold tabular-nums outline-none focus:border-accent"
        />
        {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft">{unit}</span>}
      </label>
      <button type="submit" disabled={value === null || busy} className="clay-btn h-14 shrink-0 rounded-full bg-accent px-5 font-semibold text-on-accent">
        {cta}
      </button>
    </form>
  )
}

function Waiting({ state }: { state: TaskState }) {
  const { send } = useGame()
  const missing = state.participants.filter((p) => state.answers[p] === undefined)
  return (
    <div className="mt-4 rounded-2xl bg-page p-4">
      <p className="text-sm font-semibold text-ink-soft">Warte auf die anderen</p>
      <div className="mt-2 flex gap-2">
        {state.participants.map((p) => (
          <Avatar key={p} id={p} size={40} dim={state.answers[p] === undefined} />
        ))}
      </div>
      {missing.length > 0 && (
        <ConfirmButton
          label="Nicht alle da? Jetzt auflösen"
          confirmLabel={`Sicher? ${missing.map((p) => crewById(p).name).join(' und ')} kriegt dann 0 Punkte`}
          onConfirm={() => send({ key: keys.force(state.task.id), kind: 'force', task: state.task.id })}
          className="mt-3 min-h-11 text-left text-sm font-semibold text-accent underline underline-offset-4"
        />
      )}
    </div>
  )
}

function Shop({ state }: { state: TaskState }) {
  const { me, game, send, toast } = useGame()
  const t = state.task
  const coins = game.coins[me]
  const boughtHint = hasBought(game, t.id, me, 'hint')
  const boughtFifty = hasBought(game, t.id, me, 'fifty')
  const buy = async (item: 'hint' | 'fifty') => {
    if (coins < PRICES[item]) return toast('Zu wenig Coins. Erst gewinnen, dann shoppen.')
    await send({ key: keys.buy(t.id, me, item), kind: 'buy', player: me, task: t.id, payload: { item } })
  }
  const canFifty = t.type === 'quiz' && t.options.length >= 4
  if (!t.hint && !canFifty) return null
  return (
    <div className="mt-4">
      <AnimatePresence>
        {boughtHint && t.hint && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex gap-2 rounded-2xl bg-gold/20 p-3 text-[15px]"
          >
            <Lightbulb size={20} weight="bold" className="mt-0.5 shrink-0 text-gold-deep" />
            {t.hint}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2">
        {t.hint && !boughtHint && (
          <button type="button" onClick={() => buy('hint')} className="clay-gold flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold">
            <Lightbulb size={18} weight="bold" /> Tipp kaufen <Coin size={18} /> {PRICES.hint}
          </button>
        )}
        {canFifty && !boughtFifty && (
          <button type="button" onClick={() => buy('fifty')} className="clay-gold flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold">
            50:50 <Coin size={18} /> {PRICES.fifty}
          </button>
        )}
      </div>
    </div>
  )
}

function AnswerInput({ state }: { state: TaskState }) {
  const { me, game, send } = useGame()
  const t = state.task
  const [choice, setChoice] = useState<number | string | null>(null)
  const submit = (value: number | string) => send({ key: keys.answer(t.id, me), kind: 'answer', player: me, task: t.id, payload: { value } }).then(() => undefined)

  if (t.type === 'estimate' || t.type === 'count') {
    return (
      <>
        <Shop state={state} />
        <NumberForm unit={t.unit} cta="Tippen" onSubmit={submit} />
      </>
    )
  }

  if (t.type === 'quiz') {
    const hidden = hasBought(game, t.id, me, 'fifty') ? fiftyHidden(t) : []
    return (
      <>
        <Shop state={state} />
        <div className="mt-4 grid gap-2">
          {optionOrder(t).map((i) => [t.options[i], i] as const).map(([o, i]) =>
            hidden.includes(i) ? null : (
              <button
                key={o}
                type="button"
                onClick={() => setChoice(i)}
                aria-pressed={choice === i}
                className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors active:scale-[0.99] ${choice === i ? 'border-accent bg-accent/10' : 'border-line bg-page'}`}
              >
                {o}
              </button>
            ),
          )}
        </div>
        <button type="button" disabled={choice === null} onClick={() => choice !== null && submit(choice)} className="clay-btn mt-4 h-14 w-full rounded-full bg-accent font-semibold text-on-accent">
          Antwort abschicken
        </button>
      </>
    )
  }

  if (t.type === 'vote') {
    return (
      <>
        <p className="mt-4 text-sm font-semibold text-ink-soft">Deine Stimme geht an</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {CREW.filter((m) => m.id !== me).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChoice(m.id)}
              aria-label={m.name}
              aria-pressed={choice === m.id}
              className={`flex flex-col items-center rounded-2xl border-2 p-2 ${choice === m.id ? 'border-accent bg-accent/10' : 'border-line bg-page'}`}
            >
              <Avatar id={m.id} size={56} />
              <span className="mt-1 text-sm font-semibold">{m.name}</span>
            </button>
          ))}
        </div>
        <button type="button" disabled={choice === null} onClick={() => choice !== null && submit(choice)} className="clay-btn mt-4 h-14 w-full rounded-full bg-accent font-semibold text-on-accent">
          Stimme abgeben
        </button>
      </>
    )
  }
  return null
}

function VerdictInput({ state }: { state: TaskState }) {
  const { send } = useGame()
  const [pick, setPick] = useState<PlayerId | null>(null)
  const t = state.task
  return (
    <>
      <p className="mt-4 text-sm font-semibold text-ink-soft">{t.type === 'passant' ? 'Wen hat der Passant gewählt?' : 'Wer war zuerst?'}</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {CREW.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setPick(m.id)}
            aria-label={m.name}
            aria-pressed={pick === m.id}
            className={`flex flex-col items-center rounded-2xl border-2 p-1.5 ${pick === m.id ? 'border-accent bg-accent/10' : 'border-line bg-page'}`}
          >
            <Avatar id={m.id} size={52} />
            <span className="mt-1 text-sm font-semibold">{m.name}</span>
          </button>
        ))}
      </div>
      <ConfirmButton
        disabled={pick === null}
        label="Sieger eintragen"
        confirmLabel="Gilt für alle. Nochmal tippen"
        onConfirm={() => pick && send({ key: keys.verdict(t.id), kind: 'verdict', task: t.id, payload: { winner: pick } })}
        className="clay-btn mt-4 h-14 w-full rounded-full bg-accent font-semibold text-on-accent"
      />
      <p className="mt-2 text-sm text-ink-soft">Einer trägt ein, die anderen nicken ab. Das gilt für alle Handys.</p>
    </>
  )
}

function CountInput({ state }: { state: TaskState }) {
  const { send } = useGame()
  const t = state.task
  const [value, setValue] = useState<number | null>(null)
  return (
    <div className="mt-4 rounded-2xl bg-page p-4">
      <p className="font-semibold">Alle haben getippt. Jetzt zählt gemeinsam.</p>
      <AnswersList state={state} hidePoints />
      {value === null ? (
        <NumberForm unit={'unit' in t ? t.unit : undefined} cta="Gezählt" onSubmit={async (n) => setValue(n)} />
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <span className="flex-1 font-display text-2xl font-extrabold tabular-nums">{fmtNumber(value)}</span>
          <button type="button" onClick={() => setValue(null)} className="clay-soft h-12 rounded-full px-4 text-sm font-semibold">
            Ändern
          </button>
          <ConfirmButton
            label="Eintragen"
            confirmLabel="Sicher?"
            onConfirm={() => send({ key: keys.truth(t.id), kind: 'truth', task: t.id, payload: { value } })}
            className="clay-btn h-12 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent"
          />
        </div>
      )}
    </div>
  )
}

function AnswersList({ state, hidePoints = false }: { state: TaskState; hidePoints?: boolean }) {
  const t = state.task
  const people = t.type === 'vote' ? PLAYER_IDS : state.participants
  return (
    <ul className="mt-3 divide-y divide-line">
      {people.map((p) => {
        let detail: string
        if (t.type === 'vote') {
          const n = state.distance[p] ?? 0
          detail = `${n} ${n === 1 ? 'Stimme' : 'Stimmen'}`
        } else if (t.type === 'first' || t.type === 'passant') detail = state.verdict === p ? 'Sieger' : ''
        else detail = formatAnswer(t, state.answers[p])
        const right = t.type === 'quiz' && state.answers[p] === t.correct
        return (
          <li key={p} className="flex items-center gap-3 py-2">
            <Avatar id={p} size={36} />
            <span className="w-16 shrink-0 font-semibold">{crewById(p).name}</span>
            <span className="flex flex-1 items-center gap-1.5 text-[15px] text-ink-soft">
              {t.type === 'quiz' && state.answers[p] !== undefined && (right ? <CheckCircle size={18} weight="bold" className="shrink-0 text-accent" /> : <XCircle size={18} weight="bold" className="shrink-0 text-[#c2483a]" />)}
              {detail}
            </span>
            {!hidePoints && <PointsPop value={state.points[p]} />}
          </li>
        )
      })}
    </ul>
  )
}

function Result({ state, tiebreak = false }: { state: TaskState; tiebreak?: boolean }) {
  const t = state.task
  let truth: string | null = null
  if (t.type === 'quiz') truth = t.options[t.correct]
  else if ((t.type === 'estimate' || t.type === 'count') && state.truth !== undefined) truth = formatAnswer(t, state.truth)
  return (
    <div className="mt-4">
      {truth && (
        <p className="rounded-2xl bg-accent/12 p-3">
          <span className="text-sm font-semibold text-accent">Richtig ist</span>
          <span className="block font-display text-xl font-extrabold">{truth}</span>
        </p>
      )}
      {/* The tiebreak only decides who pays, it gives no points */}
      <AnswersList state={state} hidePoints={tiebreak} />
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{t.explain}</p>
    </div>
  )
}

export function TaskCard({ state, number, tiebreak = false }: { state: TaskState; number?: number; tiebreak?: boolean }) {
  const { me, send } = useGame()
  const reduce = useReducedMotion()
  const t = state.task
  const mine = state.answers[me]
  const isParticipant = state.participants.includes(me)

  if (state.dropped) {
    return (
      <article className="rounded-3xl bg-surface p-5 shadow-[var(--shadow)]">
        <p className="font-semibold">Aufgabe {number} übersprungen</p>
        <p className="text-ink-soft">Die Ersatzaufgabe war schon weg. Keine Punkte für niemanden.</p>
      </article>
    )
  }

  return (
    <motion.article
      layout={!reduce}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`rounded-3xl bg-surface p-5 shadow-[var(--shadow)] ${tiebreak ? 'ring-3 ring-rose' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className={tiebreak ? 'text-ink' : 'text-accent'}>{tiebreak ? 'Stechen um das Bier' : `Aufgabe ${number}`}</span>
        <span className="text-ink-soft">· {TYPE_LABEL[t.type]}</span>
        {state.isAlt && <span className="rounded-full bg-gold/25 px-2 py-0.5 text-xs text-gold-deep">Ersatzaufgabe</span>}
      </div>
      <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">{t.title}</h3>

      {state.locked ? (
        <p className="mt-2 flex items-center gap-2 text-ink-soft">
          <LockSimple size={18} weight="bold" /> Erst Aufgabe {number ? number - 1 : 1} abschließen.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[17px] leading-relaxed">{t.prompt}</p>

          {state.phase === 'answering' &&
            (!isParticipant ? (
              <p className="mt-4 rounded-2xl bg-page p-4 text-ink-soft">
                Hier stechen gerade {state.participants.map((p) => crewById(p).name).join(' und ')}. Du darfst zuschauen und lästern.
              </p>
            ) : mine === undefined ? (
              <AnswerInput state={state} />
            ) : (
              <>
                <p className="mt-4">
                  <span className="text-sm font-semibold text-ink-soft">Dein Tipp</span>
                  <span className="block font-display text-xl font-extrabold">{formatAnswer(t, mine)}</span>
                </p>
                <Waiting state={state} />
              </>
            ))}

          {state.phase === 'counting' && <CountInput state={state} />}
          {state.phase === 'verdict' && <VerdictInput state={state} />}
          {state.phase === 'done' && <Result state={state} tiebreak={tiebreak} />}

          {state.canSkip && state.phase !== 'done' && !tiebreak && (
            <div className="mt-4 border-t border-line pt-3">
              {state.skipVotes.includes(me) ? (
                <p className="flex items-center gap-2 text-sm text-ink-soft">
                  <SkipForward size={18} weight="bold" /> Du willst überspringen. {state.skipVotes.length} von 4 dafür.
                </p>
              ) : (
                <ConfirmButton
                  label={
                    <span className="flex items-center gap-2">
                      <SkipForward size={18} weight="bold" /> Überspringen {state.skipVotes.length > 0 ? `(${state.skipVotes.length} von 4)` : ''}
                    </span>
                  }
                  confirmLabel="Wirklich? Nochmal tippen"
                  onConfirm={() => send({ key: keys.skip(t.id, me), kind: 'skip', player: me, task: t.id })}
                  className="min-h-11 text-sm font-semibold text-ink-soft"
                />
              )}
            </div>
          )}
        </>
      )}
    </motion.article>
  )
}
