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

import { useState } from "react";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageHeading = () => {
    switch (location.pathname) {
      case "/dashboard": return "System Dashboard";
      case "/lockers": return "Locker Allocation";
      case "/reserve": return "Resource Assignment";
      case "/my-locker": return "Active Assignment";
      case "/history": return "Booking History";
      case "/admin": return "System Administration";
      default: return "System Dashboard";
    }
  };
  
  return (
    <div className={`flex min-h-screen w-full ${location.pathname === '/' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Toaster position="top-right" />
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className="flex-1 flex flex-col min-w-0">
        {isAuthenticated && (
          <header className="flex justify-between items-center px-4 sm:px-6 h-16 bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800">{getPageHeading()}</div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline-block text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{user?.email}</span>
              <button
                type="button"
                onClick={logout}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
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
