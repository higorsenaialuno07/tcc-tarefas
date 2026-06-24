import { Link, useLocation } from "react-router-dom";
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

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

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <h1 className="logo">SGE</h1>

          <p className="logo-subtitle">
            Sistema de Gestão
            <br />
            Empresarial
          </p>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            <span>🏠</span>
            Dashboard
          </Link>

          <Link
            to="/products"
            className={location.pathname === '/products' ? 'active' : ''}
          >
            <span>📦</span>
            Produtos
          </Link>

          <Link
            to="/clients"
            className={location.pathname === '/clients' ? 'active' : ''}
          >
            <span>👥</span>
            Clientes
          </Link>

          <Link
            to="/sales"
            className={location.pathname === '/sales' ? 'active' : ''}
          >
            <span>💰</span>
            Vendas
          </Link>

          <Link
            to="/profile"
            className={location.pathname === '/profile' ? 'active' : ''}
          >
            <span>👤</span>
            Perfil
          </Link>
        </nav>
      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        🚪 Sair
      </button>
    </aside>
  )
}

export default Sidebar