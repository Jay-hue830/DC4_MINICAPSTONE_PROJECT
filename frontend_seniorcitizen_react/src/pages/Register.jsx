import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card auth-card" onSubmit={submit}>
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Name"
        aria-label="Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
      />
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
      <input
        type="password"
        placeholder="Confirm password"
        aria-label="Confirm password"
        value={form.password_confirmation}
        onChange={(event) =>
          setForm({ ...form, password_confirmation: event.target.value })
        }
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </form>
  )
}
