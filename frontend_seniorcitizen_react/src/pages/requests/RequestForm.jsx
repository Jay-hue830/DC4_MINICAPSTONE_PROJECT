import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createRequest,
  getAssistanceTypes,
  getRequest,
  updateRequest,
} from '../../services/requestService'

const INITIAL_FORM = {
  title: '',
  description: '',
  assistance_type_id: '',
  date_needed: '',
}

export default function RequestForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [types, setTypes] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [minimumDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    let isActive = true

    const loadForm = async () => {
      setLoading(true)
      setMessage('')

      try {
        const [typesResponse, requestResponse] = await Promise.all([
          getAssistanceTypes(),
          isEdit ? getRequest(id) : Promise.resolve(null),
        ])

        if (!isActive) {
          return
        }

        setTypes(typesResponse.data.data ?? typesResponse.data)

        if (requestResponse) {
          const request = requestResponse.data.data ?? requestResponse.data
          setForm({
            title: request.title ?? '',
            description: request.description ?? '',
            assistance_type_id:
              request.assistance_type_id ?? request.assistance_type?.id ?? '',
            date_needed: request.date_needed ?? '',
          })
        }
      } catch (requestError) {
        if (isActive) {
          setMessage(
            requestError.response?.data?.message ??
              (isEdit
                ? 'Could not load the request or assistance types.'
                : 'Could not load assistance types.'),
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadForm()

    return () => {
      isActive = false
    }
  }, [id, isEdit])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: undefined })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrors({})
    setMessage('')
    setSubmitting(true)

    try {
      if (isEdit) {
        await updateRequest(id, form)
      } else {
        await createRequest(form)
      }

      navigate('/requests', { replace: true })
    } catch (requestError) {
      if (requestError.response?.status === 422) {
        setErrors(requestError.response.data.errors ?? {})
      } else {
        setMessage(requestError.response?.data?.message ?? 'Save failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) =>
    errors[name]?.[0] && <small className="field-error">{errors[name][0]}</small>

  if (loading) {
    return <p>Loading request form...</p>
  }

  return (
    <section className="card request-form">
      <h1>{isEdit ? 'Edit Request' : 'New Request'}</h1>
      {message && <p className="error" role="alert">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="request-title">Title</label>
          <input
            id="request-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={150}
            required
          />
          {fieldError('title')}
        </div>

        <div className="form-field">
          <label htmlFor="request-type">Assistance Type</label>
          <select
            id="request-type"
            name="assistance_type_id"
            value={form.assistance_type_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {fieldError('assistance_type_id')}
        </div>

        <div className="form-field">
          <label htmlFor="request-date">Date Needed</label>
          <input
            id="request-date"
            type="date"
            name="date_needed"
            value={form.date_needed}
            onChange={handleChange}
            min={minimumDate}
            required
          />
          {fieldError('date_needed')}
        </div>

        <div className="form-field">
          <label htmlFor="request-description">Description</label>
          <textarea
            id="request-description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            maxLength={2000}
            required
          />
          {fieldError('description')}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/requests')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}
