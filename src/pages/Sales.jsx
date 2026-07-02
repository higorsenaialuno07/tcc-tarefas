import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import '../styles/sales.css'

function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])
  const [userId, setUserId] = useState(null)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(false)
  
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Mapeamento dinâmico de variáveis que força os elementos a obedecerem ao tema atual
  const themeVariables = {
    '--sales-bg': isDark ? '#0f172a' : '#f1f5f9',
    '--sales-surface': isDark ? '#1e293b' : '#ffffff',
    '--sales-surface-2': isDark ? '#0f172a' : '#f8fafc',
    '--sales-border': isDark ? '#334155' : '#e2e8f0',
    '--sales-text': isDark ? '#f8fafc' : '#0f172a',
    '--sales-text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--sales-shadow': isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchData(user.id)
      }
    }
    initialize()
  }, [])

  async function fetchData(currentUserId = userId) {
    if (!currentUserId) return

    const [productsRes, clientsRes, salesRes] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', currentUserId).order('name'),
      supabase.from('clients').select('*').eq('user_id', currentUserId).order('name'),
      supabase.from('sales').select('*, clients(name)').eq('user_id', currentUserId).order('created_at', { ascending: false })
    ])

    setProducts(productsRes.data || [])
    setClients(clientsRes.data || [])
    setSales(salesRes.data || [])
  }

  async function handleSale(e) {
    e.preventDefault()
    if (quantity < 1) return alert('A quantidade mínima é 1')
    setLoading(true) // CORRIGIDO: Modificado de loading(true) para setLoading(true)

    try {
      const product = products.find(p => p.id === selectedProductId)

      if (!product) throw new Error('Selecione um produto')
      if (!selectedClientId) throw new Error('Selecione um cliente')
      if (product.stock < quantity) throw new Error('Estoque insuficiente')

      const total = product.price * quantity

      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: selectedProductId,
          client_id: selectedClientId,
          product_name: product.name,
          quantity,
          total_price: total,
          user_id: userId
        }
      ])

      if (saleError) throw saleError

      await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', selectedProductId)

      setSelectedProductId('')
      setSelectedClientId('')
      setQuantity(1)

      await fetchData()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSale(sale) {
    if (!window.confirm('Deseja excluir esta venda?')) return

    try {
      setLoading(true)

      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', sale.product_id)
        .single()

      const { error: deleteError } = await supabase.from('sales').delete().eq('id', sale.id)
      if (deleteError) throw deleteError

      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock + sale.quantity })
          .eq('id', sale.product_id)
      }

      await fetchData()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalFaturado = sales.reduce(
    (acc, sale) => acc + Number(sale.total_price || 0),
    0
  )

  return (
    <div 
      className={`sales-app-container ${theme === 'dark' ? 'dark-mode-active' : ''}`} 
      data-theme={theme}
      style={themeVariables}
    >
      <Sidebar />

      <div className="sales-main-layout">
        <Header />

        <main className="sales-dashboard-content">
          <h2 className="sales-page-title">💰 Registro de Vendas</h2>

          {/* CARDS SUPERIORES */}
          <div className="sales-cards-grid">
            <div className="sales-custom-card sales-revenue-card">
              <span className="sales-card-span">Total Faturado</span>
              <h3 className="sales-card-h3">R$ {totalFaturado.toFixed(2)}</h3>
            </div>

            <div className="sales-custom-card sales-count-card">
              <span className="sales-card-span">Total de Vendas</span>
              <h3 className="sales-card-h3">{sales.length}</h3>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="sales-custom-card sales-form-card">
            <h2 className="sales-card-h2">Registrar Venda</h2>

            <form className="sales-form-element" onSubmit={handleSale}>
              <div className="sales-form-field">
                <label>Cliente</label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sales-form-field">
                <label>Produto</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {products.map(p => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.stock <= 0}
                    >
                      {p.name} ({p.stock} em estoque)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sales-form-field">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              <div className="sales-form-field">
                <button className="sales-btn-primary" disabled={loading}>
                  {loading ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </form>
          </div>

          {/* TABELA DE HISTÓRICO */}
          <div className="sales-custom-card sales-table-card">
            <h2 className="sales-card-h2">Histórico de Vendas</h2>

            <div className="sales-table-responsive">
              <table className="sales-data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="sales-empty-row">
                        Nenhuma venda cadastrada
                      </td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id}>
                        <td>
                          {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>{sale.clients?.name || 'Cliente Removido'}</td>
                        <td>{sale.product_name}</td>
                        <td>{sale.quantity}</td>
                        <td className="sales-price-highlight">
                          R$ {Number(sale.total_price).toFixed(2)}
                        </td>
                        <td>
                          <button
                            className="sales-btn-delete"
                            onClick={() => handleDeleteSale(sale)}
                            title="Excluir Venda"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Sales