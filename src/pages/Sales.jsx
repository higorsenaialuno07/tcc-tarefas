import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    const { data: pData } = await supabase.from('products').select('*').order('name')
    const { data: cData } = await supabase.from('clients').select('*').order('name')
    const { data: sData } = await supabase
      .from('sales')
      .select('*, products(name), clients(name)')
      .order('created_at', { ascending: false })

    setProducts(pData || [])
    setClients(cData || [])
    setSales(sData || [])
  }

  useEffect(() => { fetchData() }, [])

  // 1. Registrar Venda
  async function handleSale(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const product = products.find(p => p.id === selectedProductId)
      
      if (!product) throw new Error("Selecione um produto")
      if (!selectedClientId) throw new Error("Selecione um cliente")
      if (product.stock < quantity) throw new Error("Estoque insuficiente!")

      const total = product.price * quantity 
      const { data: { user } } = await supabase.auth.getUser()

      const { error: saleError } = await supabase.from('sales').insert([{
        product_id: selectedProductId,
        client_id: selectedClientId,
        product_name: product.name,
        quantity: parseInt(quantity),
        total_price: total,
        user_id: user.id
      }])

      if (saleError) throw saleError

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', selectedProductId)

      if (stockError) throw stockError

      alert("✅ Venda realizada com sucesso!")
      setQuantity(1)
      setSelectedProductId('')
      setSelectedClientId('')
      fetchData()

    } catch (error) {
      alert("❌ " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. Excluir Venda e Estornar Estoque
  async function handleDeleteSale(sale) {
    if (!confirm("Deseja realmente excluir esta venda? O estoque será devolvido ao produto.")) return;

    setLoading(true);
    try {
      // A) Buscar o estoque atual do produto para somar o que foi vendido
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', sale.product_id)
        .single();

      // B) Deletar a venda
      const { error: deleteError } = await supabase.from('sales').delete().eq('id', sale.id);
      if (deleteError) throw deleteError;

      // C) Devolver a quantidade ao estoque (Estorno)
      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock + sale.quantity })
          .eq('id', sale.product_id);
      }

      alert("✅ Venda removida e estoque atualizado!");
      fetchData();
    } catch (error) {
      alert("❌ Erro ao excluir: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const totalFaturado = sales.reduce((acc, sale) => acc + (sale.total_price || 0), 0)

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />
        <main className="dashboard-content">
          <h2>💰 Registro de Vendas</h2>

          {/* Cards de Resumo */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ flex: 1, padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981' }}>
              <span style={{ color: '#065f46', fontWeight: 'bold' }}>Total Faturado</span>
              <h3 style={{ fontSize: '24px', margin: '10px 0' }}>R$ {totalFaturado.toFixed(2)}</h3>
            </div>
            <div className="stat-card" style={{ flex: 1, padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #3b82f6' }}>
              <span style={{ color: '#1e40af', fontWeight: 'bold' }}>Qtd. de Vendas</span>
              <h3 style={{ fontSize: '24px', margin: '10px 0' }}>{sales.length}</h3>
            </div>
          </div>

          {/* Formulário */}
          <form className="task-form" onSubmit={handleSale} style={{ 
            background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' 
          }}>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '15px', alignItems: 'flex-end' }}>
              <div style={{ flex: '2' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Cliente</label>
                <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Selecione o cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ flex: '2' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Produto</label>
                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} ({p.stock} un)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: '70px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Qtd.</label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>

              <div style={{ flex: '1' }}>
                <button type="submit" disabled={loading} style={{ 
                  width: '100%', padding: '11px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '42px'
                }}>
                  {loading ? '...' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
          </form>

          {/* Tabela de Histórico */}
          <div className="table-container" style={{ marginTop: '30px' }}>
            <h3>📜 Histórico de Transações</h3>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Qtd.</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Nenhuma venda registrada.</td></tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.created_at).toLocaleDateString('pt-BR')}</td>
                      <td><strong>{sale.clients?.name || 'Cliente'}</strong></td>
                      <td>{sale.product_name || sale.products?.name}</td>
                      <td>{sale.quantity} un</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>R$ {sale.total_price?.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteSale(sale)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ef4444' }}
                          title="Excluir Venda"
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