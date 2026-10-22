// Pure game rules. Every phone runs the same event log through this and gets
// the same state, so there is no server logic to keep in sync.
import { PLAYER_IDS, type PlayerId } from '../data/trip'
import { STATIONS, type Station, type Task } from '../data/stations'
import { PRICES, START_COINS } from './config'
import type { GameEvent } from './events'

export type Points = Record<PlayerId, number>

const zero = (): Points => ({ julian: 0, joop: 0, keanu: 0, ben: 0 })

export type Phase =
  /** Players still answering */
  | 'answering'
  /** Count task: answers are in, the group has to enter the counted number */
  | 'counting'
  /** Waiting for one verdict (first, passant) */
  | 'verdict'
  | 'done'

export type TaskState = {
  task: Task
  /** True when this slot was skipped and now shows the replacement */
  isAlt: boolean
  /** Slot was skipped but the replacement was already used */
  dropped: boolean
  phase: Phase
  locked: boolean
  participants: PlayerId[]
  answers: Partial<Record<PlayerId, number | string>>
  truth?: number
  verdict?: PlayerId
  forced: boolean
  skipVotes: PlayerId[]
  canSkip: boolean
  points: Points
  winners: PlayerId[]
  /** For estimates: distance per player, used on the result screen */
  distance: Partial<Record<PlayerId, number>>
}

export type Debt = {
  station: string
  debtor: PlayerId
  creditors: PlayerId[]
  paid: boolean
}

export type StationState = {
  station: Station
  index: number
  slots: [TaskState, TaskState]
  started: boolean
  tasksDone: boolean
  points: Points
  tiebreak?: TaskState
  /** Set once the station is fully decided */
  losers: PlayerId[]
  winners: PlayerId[]
  done: boolean
}

export type GameState = {
  stations: StationState[]
  nextStation?: StationState
  totals: Points
  coins: Points
  spent: Points
  debts: Debt[]
  joined: PlayerId[]
  bought: Set<string>
  finished: boolean
}

type Index = {
  answers: Map<string, Partial<Record<PlayerId, number | string>>>
  truth: Map<string, number>
  verdict: Map<string, PlayerId>
  skips: Map<string, Set<PlayerId>>
  forced: Set<string>
  bought: Set<string>
  spent: Points
  paid: Set<string>
  joined: Set<PlayerId>
}

const isPlayer = (v: unknown): v is PlayerId => typeof v === 'string' && (PLAYER_IDS as string[]).includes(v)

function indexEvents(events: GameEvent[]): Index {
  const idx: Index = {
    answers: new Map(),
    truth: new Map(),
    verdict: new Map(),
    skips: new Map(),
    forced: new Set(),
    bought: new Set(),
    spent: zero(),
    paid: new Set(),
    joined: new Set(),
  }
  for (const e of events) {
    const p = e.player
    const t = e.task ?? ''
    switch (e.kind) {
      case 'join':
        if (isPlayer(p)) idx.joined.add(p)
        break
      case 'answer': {
        if (!isPlayer(p)) break
        const v = e.payload.value
        if (typeof v !== 'number' && typeof v !== 'string') break
        const m = idx.answers.get(t) ?? {}
        if (m[p] === undefined) m[p] = v
        idx.answers.set(t, m)
        break
      }
      case 'truth': {
        const v = Number(e.payload.value)
        if (!idx.truth.has(t) && Number.isFinite(v)) idx.truth.set(t, v)
        break
      }
      case 'verdict':
        if (!idx.verdict.has(t) && isPlayer(e.payload.winner)) idx.verdict.set(t, e.payload.winner)
        break
      case 'skip': {
        if (!isPlayer(p)) break
        const s = idx.skips.get(t) ?? new Set()
        s.add(p)
        idx.skips.set(t, s)
        break
      }
      case 'force':
        idx.forced.add(t)
        break
      case 'buy': {
        const item = e.payload.item
        if (!isPlayer(p) || (item !== 'hint' && item !== 'fifty')) break
        const k = `${t}:${p}:${item}`
        if (idx.bought.has(k)) break
        idx.bought.add(k)
        idx.spent[p] += PRICES[item]
        break
      }
      case 'paid':
        if (isPlayer(p)) idx.paid.add(`${t}:${p}`)
        break
    }
  }
  return idx
}

