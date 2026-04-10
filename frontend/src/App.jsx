import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="page-center">
      <div className="spinner" />
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <LoginPage />} />
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <ProfilePage user={user} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={user ? '/profile' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}