import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setName(data.user.user_metadata?.name || "");
    }

    loadUser();
  }, []);

  async function handleUpdate() {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { name }
    });

    setLoading(false);

    if (error) {
      alert("Erro ao atualizar perfil");
    } else {
      alert("Perfil atualizado com sucesso!");
    }
  }

  if (!user) return <p>Carregando perfil...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.avatar}>
          {name ? name.charAt(0).toUpperCase() : "U"}
        </div>

        <h2 style={styles.title}>Meu Perfil</h2>

        <div style={styles.info}>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div style={styles.field}>
          <label>Nome</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
          />
        </div>

        <button
          style={styles.button}
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f6f8",
  },
  card: {
    width: "400px",
    padding: "30px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
  },
  title: {
    marginBottom: "20px",
  },
  info: {
    marginBottom: "20px",
  },
  field: {
    textAlign: "left",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }
};

export default Profile;