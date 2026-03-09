export const C = {
  // Фоны
  BG:      '#1C1C1E',
  BG2:     '#2C2C2E',
  CARD:    '#3A3A3C',
  BORDER:  '#48484A',

  // Текст
  TEXT:      '#F2F2F7',
  SECONDARY: '#AEAEB2',

  // Акценты
  ACCENT:  '#0A84FF',
  SUCCESS: '#30D158',
  WARNING: '#FF9F0A',
  DANGER:  '#FF453A',

  // Категории
  CATEGORIES: {
    'Здоровье':    '#30D158',
    'Спорт':       '#FF9F0A',
    'Саморазвитие':'#BF5AF2',
    'Питание':     '#FF453A',
    'Сон':         '#0A84FF',
    'Другое':      '#636366',
  } as Record<string, string>,

  FONT: 'Inter, system-ui, sans-serif',
} as const