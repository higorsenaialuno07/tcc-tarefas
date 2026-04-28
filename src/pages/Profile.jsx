import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setName(data.user?.user_metadata?.name || "");
    }
    loadUser();
  }, []);

  // Função para mostrar feedback temporário
  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  async function handleUpdateProfile() {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });
    setLoading(false);
    
    if (error) {
      showMsg("error", "Erro ao atualizar nome.");
    } else {
      showMsg("success", "Nome atualizado!");
      setUser(data.user); // Adicione isso para atualizar o avatar na hora!
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showMsg("error", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) showMsg("error", "Erro ao mudar senha.");
    else {
      showMsg("success", "Senha alterada com sucesso!");
      setNewPassword("");
    }
  }

  if (!user) return <div className="loading">Carregando...</div>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />
        
        <main className="dashboard-content">
          <div className="profile-grid">
            
            {/* CARD 1: INFORMAÇÕES BÁSICAS */}
            <div className="profile-card">
              <div className="profile-avatar">
                {name ? name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <h3>Dados Pessoais</h3>
              <p className="profile-email">{user.email}</p>
              
              <div className="profile-field">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="profile-input"
                />
              </div>
              <button className="btn-save" onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Salvando..." : "Atualizar Nome"}
              </button>
            </div>

            {/* CARD 2: SEGURANÇA */}
            <div className="profile-card">
              <h3>Segurança</h3>
              <p className="subtitle">Altere sua senha de acesso</p>
              
              <div className="profile-field">
                <label>Nova Senha</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Mínimo 6 caracteres"
                  className="profile-input"
                />
              </div>
              <button className="btn-password" onClick={handleChangePassword} disabled={loading}>
                Mudar Senha
              </button>
            </div>

            {/* CARD 3: PREFERÊNCIAS (LAYOUT) */}
            <div className="profile-card">
              <h3>Preferências</h3>
              <div className="preference-item">
                <span>Notificações por E-mail</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="preference-item">
                <span>Modo Escuro (Em breve)</span>
                <input type="checkbox" disabled />
              </div>
            </div>

          </div>

          {/* MENSAGEM DE FEEDBACK */}
          {msg.text && (
            <div className={`toast ${msg.type}`}>
              {msg.text}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;