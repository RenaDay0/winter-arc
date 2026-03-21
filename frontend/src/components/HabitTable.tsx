import { useState, useCallback } from 'react'
import { C } from '../styles/theme'
import { useDataStore, daysInMonth } from '../store/dataStore'

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day
}

function moodColor(score: number): string {
  if (score <= 0) return C.BORDER
  if (score <= 3) return C.DANGER
  if (score <= 5) return C.WARNING
  if (score <= 7) return C.ACCENT
  return C.SUCCESS
}

const CELL  = 44
const LABEL = 200

const noSpinnerStyle = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`

// ── Ячейки ────────────────────────────────────────────────────────────────────

function SleepCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  if (editing) return (
    <input autoFocus type="number" min={0} max={24} step={0.5}
      defaultValue={value || ''}
      onBlur={e  => { onChange(parseFloat(e.target.value) || 0); setEditing(false) }}
      onKeyDown={e => {
        if (e.key === 'Enter')  { onChange(parseFloat((e.target as HTMLInputElement).value) || 0); setEditing(false) }
        if (e.key === 'Escape') setEditing(false)
      }}
      style={{ width: CELL - 4, height: 34, background: C.BG, border: `1.5px solid ${C.ACCENT}`,
        borderRadius: 6, color: C.TEXT, fontSize: 13, textAlign: 'center', outline: 'none', padding: 0 }} />
  )
  const bg    = value >= 7 ? C.SUCCESS : value > 0 ? C.WARNING : C.CARD
  const color = value >= 7 ? C.SUCCESS : value > 0 ? C.WARNING : C.SECONDARY
  return (
    <div onClick={() => setEditing(true)} style={{
      width: CELL - 4, height: 34, margin: '0 auto', borderRadius: 6,
      background: value > 0 ? bg + '33' : C.CARD, border: `1px solid ${value > 0 ? bg : C.BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'text', fontSize: 13, color: value > 0 ? color : 'transparent',
    }}>
      {value > 0 ? value : '·'}
    </div>
  )
}

function WeightCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  if (editing) return (
    <input autoFocus type="number" min={0} step={0.1}
      defaultValue={value || ''}
      onBlur={e  => { onChange(parseFloat(e.target.value) || 0); setEditing(false) }}
      onKeyDown={e => {
        if (e.key === 'Enter')  { onChange(parseFloat((e.target as HTMLInputElement).value) || 0); setEditing(false) }
        if (e.key === 'Escape') setEditing(false)
      }}
      style={{ width: CELL - 4, height: 34, background: C.BG, border: `1.5px solid ${C.ACCENT}`,
        borderRadius: 6, color: C.TEXT, fontSize: 12, textAlign: 'center', outline: 'none', padding: 0 }} />
  )
  return (
    <div onClick={() => setEditing(true)} style={{
      width: CELL - 4, height: 34, margin: '0 auto', borderRadius: 6,
      background: value > 0 ? C.SUCCESS + '33' : C.CARD, border: `1px solid ${value > 0 ? C.SUCCESS : C.BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'text', fontSize: 12, color: value > 0 ? C.SUCCESS : 'transparent',
    }}>
      {value > 0 ? value : '·'}
    </div>
  )
}

function MoodCell({ score, note, onChange, cellKey, openKey, setOpenKey }: {
  score: number; note: string; onChange: (s: number, n: string) => void
  cellKey: string; openKey: string | null; setOpenKey: (k: string | null) => void
}) {
  const [localNote, setLocalNote] = useState(note)
  const color = moodColor(score)
  const isOpen = openKey === cellKey

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpenKey(isOpen ? null : cellKey)} style={{
        width: CELL - 4, height: 34, margin: '0 auto', borderRadius: 6,
        background: score > 0 ? color + '33' : C.CARD, border: `1px solid ${score > 0 ? color : C.BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        color: score > 0 ? color : 'transparent', position: 'relative',
      }}>
        {score > 0 ? score : '·'}
        {note && score > 0 && (
          <div style={{ position: 'absolute', top: 2, right: 2, width: 5, height: 5, borderRadius: '50%', background: C.WARNING }} />
        )}
      </div>
      {isOpen && (
        <div style={{
          position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: C.CARD, border: `1px solid ${C.BORDER}`,
          borderRadius: 12, padding: 12, width: 250,
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(v => (
              <button key={v} onClick={() => { onChange(v, localNote); setOpenKey(null) }} style={{
                width: 34, height: 34, borderRadius: 7,
                background: score === v ? moodColor(v) + '55' : C.BG2,
                border: `1.5px solid ${moodColor(v)}`,
                color: moodColor(v), cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: 0,
              }}>{v}</button>
            ))}
          </div>
          <input type="text" placeholder="📝 заметка..." value={localNote} maxLength={60}
            onChange={e => setLocalNote(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  { onChange(score, localNote); setOpenKey(null) }
              if (e.key === 'Escape') setOpenKey(null)
            }}
            style={{
              width: '100%', background: C.BG2, border: `1px solid ${C.BORDER}`,
              borderRadius: 7, color: C.TEXT, fontSize: 13, padding: '6px 10px',
              outline: 'none', boxSizing: 'border-box',
            }} />
        </div>
      )}
    </div>
  )
}

function NumericHabitCell({ value, target, onChange }: {
  value: number; target: number; onChange: (v: number) => void
}) {
  const done = value >= target
  return (
    <div onClick={() => onChange(value >= target * 2 ? 0 : value + 1)} style={{
      height: 34, margin: '0 auto', borderRadius: 6, minWidth: CELL - 4, padding: '0 4px',
      background: done ? C.SUCCESS + '33' : value > 0 ? C.ACCENT + '22' : C.CARD,
      border: `1px solid ${done ? C.SUCCESS : value > 0 ? C.ACCENT : C.BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      color: done ? C.SUCCESS : value > 0 ? C.ACCENT : C.SECONDARY,
    }}>
      {value}/{target}
    </div>
  )
}

function ToggleCell({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      width: CELL - 4, height: 34, margin: '0 auto', borderRadius: 6,
      background: done ? C.SUCCESS + '33' : C.CARD, border: `1px solid ${done ? C.SUCCESS : C.BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: 18, color: C.SUCCESS, transition: 'all 0.1s',
    }}>
      {done ? '✓' : ''}
    </div>
  )
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function HabitTable({ ym }: { ym: string }) {
  const store = useDataStore()
  const { toggleHabit, setSleep, setWeight, setMood, deleteHabit } = store

  const [y, m] = ym.split('-').map(Number)
  const md   = store.getCurrentMonth(ym)
  const days = daysInMonth(ym)
  const cols = Array.from({ length: days }, (_, i) => i + 1)

  const [openMoodKey, setOpenMoodKey] = useState<string | null>(null)

  const DOW = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

  const catOrder: string[] = []
  const catMap: Record<string, string[]> = {}
  for (const h of md.habits) {
    const cat = md.categories[h] ?? 'Другое'
    if (!catMap[cat]) { catMap[cat] = []; catOrder.push(cat) }
    catMap[cat].push(h)
  }

  const totals = cols.map((_, d) => {
    if (!md.habits.length) return null
    let sum = 0
    for (const h of md.habits) {
      const goal = md.goals[h] ?? { type: 'boolean' }
      const v    = (md.data[h] ?? [])[d] ?? 0
      sum += goal.type === 'numeric' ? Math.min(v / (goal.target || 1), 1) : v > 0 ? 1 : 0
    }
    return sum / md.habits.length
  })

  const avgTotal = (() => {
    const valid = totals.filter((t): t is number => t !== null && t > 0)
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  })()

  const tdBase: React.CSSProperties = { borderBottom: `1px solid ${C.BORDER}`, textAlign: 'center', padding: '2px 1px' }
  const stickyLeft: React.CSSProperties = { position: 'sticky', left: 0, zIndex: 2 }

  // Выделение сегодняшнего дня — рамка без фона
  const TODAY_TEXT     = '#FFFFFF'

  return (
    <div style={{ overflowX: 'auto' }} onClick={e => {
      if ((e.target as HTMLElement).closest('[data-mood-popup]')) return
      setOpenMoodKey(null)
    }}>
      <style>{noSpinnerStyle}</style>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontFamily: C.FONT }}>
        <thead>
          <tr>
            <th style={{
              ...stickyLeft, background: C.BG2, borderBottom: `1px solid ${C.BORDER}`,
              width: LABEL, minWidth: LABEL, padding: '8px 14px', textAlign: 'left',
              color: C.SECONDARY, fontWeight: 600, fontSize: 14,
            }}>
              Привычка
            </th>
            {cols.map(d => {
              const dow   = new Date(y, m - 1, d).getDay()
              const today = isToday(y, m, d)
              const isWE  = dow === 0 || dow === 6
              return (
                <th key={d} style={{
                  width: CELL, minWidth: CELL, textAlign: 'center', padding: '4px 0', fontWeight: 400,
                  background: C.BG2,
                  borderBottom: `1px solid ${C.BORDER}`,
                }}>
                  <div style={{ fontSize: 11, color: isWE ? C.WARNING : C.SECONDARY, lineHeight: 1.3 }}>{DOW[dow]}</div>
                  <div style={{ fontSize: 14, fontWeight: today ? 700 : 400, color: today ? TODAY_TEXT : C.TEXT }}>{d}</div>
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {/* Сон */}
          <tr>
            <td style={{ ...stickyLeft, background: C.BG2, ...tdBase, padding: '5px 14px' }}>
              <span style={{ color: C.ACCENT, fontWeight: 600, fontSize: 14 }}>😴 Сон</span>
            </td>
            {cols.map((_, i) => {
              const today = isToday(y, m, i+1)
              return (
                <td key={i} style={{ ...tdBase, }}>
                  <SleepCell value={md.sleep[i] ?? 0} onChange={v => setSleep(i, v, ym)} />
                </td>
              )
            })}
          </tr>

          {/* Вес */}
          <tr>
            <td style={{ ...stickyLeft, background: C.BG2, ...tdBase, padding: '5px 14px' }}>
              <span style={{ color: C.SUCCESS, fontWeight: 600, fontSize: 14 }}>⚖️ Вес(кг)</span>
            </td>
            {cols.map((_, i) => {
              const today = isToday(y, m, i+1)
              return (
                <td key={i} style={{ ...tdBase, }}>
                  <WeightCell value={md.weight[i] ?? 0} onChange={v => setWeight(i, v, ym)} />
                </td>
              )
            })}
          </tr>

          {/* Оценка дня */}
          <tr>
            <td style={{ ...stickyLeft, background: C.BG2, ...tdBase, padding: '5px 14px' }}>
              <span style={{ color: '#BF5AF2', fontWeight: 600, fontSize: 14 }}>⭐ День</span>
            </td>
            {cols.map((_, i) => {
              const today = isToday(y, m, i+1)
              return (
                <td key={i} data-mood-popup style={{ ...tdBase, }}>
                  <MoodCell
                    score={md.mood[i] ?? 0}
                    note={md.notes[String(i)] ?? ''}
                    onChange={(sc, nt) => setMood(i, sc, nt, ym)}
                    cellKey={`mood-${i}`}
                    openKey={openMoodKey}
                    setOpenKey={setOpenMoodKey}
                  />
                </td>
              )
            })}
          </tr>

          <tr><td colSpan={days + 1} style={{ height: 6, background: C.BG }} /></tr>

          {/* Привычки */}
          {md.habits.length === 0 ? (
            <tr>
              <td colSpan={days + 1} style={{ padding: '40px 0', textAlign: 'center', color: C.SECONDARY, fontSize: 14 }}>
                Нет привычек — нажми «+ Привычка» чтобы добавить
              </td>
            </tr>
          ) : (
            catOrder.flatMap(cat => {
              const catColor = C.CATEGORIES[cat] ?? C.SECONDARY
              return [
                <tr key={`sep-${cat}`}>
                  <td colSpan={days + 1} style={{ background: C.BG, padding: '3px 14px', borderBottom: `1px solid ${C.BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 3, height: 13, borderRadius: 2, background: catColor }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: catColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{cat}</span>
                    </div>
                  </td>
                </tr>,

                ...catMap[cat].map(habit => {
                  const goal   = md.goals[habit]  ?? { type: 'boolean' }
                  const values = md.data[habit]    ?? Array(days).fill(0)
                  const icon   = md.icons[habit]   ?? '✦'
                  const num    = md.habits.indexOf(habit) + 1

                  return (
                    <tr key={habit}>
                      <td style={{ ...stickyLeft, background: C.BG, ...tdBase, padding: '4px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: C.SECONDARY, fontSize: 12, minWidth: 18 }}>{num}.</span>
                          <span style={{ fontSize: 16 }}>{icon}</span>
                          <span style={{ flex: 1, color: C.TEXT, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit}</span>
                          {goal.type === 'numeric' && goal.unit && (
                            <span style={{ color: C.SECONDARY, fontSize: 10, whiteSpace: 'nowrap' }}>/{goal.unit}</span>
                          )}
                          <button onClick={() => deleteHabit(habit, ym)} style={{
                            background: 'none', border: 'none', color: C.SECONDARY,
                            cursor: 'pointer', fontSize: 13, padding: '0 2px', opacity: 0.5,
                          }}>✕</button>
                        </div>
                      </td>

                      {cols.map((_, i) => {
                        const today = isToday(y, m, i + 1)
                        const val   = values[i] ?? 0
                        return (
                          <td key={i} style={{
                            ...tdBase,
                          }}>
                            {goal.type === 'numeric' ? (
                              <NumericHabitCell value={val} target={goal.target ?? 1} onChange={v => toggleHabit(habit, i, v, ym)} />
                            ) : (
                              <ToggleCell done={!!val} onClick={() => toggleHabit(habit, i, val ? 0 : 1, ym)} />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }),
              ]
            })
          )}

          {/* Итого */}
          {md.habits.length > 0 && (
            <tr>
              <td style={{ ...stickyLeft, background: C.BG2, ...tdBase, padding: '5px 14px' }}>
                <span style={{ color: C.SECONDARY, fontSize: 13 }}>✓ Итого</span>
                <span style={{ color: C.SECONDARY, fontSize: 10, marginLeft: 8 }}>ср.{avgTotal.toFixed(1)}/{md.habits.length}</span>
              </td>
              {cols.map((_, i) => {
                const t     = totals[i]
                const today = isToday(y, m, i + 1)
                const done  = t !== null ? Math.round(t * md.habits.length) : 0
                const pct   = t ?? 0
                const color = pct >= 0.8 ? C.SUCCESS : pct >= 0.5 ? C.WARNING : pct > 0 ? C.SECONDARY : C.BORDER
                return (
                  <td key={i} style={{ ...tdBase, background: C.BG2,
                    borderBottom: `1px solid ${C.BORDER}`,
                  }}>
                    <span style={{ fontSize: 11, color }}>{done}/{md.habits.length}</span>
                  </td>
                )
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}