import { useState } from 'react'
import { C } from '../styles/theme'
import { useDataStore } from '../store/dataStore'

const CATEGORIES = ['Здоровье', 'Спорт', 'Саморазвитие', 'Питание', 'Сон', 'Другое']
const ICONS = ['🏃', '💪', '📚', '🎯', '😴', '🥗', '📱', '✍️', '🧘', '🚴']

export default function AddHabitDialog({ onClose }: { onClose: () => void }) {
  const store = useDataStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏃')
  const [category, setCategory] = useState('Другое')
  const [type, setType] = useState<'boolean' | 'numeric'>('boolean')
  const [target, setTarget] = useState('1')

  const handleAdd = () => {
    if (!name.trim()) return
    store.addHabit(name, icon, category, {
      type,
      target: type === 'numeric' ? parseFloat(target) || 1 : undefined,
    })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: C.BG,
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ color: C.TEXT, marginBottom: 16 }}>+ Новая привычка</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.SECONDARY, fontSize: 12 }}>Название:</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Зарядка"
            style={{
              width: '100%',
              padding: '8px 12px',
              background: C.CARD,
              border: `1px solid ${C.BORDER}`,
              borderRadius: 6,
              color: C.TEXT,
              marginTop: 4,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.SECONDARY, fontSize: 12 }}>Иконка:</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  fontSize: 20,
                  padding: 6,
                  background: icon === ic ? C.ACCENT : C.CARD,
                  border: `1px solid ${C.BORDER}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.SECONDARY, fontSize: 12 }}>Категория:</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: C.CARD,
              border: `1px solid ${C.BORDER}`,
              borderRadius: 6,
              color: C.TEXT,
              marginTop: 4,
              boxSizing: 'border-box',
            }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.SECONDARY, fontSize: 12 }}>Тип:</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => setType('boolean')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: type === 'boolean' ? C.ACCENT : C.CARD,
                color: type === 'boolean' ? '#fff' : C.TEXT,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Да/Нет
            </button>
            <button
              onClick={() => setType('numeric')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: type === 'numeric' ? C.ACCENT : C.CARD,
                color: type === 'numeric' ? '#fff' : C.TEXT,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Число
            </button>
          </div>
        </div>

        {type === 'numeric' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: C.SECONDARY, fontSize: 12 }}>Цель:</label>
            <input
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: C.CARD,
                border: `1px solid ${C.BORDER}`,
                borderRadius: 6,
                color: C.TEXT,
                marginTop: 4,
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: C.CARD,
              color: C.TEXT,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleAdd}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: C.ACCENT,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}