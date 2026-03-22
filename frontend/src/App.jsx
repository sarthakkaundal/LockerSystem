import { useState } from 'react'
import {Route, Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'  
import Lockers from './pages/Lockers'  
import MyLocker from './pages/MyLocker'
import Admin from './pages/Admin'

function App() {
  return (
    <div classname="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lockers" element={<Lockers />} />
        <Route path="/my-locker" element={<MyLocker />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}

export default App
