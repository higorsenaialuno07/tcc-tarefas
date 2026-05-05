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
    <header className="header">
      <h3>Bem-vindo</h3>

      <div className="user-box">
        <span>{user?.email}</span>
      </div>
    </header>
  );
}

export default Header;