import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <aside className="sidebar">
      <div style={{ padding: "0 8px 32px 8px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
          Locker System
        </h2>
      </div>

      <nav className="flex-col gap-2" style={{ display: "flex", flex: 1 }}>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/lockers" className={linkClass}>Lockers</NavLink>
        <NavLink to="/my-locker" className={linkClass}>My Locker</NavLink>
        <NavLink to="/history" className={linkClass}>History</NavLink>
        
        {user?.role === "ADMIN" ? (
          <NavLink to="/admin" className={linkClass} style={{ marginTop: "16px" }}>Admin</NavLink>
        ) : null}
      </nav>
    </aside>
  );
}
