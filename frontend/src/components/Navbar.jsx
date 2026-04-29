import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => 
    `flex items-center px-4 py-2.5 mx-3 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive 
        ? "bg-indigo-100 text-indigo-700" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">System<span className="text-slate-800">Pro</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 space-y-2">
        <div className="px-5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</div>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/lockers" className={linkClass}>Locker Allocation</NavLink>
        <NavLink to="/my-locker" className={linkClass}>My Record</NavLink>
        <NavLink to="/history" className={linkClass}>Booking History</NavLink>
        
        {user?.role === "ADMIN" ? (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
            <div className="px-5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
            <NavLink to="/admin" className={linkClass}>System Administration</NavLink>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
