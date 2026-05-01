import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Box, User, History as HistoryIcon, Settings } from "lucide-react";
import logoUrl from "../assets/logos/vaulta_logo.png";

import { useState } from "react";
import ProfileModal from "./ProfileModal";

export default function Navbar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const linkClass = ({ isActive }) => 
    `flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-4 pl-8 lg:pl-16 pr-4'} py-3 text-base font-bold rounded-lg transition-all duration-200 hover:translate-x-1 hover:bg-slate-800 hover:text-white w-full ${
      isActive 
        ? "relative bg-slate-800/80 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:rounded-r-md before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 shadow-sm" 
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
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen ${isCollapsed ? 'lg:w-20' : 'lg:w-84'} w-72 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-400 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-24 flex items-center justify-between lg:justify-center px-6 border-b border-slate-800 overflow-hidden relative">
          <img src={logoUrl} alt="Logo" className={`h-24 w-auto object-contain scale-[1.4] transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`} />
          {isCollapsed && <span className="hidden lg:block text-2xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">V</span>}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-4 flex flex-col">
        <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass} title={isCollapsed ? "Dashboard" : ""}>
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
        </NavLink>
        <NavLink to="/lockers" onClick={() => setIsOpen(false)} className={linkClass} title={isCollapsed ? "Locker Allocation" : ""}>
          <Box className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Locker Allocation</span>}
        </NavLink>
        <NavLink to="/my-locker" onClick={() => setIsOpen(false)} className={linkClass} title={isCollapsed ? "My Record" : ""}>
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">My Record</span>}
        </NavLink>
        <NavLink to="/history" onClick={() => setIsOpen(false)} className={linkClass} title={isCollapsed ? "Booking History" : ""}>
          <HistoryIcon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Booking History</span>}
        </NavLink>
        
        {user?.role === "ADMIN" ? (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 w-full flex flex-col">
            {!isCollapsed && <div className="px-4 mb-2 text-xs uppercase tracking-wide text-slate-500 text-center whitespace-nowrap">Administration</div>}
            <NavLink to="/admin" onClick={() => setIsOpen(false)} className={linkClass} title={isCollapsed ? "System Administration" : ""}>
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">System Administration</span>}
            </NavLink>
          </div>
        ) : null}
      </nav>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex items-center justify-center p-4 border-t border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mt-auto"
      >
        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
      </button>

      {user?.email && (
        <>
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className={`p-4 border-t border-slate-800 cursor-pointer ${isCollapsed ? 'flex justify-center' : ''}`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center p-0' : 'gap-3 px-4 py-3'} rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors w-full group`}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden" title={isCollapsed ? user.email : ""}>
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-slate-400 truncate group-hover:text-slate-300 transition-colors">Logged in as</span>
                  <span className="text-sm text-slate-200 truncate font-medium group-hover:text-white transition-colors">{user?.name || user.email}</span>
                </div>
              )}
            </div>
          </div>
          <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
      )}
    </aside>
    </>
  );
}
