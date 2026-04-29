import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // URL da imagem de perfil
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setName(data.user?.user_metadata?.name || "");
      setAvatarUrl(data.user?.user_metadata?.avatar_url || "");
    }
    loadUser();
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  // --- NOVA FUNÇÃO: UPLOAD DE AVATAR ---
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload para o bucket (pode usar o mesmo product-images ou criar um novo 'profiles')
      const { error: uploadError } = await supabase.storage
        .from('product-images') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // 3. Atualizar metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      showMsg("success", "Foto de perfil atualizada!");
    } catch (error) {
      showMsg("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });
    setLoading(false);
    
    if (error) showMsg("error", "Erro ao atualizar.");
    else {
      showMsg("success", "Dados atualizados!");
      setUser(data.user);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showMsg("error", "Senha muito curta.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) showMsg("error", "Erro ao mudar senha.");
    else {
      showMsg("success", "Senha alterada!");
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
            
            {/* CARD 1: PERFIL COM FOTO REAL */}
            <div className="profile-card">
              <div className="profile-avatar-container">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="profile-img-preview" />
                ) : (
                  <div className="profile-avatar">
                    {name ? name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <label htmlFor="avatar-input" className="btn-change-avatar">
                  📷 Alterar Foto
                </label>
                <input 
                  type="file" id="avatar-input" accept="image/*" 
                  onChange={handleAvatarUpload} hidden 
                />
              </div>

              <h3>Dados Pessoais</h3>
              <p className="profile-email">{user.email}</p>
              
              <div className="profile-field">
                <label>Nome Completo</label>
                <input 
                  type="text" value={name} 
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
              <p className="subtitle">Mantenha sua conta protegida</p>
              <div className="profile-field">
                <label>Nova Senha</label>
                <input 
                  type="password" value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Mínimo 6 caracteres" className="profile-input"
                />
              </div>
              <button className="btn-password" onClick={handleChangePassword} disabled={loading}>
                Mudar Senha
              </button>
            </div>

          </div>

          {msg.text && <div className={`toast ${msg.type}`}>{msg.text}</div>}
        </main>
      </div>
    </div>
  );
}

export default Profile;