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

export interface AppData {
  months: Record<string, MonthData>
  schema_version: number
}

export type View = 'table' | 'graphs' | 'stats' | 'settings'