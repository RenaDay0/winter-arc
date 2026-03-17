import { useState } from 'react'
import { C } from '../styles/theme'
import { useDataStore } from '../store/dataStore'
import type { Goal } from '../types'

const ICONS = [
  '🏃','💪','📚','🧘','🥗','💧','😴','🚴','🏊','✍️',
  '🎯','🧹','💊','🚶','🎨','🎸','🧠','💻','🌿','⚡',
]

const CATEGORIES = ['Здоровье','Спорт','Саморазвитие','Питание','Сон','Другое']

interface Props {
  onClose: () => void
}

export default function AddHabitDialog({ onClose }: Props) {
  const { addHabit } = useDataStore()

  const [name,     setName]     = useState('')
  const [icon,     setIcon]     = useState('🎯')
  const [category, setCategory] = useState('Другое')
  const [goalType, setGoalType] = useState<'boolean' | 'numeric'>('boolean')
  const [target,   setTarget]   = useState(1)
  const [unit,     setUnit]     = useState('')

  const confirm = () => {
    const trimmed = name.trim().slice(0, 40)
    if (!trimmed) return
    const goal: Goal = goalType === 'numeric'
      ? { type: 'numeric', target, unit }
      : { type: 'boolean' }
    addHabit(trimmed, icon, category, goal)
    onClose()
  }

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 50,
        }}
      />

      {/* Карточка */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        background: C.BG2,
        border: `1px solid ${C.BORDER}`,
        borderRadius: 16,
        padding: 24,
        width: 420,
        maxWidth: '95vw',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, color: C.TEXT }}>
            + Новая привычка
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Название */}
        <label style={labelStyle}>Название</label>
        <input
          autoFocus
          type="text"
          value={name}
          maxLength={40}
          placeholder="Например: Чтение"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && confirm()}
          style={inputStyle}
        />

        {/* Иконка */}
        <label style={labelStyle}>Иконка</label>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
        }}>
          {ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              style={{
                width: 36, height: 36,
                borderRadius: 8,
                background: icon === ic ? C.ACCENT + '33' : C.CARD,
                border: `1.5px solid ${icon === ic ? C.ACCENT : C.BORDER}`,
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              {ic}
            </button>
          ))}
        </div>

        {/* Категория */}
        <label style={labelStyle}>Категория</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                background: category === cat
                  ? (C.CATEGORIES[cat] ?? C.ACCENT) + '33'
                  : C.CARD,
                border: `1.5px solid ${category === cat
                  ? (C.CATEGORIES[cat] ?? C.ACCENT)
                  : C.BORDER}`,
                color: category === cat
                  ? (C.CATEGORIES[cat] ?? C.ACCENT)
                  : C.SECONDARY,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: C.FONT,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Тип цели */}
        <label style={labelStyle}>Тип цели</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['boolean', 'numeric'] as const).map(t => (
            <button
              key={t}
              onClick={() => setGoalType(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                background: goalType === t ? C.ACCENT + '33' : C.CARD,
                border: `1.5px solid ${goalType === t ? C.ACCENT : C.BORDER}`,
                color: goalType === t ? C.ACCENT : C.SECONDARY,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: C.FONT,
              }}
            >
              {t === 'boolean' ? '✓ Выполнено / нет' : '🔢 Числовая'}
            </button>
          ))}
        </div>

        {/* Числовые параметры */}
        {goalType === 'numeric' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Цель</label>
              <input
                type="number"
                min={1}
                value={target}
                onChange={e => setTarget(parseFloat(e.target.value) || 1)}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Единица</label>
              <input
                type="text"
                placeholder="км, мин, раз..."
                value={unit}
                onChange={e => setUnit(e.target.value)}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={secondaryBtnStyle}>
            Отмена
          </button>
          <button
            onClick={confirm}
            disabled={!name.trim()}
            style={{
              ...primaryBtnStyle,
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            Добавить
          </button>
        </div>
      </div>
    </>
  )
}

// ── Стили ─────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: C.SECONDARY,
  marginBottom: 6,
  fontFamily: C.FONT,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: C.CARD,
  border: `1px solid ${C.BORDER}`,
  borderRadius: 8,
  color: C.TEXT,
  fontSize: 14,
  padding: '8px 12px',
  outline: 'none',
  fontFamily: C.FONT,
  marginBottom: 16,
  boxSizing: 'border-box',
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: C.SECONDARY,
  fontSize: 18,
  cursor: 'pointer',
  padding: '0 4px',
}

const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  borderRadius: 8,
  background: C.ACCENT,
  border: 'none',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: C.FONT,
}

const secondaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  borderRadius: 8,
  background: C.CARD,
  border: `1px solid ${C.BORDER}`,
  color: C.TEXT,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: C.FONT,
}