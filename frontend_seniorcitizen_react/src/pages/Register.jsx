import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import FormInput from '../components/FormInput'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    birth_date: '',
    sex: '',
    contact_number: '',
    address: '',
    barangay: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [latestBirthDate] = useState(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 60)
    return date.toISOString().slice(0, 10)
  })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setFieldErrors(requestError.response?.data?.errors ?? {})
      setError(requestError.response?.data?.message ?? 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card auth-card" onSubmit={submit}>
      <h2>Register</h2>
      <Alert type="error">{error}</Alert>
      <FormInput
        label="First name"
        name="first_name"
        value={form.first_name}
        error={fieldErrors.first_name?.[0]}
        onChange={(event) => setForm({ ...form, first_name: event.target.value })}
        maxLength={100}
        autoComplete="given-name"
        required
      />
      <FormInput
        label="Last name"
        name="last_name"
        value={form.last_name}
        error={fieldErrors.last_name?.[0]}
        onChange={(event) => setForm({ ...form, last_name: event.target.value })}
        maxLength={100}
        autoComplete="family-name"
        required
      />
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        error={fieldErrors.email?.[0]}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        autoComplete="email"
        required
      />
      <FormInput
        label="Birth date"
        name="birth_date"
        type="date"
        value={form.birth_date}
        error={fieldErrors.birth_date?.[0]}
        onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
        max={latestBirthDate}
        required
      />
      <FormInput
        as="select"
        label="Sex"
        name="sex"
        value={form.sex}
        error={fieldErrors.sex?.[0]}
        onChange={(event) => setForm({ ...form, sex: event.target.value })}
        required
      >
        <option value="">Select</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </FormInput>
      <FormInput
        label="Contact number"
        name="contact_number"
        type="tel"
        value={form.contact_number}
        error={fieldErrors.contact_number?.[0]}
        onChange={(event) => setForm({ ...form, contact_number: event.target.value })}
        placeholder="09171234567"
        autoComplete="tel"
        required
      />
      <FormInput
        label="Address"
        name="address"
        value={form.address}
        error={fieldErrors.address?.[0]}
        onChange={(event) => setForm({ ...form, address: event.target.value })}
        maxLength={255}
        autoComplete="street-address"
        required
      />
      <FormInput
        label="Barangay"
        name="barangay"
        value={form.barangay}
        error={fieldErrors.barangay?.[0]}
        onChange={(event) => setForm({ ...form, barangay: event.target.value })}
        maxLength={100}
        required
      />
      <FormInput
        label="Password"
        name="password"
        type="password"
        value={form.password}
        error={fieldErrors.password?.[0]}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        autoComplete="new-password"
        required
      />
      <FormInput
        label="Confirm password"
        name="password_confirmation"
        type="password"
        value={form.password_confirmation}
        error={fieldErrors.password_confirmation?.[0]}
        onChange={(event) =>
          setForm({ ...form, password_confirmation: event.target.value })
        }
        autoComplete="new-password"
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
