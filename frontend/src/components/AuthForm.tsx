import { useState } from 'react'
import { C } from '../styles/theme'
import { register, login } from '../api'

interface Props {
  onSuccess: () => void
}

export default function AuthForm({ onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, username, password)
      } else {
        await login(email, password)
      }
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: C.BG,
    border: `1.5px solid ${C.BORDER}`,
    borderRadius: 10,
    color: C.TEXT,
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    fontFamily: C.FONT,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: C.BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: C.FONT,
    }}>
      <div style={{
        background: C.BG2,
        borderRadius: 20,
        padding: 40,
        width: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Логотип */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌨️</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.TEXT }}>Winter Arc</div>
          <div style={{ fontSize: 13, color: C.SECONDARY, marginTop: 4 }}>
            {mode === 'login' ? 'Войди в свой аккаунт' : 'Создай аккаунт'}
          </div>
        </div>

        {/* Переключатель */}
        <div style={{ display: 'flex', background: C.CARD, borderRadius: 10, padding: 4 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1,
              background: mode === m ? C.ACCENT : 'transparent',
              border: 'none',
              borderRadius: 8,
              color: mode === m ? '#fff' : C.SECONDARY,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              cursor: 'pointer',
              fontFamily: C.FONT,
              transition: 'all 0.15s',
            }}>
              {m === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        {/* Поля */}
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          type="email"
        />

        {mode === 'register' && (
          <input
            placeholder="Имя пользователя"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          type="password"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <div style={{ color: C.DANGER, fontSize: 13, textAlign: 'center' }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          background: C.ACCENT,
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          padding: '12px 0',
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: C.FONT,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </div>
    </div>
  )
}