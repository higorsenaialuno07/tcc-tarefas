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
  const [editingClient, setEditingClient] = useState(null)

  // 🔄 Buscar clientes
  async function fetchClients() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    setClients(data || [])
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // ✏️ Iniciar edição
  function startEdit(client) {
    setEditingClient(client)
    setName(client.name)
    setEmail(client.email)
    setPhone(client.phone)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ❌ Cancelar edição
  function cancelEdit() {
    setEditingClient(null)
    setName('')
    setEmail('')
    setPhone('')
  }

  // ➕ / 💾 Adicionar ou editar
  async function handleAddClient(e) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const clientData = {
      name,
      email,
      phone,
      user_id: user.id
    }

    console.log("EDITANDO:", editingClient)
    console.log("DADOS:", clientData)

    let error

    if (editingClient) {
      const res = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.id)
        .eq('user_id', user.id)

      error = res.error
    } else {
      const res = await supabase
        .from('clients')
        .insert([clientData])

      error = res.error
    }

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Erro: " + error.message)
    } else {
      cancelEdit()
      fetchClients()
    }
  }


// 🗑️ Excluir
async function handleDeleteClient(id, clientName) {
  if (window.confirm(`Remover cliente ${clientName}?`)) {

    const { data: { user } } = await supabase.auth.getUser()

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      alert("Erro ao excluir")
      console.error(deleteError)
    } else {
      fetchClients()
    }
  }
}

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">
          <h2 className="page-title">👥 Gestão de Clientes</h2>

          {/* FORM */}
          <form className="client-form" onSubmit={handleAddClient}>
            <div className="form-grid">
              <input
                placeholder="Nome completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                placeholder="WhatsApp"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? 'Salvando...'
                  : editingClient
                    ? '💾 Salvar Alterações'
                    : '➕ Adicionar Cliente'}
              </button>

              {editingClient && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* TABELA */}
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {clients.length > 0 ? (
                  clients.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>

                      <td>
                        {c.phone || c.email || '---'}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="btn-edit"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClient(c.id, c.name)}
                            className="btn-delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty">
                      Nenhum cliente cadastrado.
                    </td>
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