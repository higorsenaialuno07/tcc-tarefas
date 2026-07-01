import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [msg, setMsg] = useState({
    type: "",
    text: ""
  });

  // 🔄 Carregar usuário
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      setName(data.user?.user_metadata?.name || "");

      setAvatarUrl(
        data.user?.user_metadata?.avatar_url || ""
      );
    }

    loadUser();
  }, []);

  // 🔔 Toast
  function showMsg(type, text) {
    setMsg({ type, text });

    setTimeout(() => {
      setMsg({ type: "", text: "" });
    }, 3000);
  }

  // 📷 Upload Avatar
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];

    if (!file || !user) return;

    setLoadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();

      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrl
          }
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);

      showMsg("success", "Foto atualizada!");

    } catch (error) {
      showMsg("error", error.message);
    } finally {
      setLoadingAvatar(false);
    }
  }

  // 👤 Atualizar nome
  async function handleUpdateProfile() {
    setLoadingProfile(true);

    const { data, error } =
      await supabase.auth.updateUser({
        data: {
          name
        }
      });

    setLoadingProfile(false);

    if (error) {
      showMsg("error", "Erro ao atualizar.");
    } else {
      setUser(data.user);
      showMsg("success", "Dados atualizados!");
    }
  }

  // 🔒 Alterar senha
  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showMsg("error", "Senha muito curta.");
      return;
    }

    setLoadingPassword(true);

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword
      });

    setLoadingPassword(false);

    if (error) {
      showMsg("error", "Erro ao mudar senha.");
    } else {
      setNewPassword("");
      showMsg("success", "Senha alterada!");
    }
  }

  if (!user) {
    return (
      <div className="loading">
        Carregando...
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">

          <div className="profile-grid">

            {/* CARD PERFIL */}
            <div className="profile-card">

              <div className="profile-avatar-container">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="profile-img-preview"
                    onError={() => setAvatarUrl("")}
                  />
                ) : (
                  <div className="profile-avatar">
                    {name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </div>
                )}

                <label
                  htmlFor="avatar-input"
                  className="btn-change-avatar"
                >
                  {loadingAvatar
                    ? "Enviando..."
                    : "📷 Alterar Foto"}
                </label>

                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />

              </div>

              <h3>Dados Pessoais</h3>

              <p className="profile-email">
                {user.email}
              </p>

              <div className="profile-field">
                <label>Nome Completo</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="profile-input"
                />
              </div>

              <button
                className="btn-save"
                onClick={handleUpdateProfile}
                disabled={loadingProfile}
              >
                {loadingProfile
                  ? "Salvando..."
                  : "Atualizar Nome"}
              </button>

            </div>

            {/* CARD SENHA */}
            <div className="profile-card">

              <h3>Segurança</h3>

              <p className="subtitle">
                Mantenha sua conta protegida
              </p>

              <div className="profile-field">

                <label>Nova Senha</label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="profile-input"
                />

              </div>

              <button
                className="btn-password"
                onClick={handleChangePassword}
                disabled={loadingPassword}
              >
                {loadingPassword
                  ? "Alterando..."
                  : "Mudar Senha"}
              </button>

            </div>

          </div>

          {/* TOAST */}
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