import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div>
        <h2 className="logo">Sistema</h2>

        <nav className="nav">
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/profile">👤 Perfil</Link>
        </nav>
      </div>

      <button className="btn btn-danger logout-btn">
        🚪 Sair
      </button>

    </div>
  );
}

export default Sidebar;