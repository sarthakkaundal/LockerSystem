import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lockers from "./pages/Lockers";
import Reserve from "./pages/Reserve";
import MyLocker from "./pages/MyLocker";
import History from "./pages/History";
import Admin from "./pages/Admin";

import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
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
    <div className="flex min-h-screen w-full bg-slate-50">
      <Toaster position="top-right" />
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        {isAuthenticated && (
          <header className="flex justify-between items-center px-6 h-16 bg-white sticky top-0 z-40">
            <div className="text-lg font-semibold text-slate-800">{getPageHeading()}</div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{user?.email}</span>
              <button
                type="button"
                onClick={logout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
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
                <Route path="/" element={<Login />} />
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
