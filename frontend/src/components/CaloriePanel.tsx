import { useState, useEffect } from 'react'
import { C } from '../styles/theme'

// ── Константы (из calorie.py) ────────────────────────────��────────────────────

const ACTIVITY_LEVELS: [string, number][] = [
  ['Сидячий (офис, мало движения)',       1.2],
  ['Лёгкая (1–3 тренировки в неделю)',    1.375],
  ['Средняя (3–5 тренировок)',            1.55],
  ['Высокая (6–7 тренировок)',            1.725],
  ['Очень высокая (спорт + физ. работа)', 1.9],
]

const GOALS: [string, number][] = [
  ['Похудеть (−500 ккал)',  -500],
  ['Похудеть мягко (−250)', -250],
  ['Поддерживать вес',          0],
  ['Набрать массу (+250)',  +250],
  ['Набрать массу (+500)',  +500],
]

const AGES     = Array.from({length: 91}, (_, i) => String(i + 10))
const SEXES    = ['Мужской', 'Женский']
const FORMULAS = ['Миффлин–Сан Жеора', 'Кетч–МакАрдл (% жира)']
const BODYFAT  = Array.from({length: 46}, (_, i) => String(i + 5))

// ── Dropdown ──────────────────────────────────────────────────────────────────

function Dropdown({ items, value, onPick, width = 140, label }: {
  items: string[]
  value: string
  onPick: (v: string) => void
  width?: number
  label?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const h = (_e: MouseEvent) => setOpen(false)
    setTimeout(() => document.addEventListener('mousedown', h), 0)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const display = label ?? value

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onMouseDown={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: C.CARD, border: 'none', color: C.TEXT,
        borderRadius: 9, padding: '0 14px', cursor: 'pointer',
        fontSize: 13, fontFamily: 'inherit', height: 32,
        minWidth: width, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {display}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200,
          background: C.CARD, border: `1px solid ${C.BORDER}`,
          borderRadius: 8, overflow: 'auto', maxHeight: 260,
          minWidth: Math.max(width, 160), boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          marginTop: 2,
        }}>
          {items.map(item => (
            <div key={item}
              onClick={() => { onPick(item); setOpen(false) }}
              style={{
                padding: '8px 14px', cursor: 'pointer', fontSize: 13,
                background: item === value ? C.ACCENT : 'transparent',
                color: item === value ? '#fff' : C.TEXT, whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (item !== value) (e.currentTarget as HTMLDivElement).style.background = C.BORDER }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = item === value ? C.ACCENT : 'transparent' }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Rounded card ──────────────────────────────────────────────────────────────

function RoundedCard({ title, value, unit, color }: {
  title: string; value: string; unit: string; color: string
}) {
  return (
    <div style={{
      background: C.CARD, borderRadius: 14, width: 180, height: 115,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ color: C.SECONDARY, fontSize: 12, marginBottom: 6 }}>{title}</span>
      <span style={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</span>
      <span style={{ color: C.SECONDARY, fontSize: 12, marginTop: 6 }}>{unit}</span>
    </div>
  )
}

// ── CaloriePanel ──────────────────────────────────────────────────────────────

interface Props {
  heightCm: number
  currentWeight: number
  waistCm: number
  hipCm: number
}

export default function CaloriePanel({ heightCm, currentWeight, waistCm, hipCm }: Props) {
  const [formula,  setFormula]  = useState(FORMULAS[0])
  const [age,      setAge]      = useState('')
  const [sex,      setSex]      = useState('Мужской')
  const [bodyfat,  setBodyfat]  = useState('')
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[2][0])
  const [goal,     setGoal]     = useState(GOALS[2][0])

  // Load saved prefs
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('calorie_prefs') || '{}')
      if (saved.formula)  setFormula(saved.formula)
      if (saved.age)      setAge(saved.age)
      if (saved.sex)      setSex(saved.sex)
      if (saved.bodyfat)  setBodyfat(saved.bodyfat)
      if (saved.activity) setActivity(saved.activity)
      if (saved.goal)     setGoal(saved.goal)
    } catch { /* ignore */ }
  }, [])

  // Save prefs on change
  useEffect(() => {
    localStorage.setItem('calorie_prefs', JSON.stringify({ formula, age, sex, bodyfat, activity, goal }))
  }, [formula, age, sex, bodyfat, activity, goal])

  // Compute
  const isKatch = formula === FORMULAS[1]
  const weight  = currentWeight
  const height  = heightCm

  const cards: { title: string; value: string; unit: string; color: string }[] = []
  let hint = ''
  let computed = false

  if (isKatch) {
    const bf = parseFloat(bodyfat)
    if (!bf || bf < 3 || bf > 60) {
      hint = 'Выбери % жира → увидишь расчёт по формуле Кетча–МакАрдла.'
    } else if (weight <= 0) {
      hint = '⚠️  Введи вес хотя бы за один день в таблице выше.'
    } else {
      const lbm = weight * (1 - bf / 100)
      const bmr = 370 + 21.6 * lbm
      const actFactor = ACTIVITY_LEVELS.find(a => a[0] === activity)?.[1] ?? 1.55
      const tdee = bmr * actFactor
      const goalDelta = GOALS.find(g => g[0] === goal)?.[1] ?? 0
      const target = tdee + goalDelta
      computed = true
      buildCards(bmr, tdee, target, goalDelta, weight, height, waistCm, hipCm, sex, cards)
      const dir = goalDelta < 0 ? 'дефицит' : goalDelta > 0 ? 'профицит' : ''
      hint = dir
        ? `Кетч–МакАрдл · % жира ${bf}% · ЧТМ ${lbm.toFixed(1)} кг  |  TDEE ${tdee.toFixed(0)} ккал  ${dir} ${Math.abs(goalDelta)} ккал  →  Цель ${target.toFixed(0)} ккал/день`
        : `Кетч–МакАрдл · % жира ${bf}%  |  Поддерживающая норма ${tdee.toFixed(0)} ккал/день`
    }
  } else {
    const ageN = parseInt(age)
    if (!ageN || ageN < 5 || ageN > 120) {
      hint = 'Выбери возраст → увидишь расчёт.'
    } else if (weight <= 0) {
      hint = '⚠️  Введи вес хотя бы за один день в таблице выше.'
    } else if (height <= 0) {
      hint = '⚠️  Укажи рост через кнопку «Рост» в шапке.'
    } else {
      const bmr = sex === 'Мужской'
        ? 10 * weight + 6.25 * height - 5 * ageN + 5
        : 10 * weight + 6.25 * height - 5 * ageN - 161
      const actFactor = ACTIVITY_LEVELS.find(a => a[0] === activity)?.[1] ?? 1.55
      const tdee = bmr * actFactor
      const goalDelta = GOALS.find(g => g[0] === goal)?.[1] ?? 0
      const target = tdee + goalDelta
      computed = true
      buildCards(bmr, tdee, target, goalDelta, weight, height, waistCm, hipCm, sex, cards)
      const dir = goalDelta < 0 ? 'дефицит' : goalDelta > 0 ? 'профицит' : ''
      hint = dir
        ? `Миффлин · ${weight.toFixed(1)} кг · ${height.toFixed(0)} см · ${ageN} лет  |  TDEE ${tdee.toFixed(0)} ккал  ${dir} ${Math.abs(goalDelta)} ккал  →  Цель ${target.toFixed(0)} ккал/день`
        : `Миффлин · ${weight.toFixed(1)} кг · ${height.toFixed(0)} см · ${ageN} лет  |  Поддерживающая норма ${tdee.toFixed(0)} ккал/день`
    }
  }

  const actShort = activity.length > 28 ? activity.slice(0, 28) + '…' : activity

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>⚡ Калораж</div>

      {/* Карточки — сверху */}
      {computed && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
          {cards.map((c, i) => (
            <RoundedCard key={i} {...c} />
          ))}
        </div>
      )}

      {/* Строка 1: формула, возраст, пол */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ color: C.SECONDARY, fontSize: 13 }}>Формула:</span>
        <Dropdown items={FORMULAS} value={formula} onPick={setFormula} width={220} />

        <span style={{ color: C.SECONDARY, fontSize: 13 }}>Возраст:</span>
        <Dropdown items={AGES} value={age || '—'} onPick={setAge} width={60} label={age || '—'} />

        <span style={{ color: C.SECONDARY, fontSize: 13 }}>Пол:</span>
        <Dropdown items={SEXES} value={sex} onPick={setSex} width={90} />

        {isKatch && (
          <>
            <span style={{ color: C.SECONDARY, fontSize: 13 }}>% жира:</span>
            <Dropdown items={BODYFAT} value={bodyfat || '—'} onPick={setBodyfat} width={65} label={bodyfat ? `${bodyfat}%` : '—'} />
            <span style={{ color: C.SECONDARY, fontSize: 12 }}>(нужен для формулы Кетча)</span>
          </>
        )}
      </div>

      {/* Строка 2: активность, цель */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ color: C.SECONDARY, fontSize: 13 }}>Активность:</span>
        <Dropdown items={ACTIVITY_LEVELS.map(a => a[0])} value={activity} onPick={setActivity} width={250} label={actShort} />

        <span style={{ color: C.SECONDARY, fontSize: 13 }}>Цель:</span>
        <Dropdown items={GOALS.map(g => g[0])} value={goal} onPick={setGoal} width={200} />
      </div>

      <div style={{ color: C.SECONDARY, fontSize: 13 }}>{hint}</div>
    </div>
  )
}

