import { useState } from 'react'
import { supabase } from '../services/supabase'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (!error) {
      alert('Conta criada!')
    } else {
      alert('Erro ao cadastrar')
    }
  }

  return (
    <div>
      <h2>Cadastro</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  )
}

export default Register