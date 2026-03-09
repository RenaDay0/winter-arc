import { C } from '../styles/theme'
import { daysInMonth } from '../store/dataStore'

interface MonthData {
  habits: string[]
  data: Record<string, number[]>
  sleep: number[]
  weight: number[]
  mood: number[]
  goals: Record<string, any>
  categories?: Record<string, string>
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{
      background: C.CARD, borderRadius: 14,
      width: 178, height: 80, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 8px',
    }}>
      <span style={{
        color: C.SECONDARY, fontSize: 10, marginBottom: 6,
        textAlign: 'center', lineHeight: 1.3,
      }}>{title}</span>
      <span style={{ color, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{value}</span>
    </div>
  )
}

function dayDone(h: string, day: number, data: Record<string, number[]>, goals: Record<string, any>): boolean {
  const v = (data?.[h] ?? [])[day] ?? 0
  const goal = goals?.[h] ?? { type: 'boolean' }
  return goal.type === 'numeric' ? v >= (goal.target || 1) : Boolean(v)
}

function habitPct(h: string, data: Record<string, number[]>, days: number, goals: Record<string, any>): number {
  const goal = goals?.[h] ?? { type: 'boolean' }
  const vals = data?.[h] ?? []
  if (goal.type === 'numeric') {
    const t = goal.target || 1
    return vals.reduce((s: number, v: number) => s + Math.min(v / t, 1), 0) / days * 100
  }
  return vals.filter(Boolean).length / days * 100
}

export default function StatsCards({ md, ym }: { md: MonthData; ym: string }) {
  const { habits, data, sleep, goals, mood = [], categories = {} } = md
  const days = daysInMonth(ym)

  if (!habits.length && !sleep.some(v => v > 0)) return null

  const cards: { title: string; value: string; color: string }[] = []

  if (habits.length > 0) {
    // Лучшая серия
    let bestStreak = 0, bestHabit = '—'
    for (const h of habits) {
      let streak = 0, cur = 0
      for (let d = 0; d < days; d++) {
        if (dayDone(h, d, data, goals)) { cur++; streak = Math.max(streak, cur) }
        else cur = 0
      }
      if (streak > bestStreak) { bestStreak = streak; bestHabit = h }
    }
    cards.push({ title: `Серия: ${bestHabit.slice(0, 12)}`, value: `${bestStreak} дн.`, color: C.SUCCESS })

    // Общий %
    const overall = habits.reduce((s, h) => s + habitPct(h, data, days, goals), 0) / habits.length
    cards.push({ title: 'Выполнено всего', value: `${overall.toFixed(0)}%`, color: C.ACCENT })

    // Лучший день
    let bestDay = 0, bestCount = 0
    for (let d = 0; d < days; d++) {
      const c = habits.filter(h => dayDone(h, d, data, goals)).length
      if (c > bestCount) { bestCount = c; bestDay = d + 1 }
    }
    const moodScore = bestDay && (mood[bestDay - 1] ?? 0) > 0 ? mood[bestDay - 1] : 0
    const bestDayLabel = bestDay ? (moodScore ? `${bestDay}ч · \u2605${moodScore}` : `${bestDay} число`) : '—'
    cards.push({ title: 'Лучший день', value: bestDayLabel, color: C.WARNING })
  }

  // Средний сон
  const sleepFilled = sleep.filter(v => v > 0)
  const avgSleep = sleepFilled.length ? sleepFilled.reduce((a, b) => a + b, 0) / sleepFilled.length : 0
  const sleepColor = avgSleep >= 7 ? C.SUCCESS : avgSleep >= 5 ? C.WARNING : C.DANGER
  cards.push({ title: 'Средний сон', value: avgSleep > 0 ? `${avgSleep.toFixed(1)} ч` : '—', color: avgSleep > 0 ? sleepColor : C.SECONDARY })

  // Средняя оценка дня
  const moodFilled = mood.filter(v => v > 0)
  if (moodFilled.length) {
    const avgMood = moodFilled.reduce((a, b) => a + b, 0) / moodFilled.length
    const moodColor = avgMood >= 7 ? C.SUCCESS : avgMood >= 5 ? C.WARNING : C.DANGER
    cards.push({ title: 'Средняя оценка', value: `${avgMood.toFixed(1)} / 10`, color: moodColor })
  }

  // Лучшая категория
  if (habits.length && Object.keys(categories).length) {
    const catTotals: Record<string, number[]> = {}
    for (const h of habits) {
      const cat = categories[h] ?? 'Другое'
      if (!catTotals[cat]) catTotals[cat] = []
      catTotals[cat].push(habitPct(h, data, days, goals))
    }
    let bestCat = '', bestCatPct = 0
    for (const [cat, vals] of Object.entries(catTotals)) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      if (avg > bestCatPct) { bestCatPct = avg; bestCat = cat }
    }
    if (bestCat) {
      cards.push({ title: 'Лучшая категория', value: `${bestCat.slice(0, 12)} ${bestCatPct.toFixed(0)}%`, color: '#BF5AF2' })
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '8px 0' }}>
      {cards.map((c, i) => <StatCard key={i} {...c} />)}
    </div>
  )
}