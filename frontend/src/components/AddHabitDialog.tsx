import { useState } from 'react'
import { C } from '../styles/theme'
import { useDataStore } from '../store/dataStore'
import type { Goal } from '../types'

const ICONS = [
  // Спорт
  '🏋️','🧘','🚴','🏃','🤸','🏊','🚵','🧗','⚽','🏀',
  '🎾','🥊','🏄','🤽','⛷️','🏂','🛹','🪂','🚶','🧎',
  // Обучение
  '📚','✍️','🎯','💡','🧠','📖','🗒️','📝','🎓','🔬',
  '🔭','💻','📊','📈','🗂️','📌','✏️','🗺️','🧮','📜',
  // Питание и здоровье
  '🥗','💧','🍎','🥦','🥑','🍳','🥤','🫖','🍇','🥕',
  '🫐','🍓','🥝','🍋','🥜','🥚','💊','🩺','🧬','🫀',
  // Режим
  '😴','🌅','🌙','🛁','⏰','🧹','🛀','☀️','⏳','🕯️',
  '🚿','🧴','🧼','💤','🌄','🌇','🌆','🌃','🌠','🌌',
  // Финансы
  '💰','📵','💳','🏦','📱','⌚','🗓️','✔️','🔐','💼',
  '🪙','💵','📉','🔔','⏱️','🗝️','📤','📥','💹','🏧',
  // Творчество
  '🎵','🎨','🎮','🧩','♟️','🎭','🎬','🎤','🎸','🎹',
  '🎺','🥁','🎻','🪗','🖼️','🧶','✂️','🎲','🎳','🪀',
  // Природа
  '🌿','❤️','🔥','⭐','✅','💪','🌈','🎉','🏆','🦋',
  '🌱','🌳','🌺','🌸','🍀','🌻','🌾','🍃','🌊','🏔️',
]

const CATEGORIES = ['Здоровье', 'Продуктивность', 'Саморазвитие', 'Другое']

const CAT_COLORS: Record<string, string> = {
  'Здоровье':       '#30D158',
  'Продуктивность': '#0A84FF',
  'Саморазвитие':   '#BF5AF2',
  'Другое':         '#8E8E93',
}

const PRESETS = [
  { label: '💧 8 стак.',  target: 8,     unit: 'стак.' },
  { label: '🚶 10k шаг',  target: 10000, unit: 'шаг'   },
  { label: '📖 30 мин',   target: 30,    unit: 'мин'   },
  { label: '🏋️ 3 подх.',  target: 3,     unit: 'подх.' },
  { label: '🥦 5 порций', target: 5,     unit: 'порций'},
]

interface Props {
  onClose: () => void
}