function buildCards(
  bmr: number, tdee: number, target: number, goalDelta: number,
  weight: number, height: number, waist: number, hip: number, sex: string,
  cards: { title: string; value: string; unit: string; color: string }[]
) {
  const tColor = goalDelta < 0 ? C.SUCCESS : goalDelta > 0 ? C.WARNING : '#0A84FF'
  const protein = target * 0.30 / 4
  const fat     = target * 0.30 / 9
  const carbs   = target * 0.40 / 4
  const actFactor = 1.55 // approx, used for water
  const waterL  = (weight * 35 + (actFactor >= 1.725 ? 500 : 0)) / 1000

  cards.push(
    { title: 'BMR',      value: bmr.toFixed(0),     unit: 'ккал/день в покое', color: '#8E8E93' },
    { title: 'TDEE',     value: tdee.toFixed(0),    unit: 'ккал/день расход',  color: '#0A84FF' },
    { title: 'Цель',     value: target.toFixed(0),  unit: 'ккал/день есть',    color: tColor    },
    { title: 'Белок',    value: protein.toFixed(0), unit: 'г / день',          color: '#30D158' },
    { title: 'Жиры',     value: fat.toFixed(0),     unit: 'г / день',          color: '#FF9F0A' },
    { title: 'Углеводы', value: carbs.toFixed(0),   unit: 'г / день',          color: '#0A84FF' },
    { title: 'Вода',     value: waterL.toFixed(1),  unit: 'л / день',          color: '#0A84FF' },
  )

  if (waist > 0 && height > 0) {
    const whtr = waist / height
    const [lt, lc] = whtr < 0.46 ? ['Дефицит', '#0A84FF']
                   : whtr <= 0.53 ? ['Норма ✓', '#30D158']
                   : whtr <= 0.58 ? ['Избыток', '#FF9F0A']
                   : ['Высокий', '#FF453A']
    cards.push({ title: 'WHtR', value: whtr.toFixed(2), unit: lt, color: lc })
  }

  if (waist > 0 && hip > 0) {
    const whr  = waist / hip
    const norm = sex === 'Мужской' ? 0.9 : 0.85
    const [lt, lc] = whr <= norm ? ['Норма ✓', '#30D158']
                   : whr <= norm + 0.05 ? ['Умеренный', '#FF9F0A']
                   : ['Высокий', '#FF453A']
    cards.push({ title: 'WHR', value: whr.toFixed(2), unit: lt, color: lc })
  }
}