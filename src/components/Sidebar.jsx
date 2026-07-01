import { Link, useLocation, useNavigate } from "react-router-dom"
import { supabase } from '../services/supabase'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert("Erro ao sair: " + error.message)
    } else {
      navigate('/')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
  <div>
    <div className="logo-area">
      <h1 className="logo">SGE</h1>

      <p className="logo-subtitle">
        Sistema de Gestão Empresarial
      </p>
    </div>

        <nav className="sidebar-nav">

          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            <span>🏠</span>
            Dashboard
          </Link>

          <Link to="/products" className={isActive('/products') ? 'active' : ''}>
            <span>📦</span>
            Produtos
          </Link>

          <Link to="/clients" className={isActive('/clients') ? 'active' : ''}>
            <span>👥</span>
            Clientes
          </Link>

          <Link to="/sales" className={isActive('/sales') ? 'active' : ''}>
            <span>💰</span>
            Vendas
          </Link>

          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            <span>👤</span>
            Perfil
          </Link>

        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        🚪 Sair
      </button>
    </aside>
  )
}

export default Sidebar