export default function AddHabitDialog({ onClose }: Props) {
  const { addHabit } = useDataStore()

  const [name,     setName]     = useState('')
  const [icon,     setIcon]     = useState('⭐')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [goalType, setGoalType] = useState<'boolean' | 'numeric'>('boolean')
  const [target,   setTarget]   = useState('8')
  const [unit,     setUnit]     = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const goal: Goal = goalType === 'numeric'
      ? { type: 'numeric', target: parseFloat(target) || 1, unit }
      : { type: 'boolean' }
    addHabit(trimmed, icon, category, goal)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{
        background: C.BG2,
        border: `1px solid ${C.BORDER}`,
        borderRadius: 16,
        width: '90%',
        maxWidth: 620,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>

        {/* Заголовок */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.TEXT }}>
            Новая привычка
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: C.SECONDARY, fontSize: 20,
            cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Название */}
        <Section label="Название">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Например: Медитация"
            style={{
              width: '100%',
              background: C.CARD,
              border: `1.5px solid ${C.BORDER}`,
              borderRadius: 10,
              color: C.TEXT,
              fontSize: 14,
              padding: '10px 14px',
              outline: 'none',
              fontFamily: C.FONT,
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = C.ACCENT)}
            onBlur={e  => (e.target.style.borderColor = C.BORDER)}
          />
        </Section>

        {/* Иконка */}
        <Section label="Иконка">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
          }}>
            {ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  width: 40, height: 36,
                  background: ic === icon ? C.ACCENT + '33' : C.CARD,
                  border: `1.5px solid ${ic === icon ? C.ACCENT : 'transparent'}`,
                  borderRadius: 8,
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </Section>

        {/* Категория */}
        <Section label="Категория">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const color = CAT_COLORS[cat] ?? C.SECONDARY
              const active = category === cat
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  background: active ? color + '22' : C.CARD,
                  border: `1.5px solid ${active ? color : C.BORDER}`,
                  borderRadius: 20,
                  color: active ? color : C.SECONDARY,
                  padding: '6px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: C.FONT,
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                }}>
                  {cat}
                </button>
              )
            })}
          </div>
        </Section>

        {/* Тип цели */}
        <Section label="Тип цели">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['boolean', 'numeric'] as const).map(gt => (
              <button key={gt} onClick={() => setGoalType(gt)} style={{
                background: goalType === gt ? C.ACCENT : C.CARD,
                border: `1.5px solid ${goalType === gt ? C.ACCENT : C.BORDER}`,
                borderRadius: 20,
                color: goalType === gt ? '#fff' : C.SECONDARY,
                padding: '6px 18px',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: C.FONT,
                transition: 'all 0.15s',
              }}>
                {gt === 'boolean' ? '✓ Да / Нет' : '⊕ Числовая'}
              </button>
            ))}
          </div>

          <p style={{ margin: 0, fontSize: 12, color: C.SECONDARY, fontStyle: 'italic' }}>
            {goalType === 'boolean'
              ? 'Просто отметить выполнено'
              : 'Счётчик: стаканы, шаги, минуты…'}
          </p>

          {goalType === 'numeric' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {/* Цель */}
                <div>
                  <label style={{ fontSize: 12, color: C.SECONDARY, display: 'block', marginBottom: 4 }}>
                    Цель (число)
                  </label>
                  <input
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    style={{
                      width: 80,
                      background: C.CARD,
                      border: `1.5px solid ${C.BORDER}`,
                      borderRadius: 8,
                      color: C.TEXT,
                      fontSize: 16,
                      fontWeight: 700,
                      padding: '8px 10px',
                      textAlign: 'center',
                      outline: 'none',
                      fontFamily: C.FONT,
                    }}
                    onFocus={e => (e.target.style.borderColor = C.ACCENT)}
                    onBlur={e  => (e.target.style.borderColor = C.BORDER)}
                  />
                </div>
                {/* Единицы */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: C.SECONDARY, display: 'block', marginBottom: 4 }}>
                    Единицы измерения
                  </label>
                  <input
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="стак., шаг, мин…"
                    style={{
                      width: '100%',
                      background: C.CARD,
                      border: `1.5px solid ${C.BORDER}`,
                      borderRadius: 8,
                      color: C.TEXT,
                      fontSize: 14,
                      padding: '8px 12px',
                      outline: 'none',
                      fontFamily: C.FONT,
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = C.ACCENT)}
                    onBlur={e  => (e.target.style.borderColor = C.BORDER)}
                  />
                </div>
              </div>

              {/* Пресеты */}
              <div>
                <span style={{ fontSize: 12, color: C.SECONDARY }}>Быстрый выбор: </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => {
                      setTarget(String(p.target))
                      setUnit(p.unit)
                    }} style={{
                      background: C.BG,
                      border: `1px solid ${C.BORDER}`,
                      borderRadius: 8,
                      color: C.TEXT,
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: C.FONT,
                    }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          paddingTop: 4,
          borderTop: `1px solid ${C.BORDER}`,
        }}>
          <button onClick={onClose} style={{
            background: C.CARD,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 10,
            color: C.TEXT,
            padding: '8px 20px',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: C.FONT,
          }}>
            Отмена
          </button>
          <button onClick={handleAdd} style={{
            background: C.ACCENT,
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            padding: '8px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: C.FONT,
          }}>
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 14, background: C.ACCENT, borderRadius: 2 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}