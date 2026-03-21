import { create } from 'zustand'
import type { AppData, MonthData, Goal } from '../types'
import { loadData, saveData, isLoggedIn } from '../api'

const STORAGE_KEY = 'winter_arc_data'
export const SCHEMA_VERSION = 5

export function daysInMonth(ymOrYear: string | number, month?: number): number {
  try {
    if (typeof ymOrYear === 'string') {
      const parts = ymOrYear.split('-')
      if (parts.length !== 2) return 30
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10)
      if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return 30
      return new Date(y, m, 0).getDate()
    }
    if (month && month >= 1 && month <= 12) {
      return new Date(ymOrYear as number, month, 0).getDate()
    }
    return 30
  } catch { return 30 }
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function createEmptyMonth(ym: string): MonthData {
  const d = daysInMonth(ym)
  const n = d >= 1 && d <= 31 ? d : 30
  return {
    habits: [], data: {},
    sleep:  Array(n).fill(0) as number[],
    weight: Array(n).fill(0) as number[],
    mood:   Array(n).fill(0) as number[],
    notes: {}, log: {}, icons: {}, categories: {}, goals: {},
  }
}

function padArray<T>(arr: T[], length: number, fill: T): T[] {
  if (arr.length >= length) return arr.slice(0, length)
  return [...arr, ...Array(length - arr.length).fill(fill) as T[]]
}

function normalizeMonth(md: MonthData, ym: string): MonthData {
  const d = daysInMonth(ym)
  const n = d >= 1 && d <= 31 ? d : 30
  return {
    ...md,
    sleep:      padArray(md.sleep  ?? [], n, 0),
    weight:     padArray(md.weight ?? [], n, 0),
    mood:       padArray(md.mood   ?? [], n, 0),
    notes:      md.notes      ?? {},
    log:        md.log        ?? {},
    icons:      md.icons      ?? {},
    categories: md.categories ?? {},
    goals:      md.goals      ?? {},
    data: Object.fromEntries(
      (md.habits ?? []).map(h => [h, padArray(md.data?.[h] ?? [], n, 0)])
    ),
  }
}

interface StorageRoot {
  schema_version?: number
  months?: Record<string, MonthData>
  heightCm?: number
  measurements?: Record<string, { waist: number; hip: number }>
}

function migrate(raw: StorageRoot): StorageRoot {
  const v = raw.schema_version ?? 0
  if (v < 5) {
    Object.entries(raw.months ?? {}).forEach(([ym, md]) => {
      const d = daysInMonth(ym)
      const n = d >= 1 && d <= 31 ? d : 30
      if (!md.mood)  md.mood  = Array(n).fill(0) as number[]
      if (!md.notes) md.notes = {}
    })
    raw.schema_version = 5
  }
  return raw
}

function loadStorage(): StorageRoot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrate(JSON.parse(raw) as StorageRoot)
  } catch { /* первый запуск */ }
  return { months: {}, schema_version: SCHEMA_VERSION }
}

function persist(
  data: AppData,
  heightCm: number,
  measurements: Record<string, { waist: number; hip: number }>
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schema_version: SCHEMA_VERSION,
    months: data.months,
    heightCm,
    measurements,
  }))
}

let syncTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSync(
  data: AppData,
  heightCm: number,
  measurements: Record<string, { waist: number; hip: number }>
) {
  if (!isLoggedIn()) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const payload = JSON.stringify({
      schema_version: SCHEMA_VERSION,
      months: data.months,
      heightCm,
      measurements,
    })
    saveData(payload).catch(() => { /* тихая ошибка */ })
  }, 2000)
}

interface DataStore {
  data:         AppData
  currentYear:  number
  currentMonth: number
  heightCm:     number
  measurements: Record<string, { waist: number; hip: number }>
  allMonths:    Record<string, MonthData>
  syncing:      boolean

  setMonth:        (year: number, month: number) => void
  ensureMonth:     (ym: string) => void
  saveData:        () => void
  getCurrentMonth: (ym: string) => MonthData
  setHeight:       (cm: number) => void
  setMeasurement:  (weekKey: string, waist: number, hip: number) => void
  loadFromServer:  () => Promise<void>

  addHabit:    (name: string, icon: string, category: string, goal: Goal) => void
  deleteHabit: (name: string, ym: string) => void
  toggleHabit: (habit: string, day: number, value: number, ym: string) => void
  setSleep:    (day: number, value: number, ym: string) => void
  setWeight:   (day: number, value: number, ym: string) => void
  setMood:     (day: number, score: number, note: string, ym: string) => void
}

const stored  = loadStorage()
const initData: AppData = { months: stored.months ?? {}, schema_version: SCHEMA_VERSION }
const initNow = new Date()

