import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <nav>
      <span>Smart Attendance</span>
      {isAuthenticated && <button onClick={logout}>Logout</button>}
    </nav>
  );
}
