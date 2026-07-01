import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../styles/sales.css'

function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const { data: pData } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    const { data: cData } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    const { data: sData } = await supabase
      .from('sales')
      .select('*, clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setProducts(pData || [])
    setClients(cData || [])
    setSales(sData || [])
  }

  async function handleSale(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const product = products.find(p => p.id === selectedProductId)

      if (!product) throw new Error('Selecione um produto')
      if (!selectedClientId) throw new Error('Selecione um cliente')
      if (product.stock < quantity) throw new Error('Estoque insuficiente')

      const total = product.price * quantity

      const {
        data: { user }
      } = await supabase.auth.getUser()

      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: selectedProductId,
          client_id: selectedClientId,
          product_name: product.name,
          quantity,
          total_price: total,
          user_id: user.id
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

      fetchData()
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

      await supabase.from('sales').delete().eq('id', sale.id)

      if (product) {
        await supabase
          .from('products')
          .update({
            stock: product.stock + sale.quantity
          })
          .eq('id', sale.product_id)
      }

      fetchData()
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
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">
          <h2 className="page-title">💰 Registro de Vendas</h2>

          {/* CARDS */}
          <div className="cards">
            <div className="card">
              <span>Total Faturado</span>
              <h3>R$ {totalFaturado.toFixed(2)}</h3>
            </div>

            <div className="card">
              <span>Total de Vendas</span>
              <h3>{sales.length}</h3>
            </div>
          </div>

          {/* FORM */}
          <div className="card form-card">
            <h2>Registrar Venda</h2>

            <form className="form" onSubmit={handleSale}>
              <div className="field">
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

              <div className="field">
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
                      {p.name} ({p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="field field-button">
                <button className="btn-primary" disabled={loading}>
                  {loading ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </form>
          </div>

          {/* TABLE */}
          <div className="card table-card">
            <h2>Histórico de Vendas</h2>

            <table>
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
                    <td colSpan="6" className="empty">
                      Nenhuma venda cadastrada
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id}>
                      <td>
                        {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                      </td>

                      <td>{sale.clients?.name}</td>
                      <td>{sale.product_name}</td>
                      <td>{sale.quantity}</td>

                      <td className="price">
                        R$ {Number(sale.total_price).toFixed(2)}
                      </td>

                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteSale(sale)}
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
        </main>
      </div>
    </div>
  )
}

export default Sales