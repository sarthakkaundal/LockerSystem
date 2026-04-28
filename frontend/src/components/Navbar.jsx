import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        LockerSystem ERP
      </div>
      <nav className="flex-col" style={{ display: "flex", flex: 1, paddingTop: "8px" }}>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/lockers" className={linkClass}>Locker Allocation</NavLink>
        <NavLink to="/my-locker" className={linkClass}>My Record</NavLink>
        <NavLink to="/history" className={linkClass}>Booking History</NavLink>
        
        {user?.role === "ADMIN" ? (
          <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
            <NavLink to="/admin" className={linkClass}>System Administration</NavLink>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
