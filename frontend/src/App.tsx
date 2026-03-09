import { useState, useEffect, useRef } from 'react'
import { C } from './styles/theme'
import { useDataStore, daysInMonth } from './store/dataStore'
import HabitTable from './components/HabitTable'
import AddHabitDialog from './components/AddHabitDialog'
import ReferenceView from './components/ReferenceView'
import CaloriePanel from './components/CaloriePanel'
import GraphsView from './components/GraphsView'

const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
const MONTHS_FULL  = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function prevMonthKey(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  if (m === 1) return `${y-1}-12`
  return `${y}-${String(m-1).padStart(2,'0')}`
}
function monthLabel(ym: string) {
  const [, m] = ym.split('-').map(Number)
  return MONTHS_FULL[m-1]
}
function getWeekOptions() {
  const weeks: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i * 7)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const dd = String(monday.getDate()).padStart(2,'0')
    const mm = String(monday.getMonth()+1).padStart(2,'0')
    weeks.push({ key: `${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`, label: `Нед. ${weekNum} (${dd}.${mm})` })
  }
  return weeks
}

const P = 36

function Dropdown({ items, value, onPick, width = 130, children }: {
  items: string[]; value: string; onPick: (v: string) => void; width?: number; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: C.CARD, border: 'none', color: C.TEXT, borderRadius: 9,
        padding: '0 14px', cursor: 'pointer', fontSize: 14, fontFamily: C.FONT,
        height: 34, minWidth: width, textAlign: 'left',
      }}>{children}</button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200,
          background: C.CARD, border: `1px solid ${C.BORDER}`, borderRadius: 9,
          overflow: 'auto', maxHeight: 320, minWidth: Math.max(width, 180),
          boxShadow: '0 8px 28px rgba(0,0,0,0.5)', marginTop: 3,
        }}>
          {items.map(item => (
            <div key={item} onClick={() => { onPick(item); setOpen(false) }} style={{
              padding: '8px 16px', cursor: 'pointer', fontSize: 14,
              background: item === value ? C.ACCENT : 'transparent',
              color: item === value ? '#fff' : C.TEXT, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (item !== value) (e.currentTarget as HTMLDivElement).style.background = C.BORDER }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = item === value ? C.ACCENT : 'transparent' }}
            >{item}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoundBtn({ onClick, children, width = 128 }: {
  onClick: () => void; children: React.ReactNode; width?: number
}) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? C.BORDER : C.CARD, border: 'none', color: C.TEXT,
      borderRadius: 10, width, height: 34, cursor: 'pointer',
      fontSize: 13, fontFamily: C.FONT, transition: 'background 0.12s', flexShrink: 0,
    }}>{children}</button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? C.BORDER : C.CARD, border: 'none', color: C.TEXT,
      borderRadius: 10, padding: '0 18px', height: 34, cursor: 'pointer',
      fontSize: 14, fontFamily: C.FONT, transition: 'background 0.12s',
    }}>← Назад</button>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 3, height: 18, background: C.ACCENT, borderRadius: 2 }} />
      <span style={{ color: C.SECONDARY, fontWeight: 700, fontSize: 15 }}>{text}</span>
    </div>
  )
}
function Sep() { return <div style={{ height: 1, background: C.BORDER, margin: `12px ${P}px` }} /> }

// ── Факт дня ──────────────────────────────────────────────────────────────────

const FALLBACK_FACTS = [
  'Осьминоги имеют три сердца и голубую кровь.',
  'Мёд не портится — в египетских гробницах находили съедобный мёд возрастом 3000 лет.',
  'Молния бьёт в Землю около 100 раз в секунду по всему миру.',
  'В теле человека около 37 триллионов клеток.',
  'Дельфины спят с одним открытым глазом, чтобы следить за опасностью.',
  'Бамбук может вырасти на 90 см за один день — это рекорд среди растений.',
  'Муравьи никогда не спят и способны поднять груз в 50 раз тяжелее себя.',
  'Мозг потребляет около 20% всей энергии тела, хотя весит лишь 2% от его массы.',
  'Кошки проводят во сне около 70% своей жизни.',
  'Акула — единственное живое существо, которое никогда не болеет раком.',
]

