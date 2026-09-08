import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Landing from './pages/index.jsx'
import Advisory from './pages/advisory.jsx'
import Login from './pages/login.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}
