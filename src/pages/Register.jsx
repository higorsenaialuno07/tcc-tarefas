import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  async function handleRegister(e) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email || !password || !name) {
      setErrorMsg('Preencha todos os campos')
      return
    }

    setLoading(true)

    // O signUp cria o usuário e já salva o nome no metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name }
      }
    })

    setLoading(false)

    if (!error) {
      setSuccessMsg('Cadastro realizado! Redirecionando...')
      // Pequeno delay para o usuário ler a mensagem de sucesso
      setTimeout(() => navigate('/dashboard'), 2000)
    } else {
      setErrorMsg(error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Criar Conta</h2>
        <p className="subtitle">Comece a organizar suas tarefas hoje</p>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nome Completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && <p className="error-message">{errorMsg}</p>}
          {successMsg && <p style={{ color: '#10b981', marginBottom: '10px' }}>{successMsg}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="footer-text">
          Já tem uma conta? 
          <span className="link-span" onClick={() => navigate('/')}>
             Fazer Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register