function DailyFact() {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = 'winter_arc_fact_ru'
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const getFromCache = (): string | null => {
    try { const c = JSON.parse(localStorage.getItem(cacheKey) || '{}'); if (c.date === today && c.text) return c.text } catch {}
    return null
  }
  const [text, setText] = useState<string>(() => getFromCache() ?? ('💡 ' + FALLBACK_FACTS[seed % FALLBACK_FACTS.length]))
  const [loading, setLoading] = useState(false)
  const load = async (force = false) => {
    if (!force) { const c = getFromCache(); if (c) { setText(c); return } }
    setLoading(true)
    try {
      const now = new Date()
      const res = await fetch(`https://ru.wikipedia.org/api/rest_v1/feed/onthisday/events/${now.getMonth()+1}/${now.getDate()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const events: any[] = data.events ?? []
      if (!events.length) throw new Error()
      const ev = events[Math.floor(Math.random() * Math.min(events.length, 10))]
      const d = String(now.getDate()).padStart(2,'0'), mo = String(now.getMonth()+1).padStart(2,'0')
      const fact = `📅 ${d}/${mo} (${ev.year}) — ${(ev.text ?? '').slice(0, 220)}`
      setText(fact); localStorage.setItem(cacheKey, JSON.stringify({ date: today, text: fact }))
    } catch {
      const f = '💡 ' + FALLBACK_FACTS[seed % FALLBACK_FACTS.length]
      setText(f); localStorage.setItem(cacheKey, JSON.stringify({ date: today, text: f }))
    }
    setLoading(false)
  }
  useEffect(() => { load(false) }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: `10px ${P}px`, borderBottom: `1px solid ${C.BORDER}`, minHeight: 40 }}>
      <span style={{ color: C.SECONDARY, fontSize: 14, flex: 1, lineHeight: 1.5 }}>{loading ? '⏳ Загружаем факт дня…' : text}</span>
      <button onClick={() => load(true)} style={{ background: 'none', border: 'none', color: loading ? C.SECONDARY : C.ACCENT, fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>↻</button>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const store = useDataStore()
  const { currentYear, currentMonth, setMonth, allMonths, heightCm, setHeight, measurements, setMeasurement } = store

  const now = new Date()
  const [year, setYear]    = useState(currentYear)
  const [month, setMonthL] = useState(currentMonth)
  const [view, setView]    = useState<'table'|'graphs'|'reference'>('table')
  const [showAdd, setShowAdd] = useState(false)

  const weeks = getWeekOptions()
  const [selWeek, setSelWeek] = useState(weeks[0].key)
  const selWeekLabel = weeks.find(w => w.key === selWeek)?.label ?? weeks[0].label
  const [waistStr, setWaistStr] = useState('')
  const [hipStr,   setHipStr]   = useState('')

  useEffect(() => {
    const m2 = measurements[selWeek] ?? {}
    setWaistStr(m2.waist ? String(m2.waist) : '')
    setHipStr(m2.hip ? String(m2.hip) : '')
  }, [selWeek, measurements])

  const heights = Array.from({length: 17}, (_, i) => String(220 - i*5))
  const [heightVal, setHeightVal] = useState(heightCm > 0 ? String(Math.round(heightCm)) : '—')

  const ym = `${year}-${String(month).padStart(2,'0')}`
  const md = store.getCurrentMonth(ym)

  const selectMonth = (y: number, m: number) => {
    setYear(y); setMonthL(m); setMonth(y, m)
    store.ensureMonth(`${y}-${String(m).padStart(2,'0')}`)
  }

  const yearOptions = Array.from({length: 7}, (_, i) => String(now.getFullYear() + 1 - i))

  useEffect(() => {
    const id = setInterval(() => store.saveData(), 3 * 60 * 1000)
    return () => clearInterval(id)
  }, [store])

  const saveMeasurement = () => {
    const waist = parseFloat(waistStr.replace(',', '.')) || 0
    const hip   = parseFloat(hipStr.replace(',', '.'))   || 0
    if (waist > 0 || hip > 0) setMeasurement(selWeek, waist, hip)
  }

  const meas = measurements[selWeek] ?? {}
  const waistN = parseFloat(waistStr) || meas.waist || 0
  const hipN   = parseFloat(hipStr)   || meas.hip   || 0
  const hN     = heightCm || 0
  const measParts: string[] = []
  if (waistN) measParts.push(`Талия ${waistN.toFixed(1)} см`)
  if (hipN)   measParts.push(`Бедра ${hipN.toFixed(1)} см`)
  if (waistN && hipN)   measParts.push(`WHR ${(waistN/hipN).toFixed(2)}`)
  if (waistN && hN > 0) measParts.push(`WHtR ${(waistN/hN).toFixed(2)}`)
  const measHint = measParts.length > 0 ? measParts.join('  ·  ') : 'Введи замеры → увидишь WHtR и WHR'

  const prevYm = prevMonthKey(ym)
  const prevMd = allMonths[prevYm]
  const compareText = (() => {
    if (!prevMd) return { text: `Сравнение с ${monthLabel(prevYm)}: нет данных`, color: C.SECONDARY }
    const calc = (habits: string[], data: Record<string, number[]>, days: number, goals: Record<string, any>) => {
      if (!habits.length || !days) return 0
      let total = 0
      for (const h of habits) {
        const goal = goals?.[h] ?? { type: 'boolean' }
        const vals = data?.[h] ?? []
        if (goal.type === 'numeric') { const t = goal.target || 1; total += vals.reduce((s: number, v: number) => s + Math.min(v/t, 1), 0) / days }
        else total += vals.filter(Boolean).length / days
      }
      return (total / habits.length) * 100
    }
    const curPct  = calc(md.habits, md.data, daysInMonth(ym), md.goals)
    const prevPct = calc(prevMd.habits, prevMd.data, daysInMonth(prevYm), prevMd.goals ?? {})
    const diff = curPct - prevPct
    const arrow = diff > 0 ? `▲ +${diff.toFixed(1)}%` : diff < 0 ? `▼ ${diff.toFixed(1)}%` : '= без изменений'
    const color = diff > 0 ? C.SUCCESS : diff < 0 ? C.DANGER : C.SECONDARY
    return { text: `vs ${monthLabel(prevYm)} ${prevYm.split('-')[0]}: ${prevPct.toFixed(0)}% → ${curPct.toFixed(0)}%  ${arrow}`, color }
  })()

  const inputStyle: React.CSSProperties = {
    background: C.CARD, border: 'none', color: C.TEXT, borderRadius: 9,
    padding: '0 12px', fontSize: 14, fontFamily: 'inherit',
    width: 90, height: 34, textAlign: 'center', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.BG, color: C.TEXT, fontFamily: C.FONT, display: 'flex', flexDirection: 'column' }}>

      {/* Шапка */}
      <div style={{ padding: `16px ${P}px 0`, background: C.BG }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <img src="/winterarc.ico" style={{ width: 58, height: 58 }} />
  <span style={{ fontSize: 22, fontWeight: 700, color: C.TEXT }}>Winter Arc</span>
</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {view !== 'table'
              ? <BackBtn onClick={() => setView('table')} />
              : <>
                  <span style={{ color: C.TEXT, fontSize: 14 }}>Рост (см):</span>
                  <Dropdown items={heights} value={heightVal} onPick={v => { setHeightVal(v); setHeight(Number(v)) }} width={90}>
                    <b>{heightVal}</b>
                  </Dropdown>
                  <RoundBtn onClick={() => setView('reference')} width={128}>📖 Справочник</RoundBtn>
                  <RoundBtn onClick={() => setView('graphs')} width={118}>📊 Графики</RoundBtn>
                  <RoundBtn onClick={() => setShowAdd(true)} width={128}>+ Привычка</RoundBtn>
                </>
            }
          </div>
        </div>

        {/* Месяцы */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ color: C.SECONDARY, fontSize: 14 }}>Год:</span>
          <Dropdown items={yearOptions} value={String(year)} onPick={v => selectMonth(Number(v), month)} width={90}><b>{year}</b></Dropdown>
          {MONTHS_SHORT.map((name, i) => {
            const mo = i + 1, active = mo === month
            return (
              <button key={mo} onClick={() => selectMonth(year, mo)} style={{
                background: active ? C.ACCENT : C.CARD, border: 'none',
                color: active ? '#fff' : C.TEXT, borderRadius: 10,
                width: 58, height: 34, cursor: 'pointer',
                fontSize: 13, fontFamily: C.FONT, fontWeight: active ? 700 : 400,
                transition: 'background 0.12s',
              }}>{name}</button>
            )
          })}
        </div>
      </div>

      <div style={{ height: 1, background: C.BORDER, margin: '12px 0 0' }} />

      {/* Контент */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {view !== 'table' && (
          <div style={{ padding: `16px ${P}px 6px` }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              {view === 'graphs' ? '📊 Графики' : '📖 Справочник'}
            </span>
          </div>
        )}

        {view === 'table' && <>
          <DailyFact />

          {/* Замеры */}
          <div style={{ padding: `14px ${P}px 10px` }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>📏 Замеры тела (раз в неделю)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Dropdown items={weeks.map(w => w.label)} value={selWeekLabel}
                onPick={l => { const w = weeks.find(x => x.label === l); if (w) setSelWeek(w.key) }} width={210}>{selWeekLabel}</Dropdown>
              <span style={{ color: C.TEXT, fontSize: 14 }}>Талия:</span>
              <input value={waistStr} onChange={e => setWaistStr(e.target.value)}
                onBlur={saveMeasurement} onKeyDown={e => e.key === 'Enter' && saveMeasurement()}
                style={inputStyle} placeholder="—" />
              <span style={{ color: C.SECONDARY, fontSize: 14 }}>см</span>
              <span style={{ color: C.TEXT, fontSize: 14 }}>Бедра:</span>
              <input value={hipStr} onChange={e => setHipStr(e.target.value)}
                onBlur={saveMeasurement} onKeyDown={e => e.key === 'Enter' && saveMeasurement()}
                style={inputStyle} placeholder="—" />
              <span style={{ color: C.SECONDARY, fontSize: 14 }}>см</span>
            </div>
            <div style={{ color: C.SECONDARY, fontSize: 13, marginTop: 6 }}>{measHint}</div>
          </div>

          <Sep />

          {/* Калораж */}
          <div style={{ padding: `0 ${P}px 12px` }}>
            <CaloriePanel
              heightCm={heightCm}
              currentWeight={(() => { for (let i = md.weight.length-1; i >= 0; i--) if (md.weight[i] > 0) return md.weight[i]; return 0 })()}
              waistCm={waistN} hipCm={hipN}
            />
          </div>

          <Sep />

          {/* Таблица */}
          <div style={{ padding: `0 ${P}px` }}>
            <SectionLabel text="Отметки за месяц" />
            <div style={{ border: `1px solid ${C.BORDER}`, borderRadius: 8, background: C.BG2, overflowX: 'auto' }}>
              <HabitTable ym={ym} />
            </div>
          </div>

          <Sep />

          {/* Сравнение */}
          <div style={{ padding: `0 ${P}px` }}>
            <div style={{ color: compareText.color, fontSize: 14, fontWeight: 600 }}>{compareText.text}</div>
            <div style={{ color: C.SECONDARY, fontSize: 13, marginTop: 5 }}>📊 Нажмите «Графики» в шапке чтобы открыть аналитику</div>
          </div>
        </>}

        {view === 'graphs'    && <GraphsView ym={ym} />}
        {view === 'reference' && <ReferenceView />}
      </div>

      {showAdd && <AddHabitDialog onClose={() => setShowAdd(false)} />}
    </div>
  )
}