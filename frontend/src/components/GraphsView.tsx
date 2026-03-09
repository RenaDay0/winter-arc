import { C } from '../styles/theme'
import { useDataStore, daysInMonth } from '../store/dataStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, Cell, ResponsiveContainer,
  Area, AreaChart, Legend,
} from 'recharts'

const TREND_COLORS = [C.ACCENT, C.SUCCESS, C.WARNING, C.DANGER, '#BF5AF2', '#FF375F', '#5AC8FA', '#FFD60A']

function moodColor(score: number): string {
  if (score <= 0) return C.BORDER
  if (score <= 3) return C.DANGER
  if (score <= 5) return C.WARNING
  if (score <= 7) return C.ACCENT
  return C.SUCCESS
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 3) return null
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
  const dx  = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0))
  const dy  = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0))
  if (dx === 0 || dy === 0) return null
  return num / (dx * dy)
}

function linReg(xs: number[], ys: number[]): { k: number; b: number } {
  const n  = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  const k  = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
             / xs.reduce((s, x) => s + (x - mx) ** 2, 0)
  return { k, b: my - k * mx }
}

function habitPct(h: string, data: Record<string, number[]>, days: number, goals: Record<string, any>): number {
  const goal = goals?.[h] ?? { type: 'boolean' }
  const vals = data?.[h] ?? []
  if (goal.type === 'numeric') {
    const t = parseFloat(goal.target) || 1
    return vals.reduce((s: number, v: number) => s + Math.min(v / t, 1), 0) / days * 100
  }
  return vals.filter(Boolean).length / days * 100
}

function dayDone(h: string, d: number, data: Record<string, number[]>, goals: Record<string, any>): boolean {
  const v    = (data?.[h] ?? [])[d] ?? 0
  const goal = goals?.[h] ?? { type: 'boolean' }
  if (goal.type === 'numeric') return parseFloat(v) >= (parseFloat(goal.target) || 1)
  return Boolean(v)
}

// Скользящее среднее
function smooth(vals: number[], window: number): number[] {
  return vals.map((_, i) => {
    const lo  = Math.max(0, i - Math.floor(window / 2))
    const hi  = Math.min(vals.length, i + Math.floor(window / 2) + 1)
    const sl  = vals.slice(lo, hi)
    return sl.reduce((a, b) => a + b, 0) / sl.length
  })
}

// ── Обёртка для карточки графика ─────────────────────────────────────────────

