import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    loadUser();
  }, []);

  return (
    <div style={styles.header}>
      <h3>Bem-vindo 👋</h3>

      <div style={styles.userBox}>
        <span>{user?.email}</span>
      </div>
    </div>
  );
}

const styles = {
  header: {
    height: "60px",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    marginLeft: "220px",
    borderBottom: "1px solid #eee",
    position: "fixed",
    top: 0,
    right: 0,
    left: "220px"
  },
  userBox: {
    background: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: "8px"
  }
};

export default Header;