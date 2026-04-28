import { Link } from "react-router-dom";
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

function Sidebar() {
  const navigate = useNavigate()

  async function handleLogout() {
    // 1. Avisa o Supabase para encerrar a sessão
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert("Erro ao sair: " + error.message)
    } else {
      // 2. Redireciona o usuário para a tela de login (index)
      navigate('/')
    }
  }

  return (
    <div className="sidebar">
      <div>
        <h2 className="logo" style={{ color: '#ffffff', margin: '0 0 30px 0', display: 'block' }}>
          Sistema
        </h2>

        <nav className="sidebar-nav">
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/products">📦 Produtos</Link>
          <Link to="/profile">👤 Perfil</Link>
          <Link to="/sales">💰 Vendas</Link>
        </nav>
      </div>

      {/* Adicionei o onClick aqui para chamar a função */}
      <button 
        className="btn btn-danger logout-btn" 
        onClick={handleLogout}
      >
        🚪 Sair
      </button>

    </div>
  );
}

export default Sidebar;