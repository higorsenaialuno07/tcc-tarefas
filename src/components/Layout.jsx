import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header />

        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  content: {
    marginTop: "60px",
    padding: "20px",
    background: "#f4f6f8",
    minHeight: "100vh"
  }
};

export default Layout;