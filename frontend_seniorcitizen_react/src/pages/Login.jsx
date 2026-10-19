import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(location.state?.message ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await login(form)
      const home = user.role === 'admin' ? '/admin' : '/dashboard'
      const from = location.state?.from?.pathname
      const allowed = from && (user.role === 'admin' || !from.startsWith('/admin'))
      navigate(allowed ? from : home, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card auth-card" onSubmit={submit}>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        aria-label="Email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        aria-label="Password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </form>
  )
}
