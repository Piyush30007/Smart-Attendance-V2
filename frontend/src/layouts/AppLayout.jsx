import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">

      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="app-body">

        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="page-content" onClick={closeSidebar}>
          {children || <Outlet />}
        </main>

      </div>

    </div>
  );
}

export default AppLayout;