function ChartCard({ title, titleColor = C.TEXT, subtitle, children, fullWidth = false }: {
  title: string; titleColor?: string; subtitle?: string
  children: React.ReactNode; fullWidth?: boolean
}) {
  return (
    <div style={{
      background: C.BG2, borderRadius: 12, padding: '20px 16px 12px',
      border: `1px solid ${C.BORDER}`,
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: titleColor }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: C.SECONDARY, marginLeft: 8 }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

const TICK = { fill: C.SECONDARY, fontSize: 11 }
const GRID = { stroke: C.BORDER, strokeDasharray: '3 3' }
const TT_STYLE = { background: C.CARD, border: `1px solid ${C.BORDER}`, borderRadius: 8, fontSize: 12, color: C.TEXT }

// ── Граф 1: % привычек столбцы ───────────────────────────────────────────────

function HabitsBarChart({ habits, data, days, goals }: {
  habits: string[]; data: Record<string, number[]>; days: number; goals: Record<string, any>
}) {
  if (!habits.length) return <div style={{ color: C.SECONDARY, fontSize: 13, padding: '32px', textAlign: 'center' }}>Нет привычек</div>

  const chartData = habits.map((h, i) => {
    const pct = habitPct(h, data, days, goals)
    return { name: String(i + 1), pct: Math.round(pct), color: pct >= 70 ? C.SUCCESS : pct >= 40 ? C.ACCENT : C.SECONDARY }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`} label={{ value: '% выполнения', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11, dy: 40 }} />
        <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={TT_STYLE} cursor={{ fill: C.BORDER + '44' }} />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: C.TEXT, fontSize: 11, formatter: (v: number) => v > 4 ? `${v}%` : '' }}>
          {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Граф 2: сон по дням ──────────────────────────────────────────────────────

function SleepChart({ sleep, days }: { sleep: number[]; days: number }) {
  const filled = sleep.map((v, i) => v > 0 ? { day: i + 1, val: v } : null).filter(Boolean) as { day: number; val: number }[]
  const avg    = filled.length ? filled.reduce((s, d) => s + d.val, 0) / filled.length : null
  const NORM   = 8

  // Для area chart — все дни, нули как null
  const chartData = Array.from({ length: days }, (_, i) => ({
    day: i + 1, val: sleep[i] > 0 ? sleep[i] : null
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.ACCENT} stopOpacity={0.3} />
            <stop offset="95%" stopColor={C.ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'День', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
        <YAxis domain={[0, 14]} tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'Часы сна', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11, dy: 30 }} />
        <Tooltip formatter={(v: number) => [`${v} ч`, 'Сон']} contentStyle={TT_STYLE} cursor={{ stroke: C.BORDER }} />
        <ReferenceLine y={NORM} stroke={C.SUCCESS} strokeDasharray="5 3" strokeWidth={1.5}
          label={{ value: `Норма ${NORM}ч`, fill: C.SUCCESS, fontSize: 10, position: 'insideTopLeft' }} />
        {avg !== null && (
          <ReferenceLine y={avg} stroke={C.WARNING} strokeDasharray="5 3" strokeWidth={1.5}
            label={{ value: `Моя ${avg.toFixed(1)}ч`, fill: C.WARNING, fontSize: 10, position: 'insideBottomLeft' }} />
        )}
        <Area type="monotone" dataKey="val" stroke={C.ACCENT} strokeWidth={2}
          fill="url(#sleepGrad)" connectNulls dot={{ r: 3, fill: C.ACCENT, strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Граф 3: корреляция сон→привычки (баккеты) ───────────────────────────────

function SleepCorrChart({ habits, data, sleep, days, goals }: {
  habits: string[]; data: Record<string, number[]>; sleep: number[]
  days: number; goals: Record<string, any>
}) {
  if (!habits.length) return <div style={{ color: C.SECONDARY, fontSize: 13, padding: '32px', textAlign: 'center' }}>Нет привычек</div>

  const pairs: { s: number; pct: number }[] = []
  for (let d = 0; d < days; d++) {
    const s = sleep[d]
    if (s <= 0) continue
    const pct = habits.filter(h => dayDone(h, d, data, goals)).length / habits.length * 100
    pairs.push({ s, pct })
  }

  const r = pearson(pairs.map(p => p.s), pairs.map(p => p.pct))
  const rColor = r === null ? C.TEXT : Math.abs(r) >= 0.5 ? C.SUCCESS : Math.abs(r) >= 0.2 ? C.WARNING : C.SECONDARY
  const rHint  = r === null ? '' : Math.abs(r) >= 0.5 ? 'сильная связь' : Math.abs(r) >= 0.2 ? 'слабая связь' : 'нет связи'

  const buckets = [
    { lo: 0, hi: 6,  label: '<6ч',  color: C.DANGER },
    { lo: 6, hi: 7,  label: '6–7ч', color: C.WARNING },
    { lo: 7, hi: 8,  label: '7–8ч', color: C.ACCENT },
    { lo: 8, hi: 25, label: '8+ч',  color: C.SUCCESS },
  ]

  const chartData = buckets
    .map(b => {
      const vals = pairs.filter(p => p.s >= b.lo && p.s < b.hi).map(p => p.pct)
      if (!vals.length) return null
      return { name: b.label, avg: Math.round(vals.reduce((a, c) => a + c, 0) / vals.length), color: b.color, cnt: vals.length }
    })
    .filter(Boolean) as { name: string; avg: number; color: string; cnt: number }[]

  const title = r !== null ? `Сон → привычки  r = ${r >= 0 ? '+' : ''}${r.toFixed(2)}` : 'Сон → привычки'

  return (
    <ChartCard title={title} titleColor={rColor} subtitle={rHint} fullWidth={false}>
      {chartData.length < 2 ? (
        <div style={{ color: C.SECONDARY, fontSize: 12, padding: '32px 0', textAlign: 'center' }}>Недостаточно данных (нужно ≥3 дней со сном)</div>
      ) : (
        <ResponsiveContainer width="100%" height={185}>
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false}
              label={{ value: 'Часов сна', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
            <YAxis domain={[0, 110]} tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Ср. выполнение']} contentStyle={TT_STYLE} cursor={{ fill: C.BORDER + '44' }} />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]}
              label={{ position: 'top', fill: C.TEXT, fontSize: 10, formatter: (v: number, _: any, i: number) => `${v}%\n(${chartData[i]?.cnt}д)` }}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── Граф 4: вес + ИМТ ────────────────────────────────────────────────────────

function WeightChart({ weight, days, heightCm }: { weight: number[]; days: number; heightCm: number }) {
  const pts = weight.map((v, i) => v > 0 ? { day: i + 1, val: v } : null).filter(Boolean) as { day: number; val: number }[]
  if (!pts.length) return <div style={{ color: C.SECONDARY, fontSize: 13, padding: '32px', textAlign: 'center' }}>Нет данных</div>

  const chartData = Array.from({ length: days }, (_, i) => ({ day: i + 1, val: weight[i] > 0 ? weight[i] : null }))

  // Тренд
  const xs = pts.map(p => p.day), ys = pts.map(p => p.val)
  let trendLabel = ''
  let trendColor = C.SUCCESS
  if (xs.length >= 2) {
    const { k } = linReg(xs, ys)
    const kw = k * 7
    if (Math.abs(kw) < 0.05) { trendLabel = '≈ стабильный вес'; trendColor = C.SUCCESS }
    else if (kw < 0) { trendLabel = `▼ ${Math.abs(kw).toFixed(2)} кг/нед`; trendColor = C.SUCCESS }
    else { trendLabel = `▲ +${kw.toFixed(2)} кг/нед`; trendColor = C.WARNING }
  }

  // ИМТ
  let bmiLabel = '', bmiColor = C.TEXT
  if (heightCm > 0 && pts.length) {
    const lastW = pts[pts.length - 1].val
    const hm    = heightCm / 100
    const bmi   = lastW / hm ** 2
    if      (bmi < 18.5) { bmiLabel = `ИМТ ${bmi.toFixed(1)} — Дефицит`; bmiColor = C.ACCENT }
    else if (bmi < 25)   { bmiLabel = `ИМТ ${bmi.toFixed(1)} — Норма`;   bmiColor = C.SUCCESS }
    else if (bmi < 30)   { bmiLabel = `ИМТ ${bmi.toFixed(1)} — Избыток`; bmiColor = C.WARNING }
    else                 { bmiLabel = `ИМТ ${bmi.toFixed(1)} — Ожирение`; bmiColor = C.DANGER }
  }

  const title = bmiLabel ? `Вес  |  ${bmiLabel}` : 'Вес'

  return (
    <ChartCard title={title} titleColor={bmiColor} subtitle={trendLabel} fullWidth={false}>
      <ResponsiveContainer width="100%" height={185}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 16 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false}
            label={{ value: 'День', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
          <YAxis tick={TICK} axisLine={false} tickLine={false}
            label={{ value: 'кг', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11 }} />
          <Tooltip formatter={(v: number) => [`${v} кг`, 'Вес']} contentStyle={TT_STYLE} />
          <Line type="monotone" dataKey="val" stroke={C.WARNING} strokeWidth={2}
            connectNulls dot={<CustomDot color={C.WARNING} />} activeDot={{ r: 5, fill: C.WARNING }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function CustomDot({ cx, cy, color }: any) {
  if (cx === undefined || cy === undefined) return null
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />
}

// ── Граф 5: тренд привычек ───────────────────────────────────────────────────

function TrendChart({ habits, data, days, goals }: {
  habits: string[]; data: Record<string, number[]>; days: number; goals: Record<string, any>
}) {
  if (!habits.length) return <div style={{ color: C.SECONDARY, fontSize: 13, padding: '40px', textAlign: 'center' }}>Нет привычек</div>

  const window = Math.max(3, Math.floor(days / 7))

  // Строим данные: каждая точка = день, поля = номер привычки
  const chartData = Array.from({ length: days }, (_, i) => {
    const row: Record<string, any> = { day: i + 1 }
    habits.forEach((h, hi) => {
      const goal = goals?.[h] ?? { type: 'boolean' }
      const vals = Array.from({ length: days }, (_, d) => {
        const v = (data?.[h] ?? [])[d] ?? 0
        if (goal.type === 'numeric') return Math.min(v / (parseFloat(goal.target) || 1), 1) * 100
        return v > 0 ? 100 : 0
      })
      const smoothed = smooth(vals, window)
      row[`h${hi}`] = Math.round(smoothed[i])
    })
    return row
  })

  const weekLines = Array.from({ length: Math.floor(days / 7) }, (_, i) => (i + 1) * 7 + 1).filter(d => d <= days)

  return (
    <ChartCard title="Тренд привычек по дням" fullWidth>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 60, left: -10, bottom: 16 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false}
            label={{ value: 'День', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
          <YAxis domain={[-5, 115]} tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}
            label={{ value: 'Скольз. среднее %', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11, dy: 60 }} />
          <Tooltip contentStyle={TT_STYLE} formatter={(v: number, name: string) => {
            const idx = parseInt(name.replace('h', ''))
            return [`${v}%`, `${idx + 1}. ${habits[idx]?.slice(0, 16) ?? ''}`]
          }} />
          {weekLines.map(d => (
            <ReferenceLine key={d} x={d} stroke={C.BORDER} strokeDasharray="3 3" strokeWidth={0.8} />
          ))}
          {habits.map((_, i) => (
            <Line key={i} type="monotone" dataKey={`h${i}`}
              stroke={TREND_COLORS[i % TREND_COLORS.length]} strokeWidth={2}
              dot={false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Легенда */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingLeft: 32 }}>
        {habits.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 14, height: 3, borderRadius: 2, background: TREND_COLORS[i % TREND_COLORS.length] }} />
            <span style={{ color: C.SECONDARY }}>{i + 1}. {h.slice(0, 18)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

// ── Граф 6: оценка дня ───────────────────────────────────────────────────────

function MoodChart({ mood, notes, days }: { mood: number[]; notes: Record<string, string>; days: number }) {
  const filled = mood.map((v, i) => v > 0 ? { day: i + 1, val: v } : null).filter(Boolean) as { day: number; val: number }[]
  const avg    = filled.length ? filled.reduce((s, d) => s + d.val, 0) / filled.length : null

  const chartData = Array.from({ length: days }, (_, i) => ({
    day: i + 1, val: mood[i] > 0 ? mood[i] : null,
    note: notes[String(i)] ? '📝' : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 10, right: 40, left: -10, bottom: 16 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" type="number" domain={[1, days]} tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'День', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
        <YAxis dataKey="val" type="number" domain={[0, 11]} tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'Оценка (1–10)', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11, dy: 50 }} />
        <Tooltip contentStyle={TT_STYLE} formatter={(v: number) => [`${v}`, 'Оценка']} />
        {avg !== null && (
          <ReferenceLine y={avg} stroke="#BF5AF2" strokeDasharray="5 3" strokeWidth={1.5}
            label={{ value: `ср. ${avg.toFixed(1)}`, fill: '#BF5AF2', fontSize: 10, position: 'right' }} />
        )}
        <Scatter data={filled} shape={(props: any) => {
          const { cx, cy, payload } = props
          return <circle cx={cx} cy={cy} r={6} fill={moodColor(payload.val)} opacity={0.9} />
        }} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ── Граф 7: корреляция оценка→привычки ──────────────────────────────────────

function MoodCorrChart({ habits, data, mood, days, goals }: {
  habits: string[]; data: Record<string, number[]>; mood: number[]
  days: number; goals: Record<string, any>
}) {
  if (!habits.length) return <div style={{ color: C.SECONDARY, fontSize: 13, padding: '32px', textAlign: 'center' }}>Нет привычек</div>

  const pairs: { moodVal: number; pct: number }[] = []
  for (let d = 0; d < days; d++) {
    const mv = mood[d] ?? 0
    if (mv <= 0) continue
    const pct = habits.filter(h => dayDone(h, d, data, goals)).length / habits.length * 100
    pairs.push({ moodVal: mv, pct })
  }

  const r = pearson(pairs.map(p => p.moodVal), pairs.map(p => p.pct))
  const rColor = r === null ? C.TEXT : Math.abs(r) >= 0.5 ? C.SUCCESS : Math.abs(r) >= 0.2 ? C.WARNING : C.SECONDARY
  const rHint  = r === null ? '' : Math.abs(r) >= 0.5 ? 'сильная связь' : Math.abs(r) >= 0.2 ? 'слабая связь' : 'нет связи'
  const title  = r !== null ? `Оценка → привычки  r = ${r >= 0 ? '+' : ''}${r.toFixed(2)}` : 'Оценка → привычки'

  // Линия тренда
  let trendLine: { x: number; y: number }[] = []
  if (pairs.length >= 2) {
    const { k, b } = linReg(pairs.map(p => p.moodVal), pairs.map(p => p.pct))
    trendLine = [{ x: 1, y: k * 1 + b }, { x: 10, y: k * 10 + b }]
  }

  return (
    <ChartCard title={title} titleColor={rColor} subtitle={rHint}>
      {pairs.length < 3 ? (
        <div style={{ color: C.SECONDARY, fontSize: 12, padding: '32px 0', textAlign: 'center' }}>Недостаточно данных (нужно ≥3 дней с оценкой)</div>
      ) : (
        <ResponsiveContainer width="100%" height={185}>
          <ScatterChart margin={{ top: 8, right: 16, left: -10, bottom: 16 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="moodVal" type="number" domain={[0.5, 10.5]} tick={TICK} axisLine={false} tickLine={false}
              label={{ value: 'Оценка дня', position: 'insideBottom', fill: C.SECONDARY, fontSize: 11, dy: 8 }} />
            <YAxis dataKey="pct" type="number" domain={[-5, 110]} tick={TICK} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} label={{ value: '% привычек', angle: -90, position: 'insideLeft', fill: C.SECONDARY, fontSize: 11, dy: 40 }} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v: number, name: string) => [name === 'moodVal' ? v : `${v}%`, name === 'moodVal' ? 'Оценка' : '% привычек']} />
            <Scatter data={pairs} shape={(props: any) => {
              const { cx, cy, payload } = props
              return <circle cx={cx} cy={cy} r={5} fill={moodColor(payload.moodVal)} opacity={0.85} />
            }} />
            {trendLine.length > 0 && (
              <Line data={trendLine} dataKey="y" type="linear" stroke="#BF5AF2" strokeWidth={2}
                strokeDasharray="6 3" dot={false} legendType="none" />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function GraphsView({ ym }: { ym: string }) {
  const store = useDataStore()
  const md    = store.getCurrentMonth(ym)
  const days  = daysInMonth(ym)
  const { heightCm, measurements } = store

  const hasData = md.habits.length > 0 || md.sleep.some(v => v > 0) || md.weight.some(v => v > 0) || md.mood.some(v => v > 0)

  if (!hasData) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: C.SECONDARY, fontSize: 14 }}>
        Нет данных за этот месяц — заполни таблицу, чтобы увидеть графики.
      </div>
    )
  }

  return (
    <div style={{ padding: '0 36px 32px' }}>
      {/* Сетка 2 колонки */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>

        {/* Привычки за месяц */}
        <ChartCard title="Привычки за месяц">
          <HabitsBarChart habits={md.habits} data={md.data} days={days} goals={md.goals} />
        </ChartCard>

        {/* Сон */}
        <ChartCard title="Сон">
          <SleepChart sleep={md.sleep} days={days} />
        </ChartCard>

        {/* Корреляция сон→привычки */}
        <SleepCorrChart habits={md.habits} data={md.data} sleep={md.sleep} days={days} goals={md.goals} />

        {/* Вес */}
        <WeightChart weight={md.weight} days={days} heightCm={heightCm} />

        {/* Тренд (полная ширина) */}
        <TrendChart habits={md.habits} data={md.data} days={days} goals={md.goals} />

        {/* Оценка дня */}
        <ChartCard title="Оценка дня">
          <MoodChart mood={md.mood} notes={md.notes} days={days} />
        </ChartCard>

        {/* Корреляция оценка→привычки */}
        <MoodCorrChart habits={md.habits} data={md.data} mood={md.mood} days={days} goals={md.goals} />

      </div>
    </div>
  )
}