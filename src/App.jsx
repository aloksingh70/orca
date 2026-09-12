import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Landing from './pages/index.jsx'
import Advisory from './pages/advisory.jsx'
import Login from './pages/login.jsx'
import Methodology from './pages/methodology.jsx'
import NotFound from './pages/NotFound.jsx'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF4F8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#007A78]/30 border-t-[#007A78] rounded-full animate-spin mb-3" />
        <span className="font-mono text-xs font-bold text-[#007A78] uppercase tracking-wider">
          Initializing ORCA Marine Telemetry…
        </span>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Landing / Operational Overview */}
      <Route path="/" element={<Landing />} />
      <Route path="/overview" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />

      {/* Advisory Console (Guest / Demo / Authenticated) */}
      <Route path="/advisory" element={<Advisory />} />

      {/* Authentication */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/advisory" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/advisory" replace /> : <Login />
        }
      />

      {/* Scientific Methodology */}
      <Route path="/methodology" element={<Methodology />} />

      {/* Branded 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LanguageProvider>
  )
}