/** Standard competition ranking: equal distance shares the better place. */
function rankPoints(distance: Partial<Record<PlayerId, number>>): Points {
  const pts = zero()
  const table = [3, 2, 1, 0]
  const entries = Object.entries(distance) as [PlayerId, number][]
  for (const [p, d] of entries) {
    const better = entries.filter(([, o]) => o < d).length
    pts[p] = table[better] ?? 0
  }
  return pts
}

function evaluateTask(task: Task, participants: PlayerId[], idx: Index, base: Omit<TaskState, 'phase' | 'answers' | 'forced' | 'points' | 'winners' | 'distance' | 'truth' | 'verdict' | 'task' | 'participants'>): TaskState {
  const answers = idx.answers.get(task.id) ?? {}
  const forced = idx.forced.has(task.id)
  const state: TaskState = {
    ...base,
    task,
    participants,
    answers,
    forced,
    phase: 'answering',
    points: zero(),
    winners: [],
    distance: {},
  }
  if (base.dropped) {
    state.phase = 'done'
    return state
  }

  if (task.type === 'first' || task.type === 'passant') {
    const v = idx.verdict.get(task.id)
    if (!v) {
      state.phase = 'verdict'
      return state
    }
    state.verdict = v
    state.points[v] = 3
    state.winners = [v]
    state.phase = 'done'
    return state
  }

  const allIn = participants.every((p) => answers[p] !== undefined)
  if (!allIn && !forced) return state

  if (task.type === 'quiz') {
    for (const p of participants) if (answers[p] === task.correct) state.points[p] = 2
    state.winners = participants.filter((p) => state.points[p] > 0)
    state.phase = 'done'
    return state
  }

  if (task.type === 'vote') {
    const votes = zero()
    for (const p of participants) {
      const v = answers[p]
      if (isPlayer(v) && v !== p) votes[v] += 1
    }
    const max = Math.max(...Object.values(votes))
    if (max > 0) for (const p of PLAYER_IDS) if (votes[p] === max) state.points[p] = 3
    state.winners = PLAYER_IDS.filter((p) => state.points[p] > 0)
    state.distance = votes
    state.phase = 'done'
    return state
  }

  // estimate and count
  const truth = task.type === 'estimate' ? task.answer : idx.truth.get(task.id)
  if (truth === undefined) {
    state.phase = 'counting'
    return state
  }
  state.truth = truth
  for (const p of participants) {
    const v = Number(answers[p])
    if (answers[p] !== undefined && Number.isFinite(v)) state.distance[p] = Math.abs(v - truth)
  }
  state.points = rankPoints(state.distance)
  const best = Math.min(...(Object.values(state.distance) as number[]))
  state.winners = (Object.keys(state.distance) as PlayerId[]).filter((p) => state.distance[p] === best)
  state.phase = 'done'
  return state
}

function evaluateStation(station: Station, index: number, idx: Index, debts: Debt[]): StationState {
  const skippedAll = (t: Task) => (idx.skips.get(t.id)?.size ?? 0) >= PLAYER_IDS.length
  const s0Skipped = skippedAll(station.tasks[0])
  const s1Skipped = skippedAll(station.tasks[1])
  const altFor0 = s0Skipped
  const altFor1 = s1Skipped && !s0Skipped

  const slot = (i: 0 | 1, locked: boolean): TaskState => {
    const main = station.tasks[i]
    const skipped = i === 0 ? s0Skipped : s1Skipped
    const useAlt = i === 0 ? altFor0 : altFor1
    const task = useAlt ? station.alt : main
    const anyMainAnswer = Object.keys(idx.answers.get(main.id) ?? {}).length > 0 || idx.verdict.has(main.id)
    return evaluateTask(task, PLAYER_IDS, idx, {
      isAlt: useAlt,
      dropped: skipped && !useAlt,
      locked,
      skipVotes: [...(idx.skips.get(main.id) ?? [])],
      canSkip: !skipped && !anyMainAnswer,
    })
  }

  const first = slot(0, false)
  const second = slot(1, first.phase !== 'done')
  const slots: [TaskState, TaskState] = [first, second]
  const tasksDone = slots.every((s) => s.phase === 'done')
  const points = zero()
  for (const s of slots) for (const p of PLAYER_IDS) points[p] += s.points[p]

  const started = slots.some(
    (s) => Object.keys(s.answers).length > 0 || s.verdict !== undefined || s.skipVotes.length > 0 || s.isAlt,
  )

  const result: StationState = { station, index, slots, started, tasksDone, points, losers: [], winners: [], done: false }
  if (!tasksDone) return result

  const min = Math.min(...PLAYER_IDS.map((p) => points[p]))
  const max = Math.max(...PLAYER_IDS.map((p) => points[p]))
  const lowest = PLAYER_IDS.filter((p) => points[p] === min)
  let losers = lowest

  if (lowest.length > 1) {
    const tb = evaluateTask(station.tiebreak, lowest, idx, { isAlt: false, dropped: false, locked: false, skipVotes: [], canSkip: false })
    result.tiebreak = tb
    if (tb.phase !== 'done') return result
    const dist = tb.distance
    const answered = lowest.filter((p) => dist[p] !== undefined)
    // No answer in the tiebreak counts as the worst guess
    const missing = lowest.filter((p) => dist[p] === undefined)
    if (missing.length > 0) losers = missing
    else {
      const worst = Math.max(...answered.map((p) => dist[p]!))
      losers = answered.filter((p) => dist[p] === worst)
    }
  }

  const top = PLAYER_IDS.filter((p) => points[p] === max && !losers.includes(p))
  result.losers = losers
  result.winners = top
  result.done = true
  const creditors = top.length > 0 ? top : PLAYER_IDS.filter((p) => !losers.includes(p))
  for (const debtor of losers) debts.push({ station: station.id, debtor, creditors, paid: idx.paid.has(`${station.id}:${debtor}`) })
  return result
}

