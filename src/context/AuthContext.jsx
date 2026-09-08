import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('orca_jwt_token') || null
    } catch {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('orca_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedZones, setSavedZones] = useState([])

  // Helper to store/remove auth session
  const saveSession = (authToken, authUser) => {
    setToken(authToken)
    setUser(authUser)
    try {
      if (authToken) {
        localStorage.setItem('orca_jwt_token', authToken)
        localStorage.setItem('orca_user', JSON.stringify(authUser))
      } else {
        localStorage.removeItem('orca_jwt_token')
        localStorage.removeItem('orca_user')
      }
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }

  // Fetch /api/auth/me on mount if token exists
  useEffect(() => {
    let isMounted = true
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (res.ok) {
          const userData = await res.json()
          if (isMounted) {
            setUser(userData)
            localStorage.setItem('orca_user', JSON.stringify(userData))
            fetchSavedZones(token)
          }
        } else {
          // Token expired or invalid
          if (isMounted) saveSession(null, null)
        }
      } catch (err) {
        console.warn('Failed to verify token with backend, keeping cached session:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    verifyToken()
    return () => {
      isMounted = false
    }
  }, [token])

  const login = async (email, password) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) {
        const message = data.detail || 'Authentication failed. Please verify credentials.'
        setError(message)
        throw new Error(message)
      }

      saveSession(data.access_token, data.user)
      fetchSavedZones(data.access_token)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (userData) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await res.json()
      if (!res.ok) {
        const message = data.detail || 'Registration failed. Please check the details entered.'
        setError(message)
        throw new Error(message)
      }

      saveSession(data.access_token, data.user)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const officerVerify = async (officerData) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/officer-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officerData)
      })

      const data = await res.json()
      if (!res.ok) {
        const message = data.detail || 'Government Officer verification failed. Please check badge and credentials.'
        setError(message)
        throw new Error(message)
      }

      saveSession(data.access_token, data.user)
      fetchSavedZones(data.access_token)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const ssoLogin = async (ssoPayload) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ssoPayload)
      })

      const data = await res.json()
      if (!res.ok) {
        const message = data.detail || 'SSO authentication failed.'
        setError(message)
        throw new Error(message)
      }

      saveSession(data.access_token, data.user)
      fetchSavedZones(data.access_token)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    saveSession(null, null)
    setSavedZones([])
    setError(null)
  }

  const fetchSavedZones = async (authToken = token) => {
    if (!authToken) return
    try {
      const res = await fetch('/api/user/saved-zones', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (res.ok) {
        const list = await res.json()
        setSavedZones(list.map((item) => item.zone_id))
      }
    } catch (err) {
      console.warn('Failed to fetch saved zones:', err)
    }
  }

  const toggleSaveZone = async (zoneId) => {
    if (!token) return false
    const isSaved = savedZones.includes(zoneId)

    try {
      if (isSaved) {
        const res = await fetch(`/api/user/saved-zones/${zoneId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setSavedZones((prev) => prev.filter((id) => id !== zoneId))
          return false
        }
      } else {
        const res = await fetch(`/api/user/saved-zones/${zoneId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        if (res.ok) {
          setSavedZones((prev) => [...prev, zoneId])
          return true
        }
      }
    } catch (err) {
      console.warn('Error saving zone:', err)
    }
    return isSaved
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        setError,
        login,
        register,
        officerVerify,
        ssoLogin,
        logout,
        savedZones,
        toggleSaveZone,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
