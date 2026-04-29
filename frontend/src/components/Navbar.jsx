import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Box, User, History as HistoryIcon, Settings } from "lucide-react";
import logoUrl from "../assets/logos/vaulta_logo.png";

export default function Navbar({ isOpen, setIsOpen }) {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => 
    `flex items-center justify-start gap-4 pl-8 lg:pl-16 pr-4 py-3 text-base font-bold rounded-lg transition-all duration-200 hover:translate-x-1 hover:bg-slate-800 hover:text-white w-full ${
      isActive 
        ? "relative bg-slate-800 text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-r before:bg-indigo-500" 
        : "text-slate-400"
    }`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-84 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-400 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-24 flex items-center justify-between lg:justify-center px-6 border-b border-slate-800 overflow-hidden">
          <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain scale-[1.4]" />
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4 flex flex-col">
        <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/lockers" onClick={() => setIsOpen(false)} className={linkClass}>
          <Box className="w-5 h-5" />
          <span>Locker Allocation</span>
        </NavLink>
        <NavLink to="/my-locker" onClick={() => setIsOpen(false)} className={linkClass}>
          <User className="w-5 h-5" />
          <span>My Record</span>
        </NavLink>
        <NavLink to="/history" onClick={() => setIsOpen(false)} className={linkClass}>
          <HistoryIcon className="w-5 h-5" />
          <span>Booking History</span>
        </NavLink>
        
        {user?.role === "ADMIN" ? (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-1 w-full flex flex-col">
            <div className="px-4 mb-2 text-xs uppercase tracking-wide text-slate-500 text-center">Administration</div>
            <NavLink to="/admin" onClick={() => setIsOpen(false)} className={linkClass}>
              <Settings className="w-5 h-5" />
              <span>System Administration</span>
            </NavLink>
          </div>
        ) : null}
      </nav>

      {user?.email && (
        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-slate-400 truncate">Logged in as</span>
              <span className="text-sm text-slate-200 truncate font-medium">{user.email}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
