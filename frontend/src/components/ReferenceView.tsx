import { useState } from 'react'
import { C } from '../styles/theme'

// ── Данные (из reference.py) ──────────────────────────────────────────────────

const SECTIONS = [
  {
    icon: '⚡', color: '#0A84FF',
    title: 'BMR и TDEE — сколько калорий нужно телу',
    blocks: [
      {
        head: 'BMR — базальный обмен', type: 'text' as const,
        body: 'Количество калорий, которое тело сжигает просто чтобы существовать: дышать, качать кровь, поддерживать температуру. Даже лёжа целый день — BMR расходуется.',
      },
      {
        head: 'Формула Миффлина–Сан Жеора', type: 'code' as const,
        body: '♂  10 × вес + 6.25 × рост − 5 × возраст + 5\n♀  10 × вес + 6.25 × рост − 5 × возраст − 161\n\nПример: ♂ 80 кг, 180 см, 30 лет → BMR ≈ 1 880 ккал',
      },
      {
        head: 'TDEE — реальный суточный расход', type: 'text' as const,
        body: 'BMR умноженный на коэффициент активности. Это твоя настоящая норма.',
      },
      {
        head: 'Коэффициенты активности', type: 'table' as const,
        rows: [
          ['× 1.2',   'Сидячий', 'офис, почти без движения'],
          ['× 1.375', 'Лёгкая',  '1–3 тренировки в неделю'],
          ['× 1.55',  'Средняя', '3–5 тренировок'],
          ['× 1.725', 'Высокая', '6–7 тренировок'],
          ['× 1.9',   'Очень высокая', 'спорт + физ. работа'],
        ],
      },
      {
        head: 'Управление весом', type: 'table' as const,
        rows: [
          ['−500 ккал/день', '→ −0.5 кг в неделю', ''],
          ['−250 ккал/день', '→ мягкое похудение', ''],
          ['  0 ккал/день',  '→ поддержание веса', ''],
          ['+250 ккал/день', '→ медленный набор',  ''],
          ['+500 ккал/день', '→ активный набор',   ''],
        ],
      },
      {
        head: 'БЖУ от целевых калорий', type: 'chips' as const,
        chips: [
          { label: 'Белок', value: '30%  ÷  4 ккал/г', color: C.SUCCESS },
          { label: 'Жиры',  value: '30%  ÷  9 ккал/г', color: C.WARNING },
          { label: 'Углеводы', value: '40%  ÷  4 ккал/г', color: C.ACCENT },
        ],
        note: 'При тренировках: 1.6–2.2 г белка на кг веса.',
      },
      {
        head: '💧 Вода', type: 'text' as const,
        body: '35 мл × вес(кг) = базовая норма. +500 мл при высокой активности.\nПример: 75 кг → 2 625 мл/день',
      },
    ],
  },
  {
    icon: '📐', color: C.SUCCESS,
    title: 'ИМТ, WHtR и WHR — состав тела',
    blocks: [
      {
        head: 'ИМТ — индекс массы тела', type: 'text' as const,
        body: 'Формула: вес (кг) ÷ рост² (м). ⚠️ Не учитывает мышечную массу — у спортсменов ИМТ часто в зоне «избытка» при здоровом теле.',
      },
      {
        head: 'Таблица ИМТ', type: 'scale' as const,
        rows: [
          { range: '< 18.5',    label: 'Дефицит веса', color: C.ACCENT },
          { range: '18.5–24.9', label: 'Норма ✓',      color: C.SUCCESS },
          { range: '25.0–29.9', label: 'Избыток веса', color: C.WARNING },
          { range: '≥ 30.0',    label: 'Ожирение',     color: C.DANGER },
        ],
      },
      {
        head: 'WHtR — талия к росту', type: 'text' as const,
        body: 'Считается точнее ИМТ — учитывает висцеральный жир. Простое правило: держи талию меньше половины роста.',
      },
      {
        head: 'Шкала WHtR', type: 'scale' as const,
        rows: [
          { range: '< 0.46',    label: 'Возможный дефицит', color: C.ACCENT },
          { range: '0.46–0.53', label: 'Норма ✓',           color: C.SUCCESS },
          { range: '0.53–0.58', label: 'Повышенный риск',   color: C.WARNING },
          { range: '> 0.58',    label: 'Высокий риск',      color: C.DANGER },
        ],
      },
      {
        head: 'WHR — талия к бёдрам', type: 'text' as const,
        body: '«Яблоко» (жир на животе) → выше риск  ·  «Груша» (жир на бёдрах) → ниже риск',
      },
      {
        head: 'Норма WHR', type: 'table' as const,
        rows: [
          ['♂  Мужчины', '< 0.90', 'Норма ✓'],
          ['♀  Женщины', '< 0.85', 'Норма ✓'],
        ],
      },
    ],
  },
  {
    icon: '😴', color: '#BF5AF2',
    title: 'Сон — фундамент восстановления',
    blocks: [
      {
        head: 'Норма и фазы', type: 'text' as const,
        body: '7–9 часов для взрослых. Один цикл ≈ 90 минут, за ночь 4–6 циклов. N3 (глубокий сон) — восстановление тела. REM — память и эмоции.',
      },
      {
        head: 'Нормы по возрасту', type: 'scale' as const,
        rows: [
          { range: '14–17 лет', label: '8–10 часов', color: '#BF5AF2' },
          { range: '18–64 года', label: '7–9 часов', color: C.SUCCESS },
          { range: '65+ лет',    label: '7–8 часов', color: C.ACCENT },
        ],
      },
      {
        head: 'Что убивает качество сна', type: 'list' as const,
        items: [
          { icon: '📱', text: 'Экраны за 1–2 ч до сна → мелатонин −50%' },
          { icon: '☕', text: 'Кофеин живёт 6–8 ч → последний до 15:00' },
          { icon: '🍷', text: 'Алкоголь разрушает глубокий сон (N3)' },
          { icon: '🌡️', text: 'Оптимальная температура спальни: 16–19°C' },
        ],
      },
      {
        head: 'Лайфхаки', type: 'list' as const,
        items: [
          { icon: '⏰', text: 'Вставай в одно время даже в выходные — якорит циркадный ритм' },
          { icon: '💤', text: 'Дневной сон 10–20 мин восстанавливает лучше длинного (30+ мин)' },
        ],
      },
    ],
  },
  {
    icon: '🏃', color: C.WARNING,
    title: 'Физическая активность',
    blocks: [
      {
        head: 'Минимум по ВОЗ', type: 'chips' as const,
        chips: [
          { label: 'Умеренная', value: '150–300 мин/нед', color: C.ACCENT },
          { label: 'Интенсивная', value: '75–150 мин/нед', color: C.WARNING },
          { label: 'Силовые', value: '≥ 2 раза/нед', color: C.SUCCESS },
        ],
        note: '',
      },
      {
        head: 'Польза шагов', type: 'text' as const,
        body: '8 000–10 000 шагов в день снижают риск болезней сердца на 40%.\n10 мин прогулки после еды снижают сахар в крови.',
      },
      {
        head: '⚠️ Важно', type: 'alert' as const,
        body: 'Малоподвижность повышает смертность как курение. Даже если тренируешься, но 8 часов сидишь — риски сохраняются. Вставай каждые 45–60 минут.',
      },
    ],
  },
  {
    icon: '🥗', color: '#30D158',
    title: 'Питание',
    blocks: [
      {
        head: 'Ежедневные цели', type: 'list' as const,
        items: [
          { icon: '🥦', text: '5 порций (400+ г) овощей и фруктов в день' },
          { icon: '🌾', text: 'Клетчатка: минимум 25–30 г/день' },
          { icon: '🍬', text: 'Сахар (ВОЗ): не более 25 г/день ≈ 6 ч.л.' },
        ],
      },
      {
        head: 'Что добавить', type: 'list' as const,
        items: [
          { icon: '🐟', text: 'Омега-3 (жирная рыба 2× в нед.) снижает воспаление' },
          { icon: '🥛', text: 'Ферментированные продукты (кефир, квашеная капуста) улучшают микробиом' },
        ],
      },
      {
        head: '⚠️ Чего избегать', type: 'alert' as const,
        body: 'Ультрапереработанная еда (чипсы, колбаса, фастфуд) связана с депрессией и хроническим воспалением — даже при нормальном ИМТ.',
      },
    ],
  },
  {
    icon: '📊', color: C.DANGER,
    title: 'Привычки и психология',
    blocks: [
      {
        head: 'Как работает мозг', type: 'text' as const,
        body: 'Петля: Триггер → Рутина → Награда. Мозг автоматизирует повторяющиеся действия. Среднее время формирования привычки — 66 дней (не 21!).',
      },
      {
        head: 'Habit Stacking', type: 'text' as const,
        body: 'Привязывай новую привычку к существующей:\n«После утреннего кофе → 5 мин чтения»\n«После чистки зубов → 10 отжиманий»',
      },
      {
        head: 'Правило 2 минут', type: 'text' as const,
        body: 'Любое действие до 2 минут — делай сразу. Новую привычку начинай с версии на 2 минуты: не «тренировка», а «надень кроссовки».',
      },
      {
        head: 'Главное правило', type: 'alert' as const,
        body: 'Не пропускай дважды подряд — это важнее идеального стрика. Один пропуск — случайность. Два подряд — начало новой плохой привычки.',
      },
      {
        head: '✅ Трекинг работает', type: 'text' as const,
        body: 'Само по себе отслеживание повышает выполнение привычек на 20%. Ты уже делаешь правильную вещь!',
      },
    ],
  },
]

