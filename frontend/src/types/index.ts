export type GoalType = 'boolean' | 'numeric'

export interface Goal {
  type: GoalType
  target?: number
  unit?: string
}

export interface MonthData {
  habits: string[]
  data: Record<string, number[]>
  sleep: number[]
  weight: number[]
  mood: number[]
  notes: Record<string, string>
  log: Record<string, string>
  icons: Record<string, string>
  categories: Record<string, string>
  goals: Record<string, Goal>
}

export interface CaloriePrefs {
  formula?: string
  age?: string
  sex?: string
  bodyfat?: string
  activity?: string
  goal?: string
}

export interface AppData {
  months: Record<string, MonthData>
  schema_version: number
  caloriePrefs?: CaloriePrefs
}

export type View = 'table' | 'graphs' | 'stats' | 'settings'