export const useDataStore = create<DataStore>((set, get) => ({
  data:         initData,
  currentYear:  initNow.getFullYear(),
  currentMonth: initNow.getMonth() + 1,
  heightCm:     stored.heightCm ?? 0,
  measurements: stored.measurements ?? {},
  allMonths:    initData.months,
  syncing:      false,

  loadFromServer: async () => {
    if (!isLoggedIn()) return
    set({ syncing: true })
    try {
      const payload = await loadData()
      if (!payload) return

      let remote: StorageRoot
      try { remote = JSON.parse(payload) as StorageRoot }
      catch { return }

      // Если сервер пустой — отправляем туда локальные данные
      const hasRemote = remote.months && Object.keys(remote.months).length > 0
      if (!hasRemote) {
        const s = get()
        saveData(JSON.stringify({
          schema_version: SCHEMA_VERSION,
          months: s.data.months,
          heightCm: s.heightCm,
          measurements: s.measurements,
        })).catch(() => { /* тихая */ })
        return
      }

      // Сервер не пустой — мержим (серверные месяцы поверх локальных)
      remote = migrate(remote)
      const local = get()
      const mergedMonths = { ...local.data.months, ...remote.months }
      const newData: AppData = { months: mergedMonths, schema_version: SCHEMA_VERSION }
      const newHeight       = remote.heightCm      ?? local.heightCm
      const newMeasurements = remote.measurements  ?? local.measurements

      persist(newData, newHeight, newMeasurements)
      set({ data: newData, allMonths: newData.months, heightCm: newHeight, measurements: newMeasurements })
    } catch { /* тихая */ } finally {
      set({ syncing: false })
    }
  },

  setMonth: (year, month) => {
    set({ currentYear: year, currentMonth: month })
    get().ensureMonth(monthKey(year, month))
  },

  ensureMonth: (ym) => {
    if (get().data.months[ym]) return
    set(state => {
      const newData: AppData = {
        ...state.data,
        months: { ...state.data.months, [ym]: createEmptyMonth(ym) },
      }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  saveData: () => {
    const s = get()
    persist(s.data, s.heightCm, s.measurements)
    scheduleSync(s.data, s.heightCm, s.measurements)
  },

  getCurrentMonth: (ym) => {
    const md = get().data.months[ym]
    return md ? normalizeMonth(md, ym) : createEmptyMonth(ym)
  },

  setHeight: (cm) => {
    set(state => {
      persist(state.data, cm, state.measurements)
      scheduleSync(state.data, cm, state.measurements)
      return { heightCm: cm }
    })
  },

  setMeasurement: (weekKey, waist, hip) => {
    set(state => {
      const measurements = { ...state.measurements, [weekKey]: { waist, hip } }
      persist(state.data, state.heightCm, measurements)
      scheduleSync(state.data, state.heightCm, measurements)
      return { measurements }
    })
  },

  addHabit: (name, icon, category, goal) => {
    const { currentYear, currentMonth } = get()
    const ym = monthKey(currentYear, currentMonth)
    set(state => {
      const month = state.data.months[ym] ?? createEmptyMonth(ym)
      const d = daysInMonth(ym)
      const n = d >= 1 && d <= 31 ? d : 30
      const updated: MonthData = {
        ...month,
        habits:     [...month.habits, name],
        data:       { ...month.data,       [name]: Array(n).fill(0) as number[] },
        icons:      { ...month.icons,      [name]: icon },
        categories: { ...month.categories, [name]: category },
        goals:      { ...month.goals,      [name]: goal },
      }
      const newData: AppData = { ...state.data, months: { ...state.data.months, [ym]: updated } }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  deleteHabit: (name, ym) => {
    set(state => {
      const month = state.data.months[ym]
      if (!month) return state
      const updated: MonthData = {
        ...month,
        habits:     month.habits.filter(h => h !== name),
        data:       Object.fromEntries(Object.entries(month.data).filter(([k]) => k !== name)),
        icons:      Object.fromEntries(Object.entries(month.icons).filter(([k]) => k !== name)),
        categories: Object.fromEntries(Object.entries(month.categories).filter(([k]) => k !== name)),
        goals:      Object.fromEntries(Object.entries(month.goals).filter(([k]) => k !== name)),
      }
      const newData: AppData = { ...state.data, months: { ...state.data.months, [ym]: updated } }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  toggleHabit: (habit, day, value, ym) => {
    set(state => {
      const month = state.data.months[ym] ?? createEmptyMonth(ym)
      const vals = [...(month.data[habit] ?? [])]; vals[day] = value
      const newData: AppData = {
        ...state.data,
        months: { ...state.data.months, [ym]: { ...month, data: { ...month.data, [habit]: vals } } },
      }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  // ── Сон / Вес / Настроение — автоматически создают месяц ────────────────

  setSleep: (day, value, ym) => {
    set(state => {
      const month = state.data.months[ym] ?? createEmptyMonth(ym)  // <- ключевое исправление
      const sleep = [...month.sleep]
      sleep[day] = value
      const newData: AppData = {
        ...state.data,
        months: { ...state.data.months, [ym]: { ...month, sleep } },
      }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  setWeight: (day, value, ym) => {
    set(state => {
      const month = state.data.months[ym] ?? createEmptyMonth(ym)  // <- ключевое исправление
      const weight = [...month.weight]
      weight[day] = value
      const newData: AppData = {
        ...state.data,
        months: { ...state.data.months, [ym]: { ...month, weight } },
      }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },

  setMood: (day, score, note, ym) => {
    set(state => {
      const month = state.data.months[ym] ?? createEmptyMonth(ym)  // <- ключевое исправление
      const mood  = [...month.mood]; mood[day] = score
      const notes = { ...month.notes, [String(day)]: note }
      const newData: AppData = {
        ...state.data,
        months: { ...state.data.months, [ym]: { ...month, mood, notes } },
      }
      persist(newData, state.heightCm, state.measurements)
      scheduleSync(newData, state.heightCm, state.measurements)
      return { data: newData, allMonths: newData.months }
    })
  },
}))