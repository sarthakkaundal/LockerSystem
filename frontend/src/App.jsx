import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Lockers from "./pages/Lockers";
import Reserve from "./pages/Reserve";
import MyLocker from "./pages/MyLocker";
import History from "./pages/History";
import Admin from "./pages/Admin";

import { useAuth } from "./context/AuthContext";
import VaultaLogo from "./components/VaultaLogo";

import { useState } from "react";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageHeading = () => {
    switch (location.pathname) {
      case "/dashboard": return "Dashboard";
      case "/lockers": return "Locker Allocation";
      case "/reserve": return "Resource Assignment";
      case "/my-locker": return "My Locker";
      case "/history": return "Booking History";
      case "/admin": return "Administration";
      default: return "Dashboard";
    }
  };

  const getPageSubheading = () => {
    switch (location.pathname) {
      case "/dashboard": return "Real-time overview of system capacity and activity";
      case "/lockers": return "Browse, filter, and assign available lockers";
      case "/reserve": return "Configure and confirm a new locker assignment";
      case "/my-locker": return "View your active locker and access credentials";
      case "/history": return "Review your past bookings and transactions";
      case "/admin": return "Manage lockers, users, and system settings";
      default: return "";
    }
  };
  
  return (
    <div className={`flex min-h-screen w-full ${location.pathname === '/' ? 'bg-white' : 'bg-gray-50'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)',
          },
          success: {
            iconTheme: { primary: '#f97316', secondary: '#fff' },
          },
        }}
      />
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className="flex-1 flex flex-col min-w-0">
        {isAuthenticated && (
          <header className="flex justify-between items-center px-4 sm:px-8 h-16 bg-white sticky top-0 z-30 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-orange-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{getPageHeading()}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{getPageSubheading()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-medium truncate max-w-[180px]">{user?.name || user?.email}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-gray-600 hover:text-orange-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                Log out
              </button>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/lockers" element={<ProtectedRoute><Lockers /></ProtectedRoute>} />
                <Route path="/reserve" element={<ProtectedRoute><Reserve /></ProtectedRoute>} />
                <Route path="/my-locker" element={<ProtectedRoute><MyLocker /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