export function deriveGame(events: GameEvent[]): GameState {
  const idx = indexEvents(events)
  const debts: Debt[] = []
  const stations = STATIONS.map((s, i) => evaluateStation(s, i, idx, debts))
  const totals = zero()
  for (const st of stations) for (const p of PLAYER_IDS) totals[p] += st.points[p]
  const coins = zero()
  for (const p of PLAYER_IDS) coins[p] = START_COINS + totals[p] - idx.spent[p]
  return {
    stations,
    nextStation: stations.find((s) => !s.done),
    totals,
    coins,
    spent: idx.spent,
    debts,
    joined: [...idx.joined],
    bought: idx.bought,
    finished: stations.every((s) => s.done),
  }
}

export const hasBought = (game: GameState, task: string, player: PlayerId, item: 'hint' | 'fifty') =>
  game.bought.has(`${task}:${player}:${item}`)

function hashId(id: string) {
  let h = 2166136261
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h
}

// Hand-picked spots for the right answer so no position wins too often
const SPOT_PATTERN = [2, 0, 3, 1, 1, 3, 0, 2, 3, 1]
const QUIZ_SPOTS = new Map(
  STATIONS.flatMap((s) => [...s.tasks, s.alt])
    .filter((t) => t.type === 'quiz')
    .map((t, i) => [t.id, SPOT_PATTERN[i % SPOT_PATTERN.length]] as const),
)

/** Display order of quiz options. The right answer lands on a stable spot per task, same on every phone. */
export function optionOrder(task: Task): number[] {
  if (task.type !== 'quiz') return []
  const wrong = task.options.map((_, i) => i).filter((i) => i !== task.correct)
  const h = hashId(task.id)
  // Rotate the wrong ones too, so their order differs between tasks
  const r = (h >>> 8) % wrong.length
  const rotated = [...wrong.slice(r), ...wrong.slice(0, r)]
  const spot = QUIZ_SPOTS.get(task.id) ?? h % task.options.length
  return [...rotated.slice(0, spot), task.correct, ...rotated.slice(spot)]
}

/** Two wrong options to hide for the 50:50 joker, stable per task. */
export function fiftyHidden(task: Task): number[] {
  if (task.type !== 'quiz') return []
  const wrong = task.options.map((_, i) => i).filter((i) => i !== task.correct)
  const keep = wrong[hashId(task.id) % wrong.length]
  return wrong.filter((i) => i !== keep)
}

/** Event keys. One row per key and game, the database enforces it. */
export const keys = {
  join: (p: PlayerId) => `join:${p}`,
  answer: (task: string, p: PlayerId) => `answer:${task}:${p}`,
  truth: (task: string) => `truth:${task}`,
  verdict: (task: string) => `verdict:${task}`,
  skip: (task: string, p: PlayerId) => `skip:${task}:${p}`,
  buy: (task: string, p: PlayerId, item: 'hint' | 'fifty') => `buy:${task}:${p}:${item}`,
  force: (task: string) => `force:${task}`,
  paid: (station: string, p: PlayerId) => `paid:${station}:${p}`,
}
