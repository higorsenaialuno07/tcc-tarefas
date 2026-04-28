import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    // 1. Previne o comportamento padrão se for usado dentro de um <form>
    if (e) e.preventDefault();
    
    setErrorMsg('')

    if (!email || !password) {
      setErrorMsg('Preencha todos os campos')
      return
    }

    setLoading(true)

    // 2. Tenta fazer o login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (!error) {
      navigate('/dashboard')
    } else {
      // Tradução amigável de erros comuns do Supabase
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('Email ou senha incorretos.')
      } else {
        setErrorMsg(error.message)
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Bem-vindo de volta</h2>
        <p className="subtitle">Faça login para gerenciar suas tarefas</p>

        {/* 3. Envolvendo em um form para permitir o "Enter" no teclado */}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <p className="error-message">
              {errorMsg}
            </p>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="footer-text">
          Não tem conta? 
          <span 
            className="link-span"
            onClick={() => navigate('/register')}
          >
             Cadastre-se
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login