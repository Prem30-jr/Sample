import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function ProfilePage({ user }) {
  const [form, setForm] = useState({ full_name: '', college: '', year: '', phone: '', domain: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${BACKEND}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.profile) setForm({
        full_name: data.profile.full_name || '',
        college:   data.profile.college   || '',
        year:      data.profile.year      || '',
        phone:     data.profile.phone     || '',
        domain:    data.profile.domain    || '',
        bio:       data.profile.bio       || ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${BACKEND}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setMessage('Profile saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => { await supabase.auth.signOut() }

  const initials = (form.full_name || user.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (loading) return (
    <div className="page-center"><div className="spinner" /></div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span className="logo" style={{ marginBottom: 0 }}>Up<span>strive</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--ink-mid)' }}>{user.email}</span>
          <button onClick={logout} style={{
            background: 'transparent', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-pill)', padding: '0.45rem 1.1rem',
            cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 700,
            fontSize: '0.8rem', color: 'var(--ink-mid)'
          }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div style={{
        maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem',
        display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start'
      }}>

        {/* Sidebar */}
        <div className="card fade-up" style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--brand)', color: 'var(--accent)',
              fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}>
              {initials}
            </div>
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem' }}>
              {form.full_name || 'Your Name'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: 3 }}>{user.email}</p>
          </div>

          {[{ key: 'profile', label: 'Profile Settings' }, { key: 'account', label: 'Account' }].map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              style={{
                display: 'block', width: '100%', padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: '0.875rem', marginBottom: 4,
                background: activeSection === item.key ? '#E6F5EE' : 'transparent',
                color: activeSection === item.key ? 'var(--brand)' : 'var(--ink-mid)'
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="fade-up">
          {activeSection === 'profile' && (
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Profile Settings</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '2rem' }}>Update your personal and academic information</p>

              {message && <div style={{ background: '#E6F5EE', border: '1px solid #b3dfc4', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--success)' }}>✓ {message}</div>}
              {error   && <div style={{ background: '#FDEAEA', border: '1px solid #f5b8b8', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--error)' }}>{error}</div>}

              <form onSubmit={save}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }}>
                  <div className="field">
                    <label>Full Name</label>
                    <input name="full_name" value={form.full_name} onChange={handle} placeholder="John Doe" />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
                  </div>
                  <div className="field">
                    <label>College / University</label>
                    <input name="college" value={form.college} onChange={handle} placeholder="Anna University" />
                  </div>
                  <div className="field">
                    <label>Year of Study</label>
                    <select name="year" value={form.year} onChange={handle}>
                      <option value="">Select year</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Internship Domain Interest</label>
                    <select name="domain" value={form.domain} onChange={handle}>
                      <option value="">Select domain</option>
                      <option>Web Development</option>
                      <option>Data Science</option>
                      <option>UI/UX Design</option>
                      <option>Digital Marketing</option>
                      <option>Content Writing</option>
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Short Bio</label>
                    <textarea name="bio" value={form.bio} onChange={handle} rows={3} placeholder="Tell us a bit about yourself..." style={{ resize: 'vertical' }} />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Account</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '2rem' }}>Your account details</p>

              <div className="field">
                <label>Email Address</label>
                <input value={user.email} disabled style={{ background: '#F7F4EE', color: 'var(--ink-light)' }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: 5 }}>Email cannot be changed here. Contact support.</p>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--error)', marginBottom: '0.5rem' }}>Danger Zone</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>Sign out from your account on this device.</p>
                <button onClick={logout} className="btn btn-secondary" style={{ width: 'auto', color: 'var(--error)', borderColor: 'var(--error)' }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}