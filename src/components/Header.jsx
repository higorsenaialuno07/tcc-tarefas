import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

function Header() {
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    loadUser();
  }, []);

  return (
    <header className="header">
      <h3>Bem-vindo</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button onClick={toggleTheme} className="theme-btn">
          {theme === "light" ? "🌞" : "🌙"}
        </button>

        <div className="user-box">
          <span>{user?.email}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;