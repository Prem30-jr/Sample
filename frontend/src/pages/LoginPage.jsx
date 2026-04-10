import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } }
        })
        if (error) throw error
        setMessage('Account created! Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-up">
        <a href="/" className="logo">Up<span>strive</span></a>

        <div className="card">
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#F0EDE7',
            borderRadius: 'var(--radius-pill)', padding: 4, marginBottom: '2rem'
          }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMessage('') }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-head)',
                  fontWeight: 700, fontSize: '0.875rem',
                  background: tab === t ? 'var(--brand)' : 'transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--ink-mid)',
                  transition: 'all 0.2s'
                }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '1.75rem' }}>
            {tab === 'login' ? 'Sign in to your Upstrive account' : 'Start your internship journey today'}
          </p>

          {message && (
            <div style={{ background: '#E6F5EE', border: '1px solid #b3dfc4', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--success)' }}>
              ✓ {message}
            </div>
          )}
          {error && (
            <div style={{ background: '#FDEAEA', border: '1px solid #f5b8b8', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            {tab === 'signup' && (
              <div className="field">
                <label>Full Name</label>
                <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handle} required />
              </div>
            )}
            <div className="field">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
          Upstrive © {new Date().getFullYear()} · Internships made affordable
        </p>
      </div>
    </div>
  )
}