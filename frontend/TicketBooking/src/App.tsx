
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminHome from './pages/AdminHome'
import UserHome from './pages/UserHome'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/user" element={<UserHome />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
