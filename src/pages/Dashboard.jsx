import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

function Dashboard() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // 🔐 Auth
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) navigate('/')
    }
    getUser()
  }, [navigate])

  // 🚀 Fetch otimizado
  async function fetchData() {
    setLoading(true)
    setError(null)

    try {
      const [salesRes, productsRes, clientsRes] = await Promise.all([
        supabase.from('sales').select('*'),
        supabase.from('products').select('*'),
        supabase.from('clients').select('*')
      ])

      if (salesRes.error || productsRes.error || clientsRes.error) {
        throw new Error('Erro ao buscar dados')
      }

      setSales(salesRes.data || [])
      setProducts(productsRes.data || [])
      setClients(clientsRes.data || [])

    } catch (err) {
      setError('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 📅 FILTRO DE PERÍODO
  const filteredSales = useMemo(() => {
    const now = new Date()
    let days = 7

    if (period === '1d') days = 1
    if (period === '30d') days = 30

    const limitDate = new Date()
    limitDate.setDate(now.getDate() - days)

    return sales.filter(s => new Date(s.created_at) >= limitDate)
  }, [sales, period])

  // 💰 FORMAT
  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  // 📊 MÉTRICAS
  const total = filteredSales.reduce((acc, s) => acc + s.total_price, 0)
  const totalAll = sales.reduce((acc, s) => acc + s.total_price, 0)

  const ticket = filteredSales.length ? total / filteredSales.length : 0

  // 📈 Crescimento simples
  const previousTotal = totalAll - total
  const growth = previousTotal > 0
    ? ((total - previousTotal) / previousTotal) * 100
    : 0

  // 📦 Top produtos
  const topProducts = useMemo(() => {
    const map = {}

    sales.forEach(s => {
      if (!s.product_name) return
      map[s.product_name] = (map[s.product_name] || 0) + 1
    })

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [sales])

  // 👥 Clientes recentes
  const recentClients = clients.slice(-5).reverse()

  // 📉 Estoque crítico
  const lowStock = products.filter(p => p.stock <= 3)

  // 📈 Gráfico
  const chartData = filteredSales.map(s => ({
    date: s.created_at.split('T')[0],
    total: s.total_price
  }))

  if (loading) return <p>Carregando...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />
<main className="dashboard-content">
  <h2 className="page-title">📊 Dashboard Profissional</h2>

  {/* FILTRO */}
  <div className="filters">
    <button onClick={() => setPeriod('1d')}>Hoje</button>
    <button onClick={() => setPeriod('7d')}>7 dias</button>
    <button onClick={() => setPeriod('30d')}>30 dias</button>
  </div>

  {/* CARDS */}
  <div className="grid">
    <div className="card">
      <p>Faturamento</p>
      <h3>{formatCurrency(total)}</h3>
    </div>

    <div className="card">
      <p>Ticket Médio</p>
      <h3>{formatCurrency(ticket)}</h3>
    </div>

    <div className="card">
      <p>Crescimento</p>
      <h3>{growth.toFixed(1)}%</h3>
    </div>

    <div className="card">
      <p>Vendas</p>
      <h3>{filteredSales.length}</h3>
    </div>
  </div>

  {/* GRID PRINCIPAL */}
  <div className="dashboard-grid">

    {/* ESQUERDA */}
    <div className="left">
      <div className="chart-container">
        <h3>📈 Vendas</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* DIREITA */}
    <div className="right">

      <div className="card">
        <h3>🏆 Top Produtos</h3>
        {topProducts.map(([name, count]) => (
          <p className="list-item" key={name}>
            {name} - {count} vendas
          </p>
        ))}
      </div>

      <div className="card">
        <h3>👥 Clientes Recentes</h3>
        {recentClients.map(c => (
          <p className="list-item" key={c.id}>
            {c.name}
          </p>
        ))}
      </div>

      <div className="card">
        <h3>⚠️ Estoque Baixo</h3>
        {lowStock.map(p => (
          <p className="list-item" key={p.id}>
            {p.name} ({p.stock})
          </p>
        ))}
      </div>

    </div>
  </div>
</main>
      </div>
    </div>
  )
}

export default Dashboard