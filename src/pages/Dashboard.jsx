import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
// Se o seu componente Chart original for baseado em tarefas, 
// você precisará adaptá-lo para receber os novos dados de vendas.

function Dashboard() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [clientsCount, setClientsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 1. Verifica autenticação
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) navigate('/')
    }
    getUser()
  }, [navigate])

  // 2. Carrega dados reais do sistema comercial
  async function fetchDashboardData() {
    setLoading(true)
    try {
      // Busca todas as vendas para calcular faturamento
      const { data: sData } = await supabase.from('sales').select('*')
      // Busca produtos para verificar estoque crítico
      const { data: pData } = await supabase.from('products').select('*')
      // Busca contagem de clientes
      const { count: cCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })

      setSales(sData || [])
      setProducts(pData || [])
      setClientsCount(cCount || 0)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  // 3. Cálculos de Negócio
  const totalFaturado = sales.reduce((acc, sale) => acc + sale.total_price, 0)
  const estoqueCritico = products.filter(p => p.stock <= 3) // Alerta para menos de 3 itens

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />

        <main className="dashboard-content">
          <h2 style={{ marginBottom: '20px' }}>📊 Visão Geral do Negócio</h2>

          {/* NOVOS CARDS DE RESUMO COMERCIAL */}
          <div className="summary-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="summary-card" style={{ borderLeft: '5px solid #10b981' }}>
              <small>Faturamento Total</small>
              <h3>R$ {totalFaturado.toFixed(2)}</h3>
            </div>
            <div className="summary-card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <small>Total de Vendas</small>
              <h3>{sales.length} transações</h3>
            </div>
            <div className="summary-card" style={{ borderLeft: '5px solid #8b5cf6' }}>
              <small>Base de Clientes</small>
              <h3>{clientsCount} cadastrados</h3>
            </div>
          </div>

          {/* ALERTAS DE ESTOQUE CRÍTICO */}
          <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚠️ Alerta de Estoque Baixo
            </h3>
            {estoqueCritico.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {estoqueCritico.map(prod => (
                  <div key={prod.id} style={{ padding: '10px 15px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#991b1b' }}>
                    <strong>{prod.name}</strong>: apenas {prod.stock} un.
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>Todos os produtos estão com estoque em dia.</p>
            )}
          </div>

          {/* ÁREA DO GRÁFICO (Pode ser adaptada para Vendas por Dia) */}
          <div className="chart-box" style={{ marginTop: '30px' }}>
            <h3>📈 Volume de Vendas</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>O gráfico abaixo reflete o histórico de transações registradas.</p>
            {/* Aqui você mantém o componente <Chart /> mas passa 'sales' em vez de 'tasks' */}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard