import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

function AppLayout({ children }) {
  return (
    <div className="app-layout">

      <Navbar />

      <div className="app-body">

        <Sidebar />

        <main className="page-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AppLayout;