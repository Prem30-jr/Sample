require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 5000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

// Verify JWT from frontend
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  req.user = user
  next()
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Upstrive API is running 🚀' })
})

// GET profile
app.get('/api/profile', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message })
  }
  res.json({ profile: profile || null })
})

// PUT profile (create or update)
app.put('/api/profile', requireAuth, async (req, res) => {
  const { full_name, college, year, phone, domain, bio } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: req.user.id,
      email: req.user.email,
      full_name, college, year, phone, domain, bio,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ profile: data })
})

app.listen(PORT, () => {
  console.log(`✅ Upstrive backend running on http://localhost:${PORT}`)
})