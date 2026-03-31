import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lockers from "./pages/Lockers";
import Reserve from "./pages/Reserve";
import MyLocker from "./pages/MyLocker";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/lockers" element={<Lockers />} />
          <Route path="/reserve" element={<ProtectedRoute><Reserve /></ProtectedRoute>} />
          <Route path="/my-locker" element={<ProtectedRoute><MyLocker /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