// ── Компоненты блоков ─────────────────────────────────────────────────────────

function TextBlock({ body }: { body: string }) {
  return (
    <p style={{ margin: '6px 0 10px', color: C.SECONDARY, fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
      {body}
    </p>
  )
}

function CodeBlock({ body }: { body: string }) {
  return (
    <pre style={{
      margin: '6px 0 10px', padding: '10px 14px',
      background: C.BG, borderRadius: 8,
      color: C.SECONDARY, fontSize: 12, fontFamily: 'monospace',
      lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap',
      border: `1px solid ${C.BORDER}`,
    }}>{body}</pre>
  )
}

function TableBlock({ rows }: { rows: string[][] }) {
  return (
    <div style={{ margin: '6px 0 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', gap: 12, padding: '5px 10px',
          background: i % 2 === 0 ? C.BG : 'transparent',
          borderRadius: 6, alignItems: 'center',
        }}>
          {row.map((cell, j) => (
            <span key={j} style={{
              color: j === 0 ? C.TEXT : C.SECONDARY,
              fontSize: 12, fontFamily: j === 0 ? 'monospace' : 'inherit',
              fontWeight: j === 0 ? 600 : 400,
              minWidth: j === 0 ? 110 : j === 1 ? 130 : undefined,
            }}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function ScaleBlock({ rows }: { rows: { range: string; label: string; color: string }[] }) {
  return (
    <div style={{ margin: '6px 0 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px', borderRadius: 8,
          background: row.color + '18',
          border: `1px solid ${row.color}44`,
        }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: row.color, flexShrink: 0 }} />
          <span style={{ color: C.TEXT, fontFamily: 'monospace', fontSize: 12, fontWeight: 600, minWidth: 90 }}>
            {row.range}
          </span>
          <span style={{ color: row.color, fontSize: 13, fontWeight: 600 }}>{row.label}</span>
        </div>
      ))}
    </div>
  )
}

function ListBlock({ items }: { items: { icon: string; text: string }[] }) {
  return (
    <div style={{ margin: '6px 0 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
          <span style={{ color: C.SECONDARY, fontSize: 13, lineHeight: 1.55 }}>{item.text}</span>
        </div>
      ))}
    </div>
  )
}

function ChipsBlock({ chips, note }: { chips: { label: string; value: string; color: string }[]; note: string }) {
  return (
    <div style={{ margin: '6px 0 10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((c, i) => (
          <div key={i} style={{
            background: c.color + '1A', border: `1px solid ${c.color}55`,
            borderRadius: 10, padding: '8px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ color: C.SECONDARY, fontSize: 11 }}>{c.label}</span>
            <span style={{ color: c.color, fontWeight: 700, fontSize: 14 }}>{c.value}</span>
          </div>
        ))}
      </div>
      {note && <p style={{ margin: '8px 0 0', color: C.SECONDARY, fontSize: 12 }}>{note}</p>}
    </div>
  )
}

function AlertBlock({ body }: { body: string }) {
  return (
    <div style={{
      margin: '6px 0 10px', padding: '10px 14px',
      background: C.WARNING + '18', border: `1px solid ${C.WARNING}44`,
      borderRadius: 8, borderLeft: `3px solid ${C.WARNING}`,
    }}>
      <span style={{ color: C.SECONDARY, fontSize: 13, lineHeight: 1.65 }}>{body}</span>
    </div>
  )
}

function SubHead({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: C.TEXT, fontSize: 13, fontWeight: 600 }}>{text}</span>
    </div>
  )
}

// ── Секция ────────────────────────────────────────────────────────────────────

function Section({ sec }: { sec: typeof SECTIONS[0] }) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      background: C.BG2, borderRadius: 14,
      border: `1px solid ${C.BORDER}`,
      overflow: 'hidden',
    }}>
      {/* Заголовок секции — кликабельный */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', cursor: 'pointer',
          borderBottom: open ? `1px solid ${C.BORDER}` : 'none',
          background: sec.color + '0E',
        }}
      >
        <div style={{ width: 4, height: 22, borderRadius: 2, background: sec.color, flexShrink: 0 }} />
        <span style={{ fontSize: 20, flexShrink: 0 }}>{sec.icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: sec.color, flex: 1 }}>{sec.title}</span>
        <span style={{ color: C.SECONDARY, fontSize: 14, transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▶</span>
      </div>

      {/* Контент */}
      {open && (
        <div style={{ padding: '14px 20px 16px' }}>
          {sec.blocks.map((block: any, i: number) => (
            <div key={i}>
              <SubHead text={block.head} />
              {block.type === 'text'  && <TextBlock  body={block.body} />}
              {block.type === 'code'  && <CodeBlock  body={block.body} />}
              {block.type === 'table' && <TableBlock rows={block.rows} />}
              {block.type === 'scale' && <ScaleBlock rows={block.rows} />}
              {block.type === 'list'  && <ListBlock  items={block.items} />}
              {block.type === 'chips' && <ChipsBlock chips={block.chips} note={block.note} />}
              {block.type === 'alert' && <AlertBlock body={block.body} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function ReferenceView() {
  return (
    <div style={{ padding: '0 36px 36px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SECTIONS.map((sec, i) => <Section key={i} sec={sec} />)}
      </div>
    </div>
  )
}