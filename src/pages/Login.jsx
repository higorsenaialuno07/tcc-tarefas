import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    setErrorMsg('')

    if (!email || !password) {
      setErrorMsg('Preencha todos os campos')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (!error) {
      navigate('/dashboard')
    } else {
      setErrorMsg(error.message)
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Digite sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {errorMsg && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          {errorMsg}
        </p>
      )}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Não tem conta? <span 
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => navigate('/register')}
        >
          Cadastre-se
        </span>
      </p>
    </div>
  )
}

export default Login