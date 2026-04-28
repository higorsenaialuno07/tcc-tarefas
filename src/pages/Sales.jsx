import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Resumo financeiro
  const [totalSalesValue, setTotalSalesValue] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: p } = await supabase.from('products').select('*').order('name')
    const { data: s } = await supabase.from('sales').select('*').order('created_at', { ascending: false })
    
    setProducts(p || [])
    setSales(s || [])
    
    // Calcula o total vendido
    if (s) {
      const total = s.reduce((acc, sale) => acc + Number(sale.total_price), 0)
      setTotalSalesValue(total)
    }
  }

  async function handleSale(e) {
    e.preventDefault()
    setLoading(true)

    const product = products.find(p => p.id === selectedProduct)
    
    if (!product) {
      alert("Selecione um produto!")
      setLoading(false)
      return
    }

    if (product.stock < qty) {
      alert("Estoque insuficiente!")
      setLoading(false)
      return
    }

    const totalPrice = product.price * qty
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Registrar a Venda
    const { error: saleError } = await supabase.from('sales').insert([
      { 
        product_name: product.name, 
        quantity: qty, 
        total_price: totalPrice, 
        user_id: user.id 
      }
    ])

    if (!saleError) {
      // 2. Baixar o estoque no banco
      const novoEstoque = product.stock - qty
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: novoEstoque })
        .eq('id', product.id)

      if (!updateError) {
        alert("Venda realizada com sucesso!")
        setSelectedProduct('')
        setQty(1)
        fetchData()
      }
    } else {
      alert("Erro ao processar venda.")
    }
    setLoading(false)
  }

  // FUNÇÃO EXTRA: Cancelar Venda (Devolve ao estoque)
  async function cancelSale(sale) {
    if (window.confirm(`Deseja cancelar a venda de ${sale.product_name}? O estoque será devolvido.`)) {
      // 1. Tenta achar o produto original para devolver o estoque
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('name', sale.product_name)
        .single()

      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock + sale.quantity })
          .eq('id', product.id)
      }

      // 2. Deleta o registro da venda
      await supabase.from('sales').delete().eq('id', sale.id)
      fetchData()
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />
        <main className="dashboard-content">
          
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total em Vendas</span>
              <h2 className="price-text" style={{ color: '#10b981' }}>
                R$ {totalSalesValue.toFixed(2)}
              </h2>
            </div>
            <div className="stat-card">
              <span>Nº de Transações</span>
              <h2>{sales.length}</h2>
            </div>
          </div>

          <div className="product-section">
            <h3>🛒 Nova Venda</h3>
            <form className="task-form" onSubmit={handleSale}>
              <select 
                className="profile-input" 
                value={selectedProduct} 
                onChange={e => setSelectedProduct(e.target.value)} 
                required
              >
                <option value="">Selecione o produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} (R$ {p.price.toFixed(2)}) - Estoque: {p.stock}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label>Qtd:</label>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={e => setQty(parseInt(e.target.value))} 
                  min="1" 
                  style={{ width: '80px' }}
                  required 
                />
              </div>

              <button type="submit" className="btn-save" disabled={loading || !selectedProduct}>
                {loading ? 'Processando...' : 'Finalizar Venda'}
              </button>
            </form>
          </div>

          <div className="table-container">
            <h3>Histórico de Movimentações</h3>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>Nenhuma venda registrada.</td></tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.created_at).toLocaleString('pt-BR')}</td>
                      <td><strong>{sale.product_name}</strong></td>
                      <td>{sale.quantity} un</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>
                        R$ {Number(sale.total_price).toFixed(2)}
                      </td>
                      <td>
                        <button 
                          className="btn-delete" 
                          onClick={() => cancelSale(sale)}
                          title="Estornar Venda"
                        >
                          🔄
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