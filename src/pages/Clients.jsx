/* eslint-disable no-undef */
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../styles/clients.css'
// eslint-disable-next-line no-unused-vars
import { useTheme } from '../context/ThemeContext'

function Clients() {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingClient, setEditingClient] = useState(null)

  // 📊 Estatísticas
  const totalClients = clients.length

  const clientsWithPhone = useMemo(() => {
    return clients.filter(c => c.phone).length
  }, [clients])

  const clientsWithEmail = useMemo(() => {
    return clients.filter(c => c.email).length
  }, [clients])

  const completeClients = useMemo(() => {
  return clients.filter(
    c => c.email && c.phone
  ).length
}, [clients])

  // 🔄 Buscar clientes
  async function fetchClients() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (!error) {
      setClients(data || [])
      setFilteredClients(data || [])
    }
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchClients()
}, [])

  // 🔎 Pesquisa
  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.includes(search)
    )

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredClients(filtered)
  }, [search, clients])

  // ✏️ Iniciar edição
  function startEdit(client) {
    setEditingClient(client)

    setName(client.name)
    setEmail(client.email)
    setPhone(client.phone)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // ❌ Cancelar edição
  function cancelEdit() {
    setEditingClient(null)

    setName('')
    setEmail('')
    setPhone('')
  }

  // 💾 Salvar cliente
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
      alert(error.message)
      console.error(error)

    } else {
      cancelEdit()
      fetchClients()
    }
  }

  // 🗑️ Excluir
  async function handleDeleteClient(id, clientName) {
    const confirmDelete = window.confirm(
      `Deseja remover ${clientName}?`
    )

    if (!confirmDelete) return

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      alert('Erro ao excluir cliente')
      console.error(error)

    } else {
      fetchClients()
    }
  }

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                👥 Gestão de Clientes
              </h1>

              <p className="page-subtitle">
  Cadastro, consulta e gerenciamento de clientes
</p>
            </div>
          </div>

          {/* STATS */}
   {/* STATS */}
<div className="stats-grid">

  <div className="stat-card">
    <span>Total de Clientes</span>
    <h2>{totalClients}</h2>
  </div>

  <div className="stat-card">
    <span>Com WhatsApp</span>
    <h2>{clientsWithPhone}</h2>
  </div>

  <div className="stat-card">
    <span>Com E-mail</span>
    <h2>{clientsWithEmail}</h2>
  </div>

    <div className="stat-card">
  <span>Cadastro Completo</span>
  <h2>{completeClients}</h2>
</div>

</div>

          {/* FORM */}
          <div className="form-container">

            <div className="section-title">
              {editingClient
                ? '✏️ Editando Cliente'
                : '➕ Novo Cliente'}
            </div>

            <form
              className="client-form"
              onSubmit={handleAddClient}
            >

              <div className="form-grid">

                <input
                  type="text"
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
                  type="text"
                  placeholder="WhatsApp"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />

              </div>

              <div className="form-actions">

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading
                    ? 'Salvando...'
                    : editingClient
                      ? '💾 Salvar'
                      : '➕ Adicionar'}
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
          </div>

          {/* PESQUISA */}
          <div className="search-container">

            <input
              type="text"
              placeholder="🔎 Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />

          </div>

          {/* TABELA */}
          <div className="table-container">

            <table className="product-table">

              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>E-mail</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <tr key={client.id}>

                      <td>
                        <div className="client-name">
                          <div className="avatar">
  {client.name?.charAt(0).toUpperCase()}
</div>
                          <strong>{client.name}</strong>
                        </div>
                      </td>

                      <td>
                        {client.email || '---'}
                      </td>

                      <td>
                        {client.phone || '---'}
                      </td>

                      <td>

                        <div className="actions">

                          <button
                            className="btn-edit"
                            onClick={() => startEdit(client)}
                          >
                            ✏️
                          </button>

                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDeleteClient(
                                client.id,
                                client.name
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))

                ) : (
                  <tr>
                    <td colSpan="4" className="empty">
                      Nenhum cliente encontrado.
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