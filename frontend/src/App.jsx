import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Navbar"; // Renaming Navbar to Sidebar later
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
  
  return (
    <div className="app-wrapper">
      {isAuthenticated && <Sidebar />}
      <div className="main-wrapper">
        {isAuthenticated && (
          <header className="topbar">
            <div></div>
            <div className="flex items-center gap-2">
              <span className="nav-user">{user?.email}</span>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                Log out
              </button>
            </div>
          </header>
        )}
        <main className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lockers" element={<ProtectedRoute><Lockers /></ProtectedRoute>} />
            <Route path="/reserve" element={<ProtectedRoute><Reserve /></ProtectedRoute>} />
            <Route path="/my-locker" element={<ProtectedRoute><MyLocker /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
