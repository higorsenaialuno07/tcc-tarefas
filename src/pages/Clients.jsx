import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Clients() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Carregar lista de clientes
  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data || [])
  }

  useEffect(() => { fetchClients() }, [])

  // 2. Adicionar novo cliente
  async function handleAddClient(e) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('clients').insert([{
      name, email, phone, user_id: user.id
    }])

    setLoading(false)
    if (error) {
      alert("Erro ao cadastrar: " + error.message)
    } else {
      alert("Cliente cadastrado com sucesso!")
      setName(''); setEmail(''); setPhone('');
      fetchClients()
    }
  }

  // 3. Função para Excluir Cliente (Ação do botão 🗑️)
  async function handleDeleteClient(id, clientName) {
    if (window.confirm(`Tem certeza que deseja remover o cliente ${clientName}?`)) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      
      if (error) alert("Erro ao excluir!")
      else fetchClients()
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />
        <main className="dashboard-content">
          <h2>👥 Gestão de Clientes</h2>
          
          {/* Formulário de Cadastro com visual limpo */}
          <form className="task-form" onSubmit={handleAddClient} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                placeholder="Nome Completo" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input 
                placeholder="E-mail" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input 
                placeholder="WhatsApp" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {loading ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </form>

          {/* Tabela de Clientes Organizada */}
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome</th>
                  <th style={{ textAlign: 'left' }}>Contato</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 ? (
                  clients.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone || c.email || '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteClient(c.id, c.name)}
                          style={{ background: '#ff4d4d', border: 'none', padding: '6px 10px', borderRadius: '6px', color: 'white', cursor: 'pointer', transition: '0.2s' }}
                          onMouseOver={(e) => e.target.style.opacity = '0.8'}
                          onMouseOut={(e) => e.target.style.opacity = '1'}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Nenhum cliente cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Clients