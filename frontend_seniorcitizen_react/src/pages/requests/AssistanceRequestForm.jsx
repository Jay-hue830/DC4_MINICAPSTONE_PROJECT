import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import Loading from '../../components/Loading'
import {
  createRequest,
  getAssistanceTypes,
  getRequest,
  updateRequest,
} from '../../services/requestService'
import { canEditRequest } from '../../utils/requestRules'
import { validateRequest } from '../../utils/validateRequest'

const INITIAL_FORM = {
  title: '',
  description: '',
  assistance_type_id: '',
  date_needed: '',
}

export default function AssistanceRequestForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const navigate = useNavigate()
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    date_needed: isEdit ? '' : today,
  }))
  const [types, setTypes] = useState([])
  const [original, setOriginal] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
          setOriginal(request)
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
    setMessage('')

    const clientErrors = validateRequest(form, { isEdit, original })
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      if (isEdit) {
        const payload = { ...form }
        if (form.date_needed === original?.date_needed) {
          delete payload.date_needed
        }
        await updateRequest(id, payload)
      } else {
        await createRequest(form)
      }

      navigate('/requests', {
        replace: true,
        state: {
          message: isEdit
            ? 'Request updated successfully.'
            : 'Request submitted successfully.',
        },
      })
    } catch (requestError) {
      if (requestError.response?.status === 422) {
        setErrors(
          Object.fromEntries(
            Object.entries(requestError.response.data.errors ?? {}).map(
              ([name, messages]) => [name, messages[0]],
            ),
          ),
        )
      } else if (requestError.response?.status === 403) {
        setMessage('You are not allowed to change this request.')
      } else {
        setMessage(requestError.response?.data?.message ?? 'Save failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading text="Loading request form..." />
  }

  if (!isEdit && isAdmin) {
    return <Navigate to="/requests" replace />
  }

  if (isEdit && original && !canEditRequest(user, original)) {
    return (
      <section className="page">
        <Alert type="error">This request can no longer be edited.</Alert>
        <Button variant="secondary" onClick={() => navigate('/requests')}>
          Back to list
        </Button>
      </section>
    )
  }

  const fieldError = (name) =>
    Array.isArray(errors[name]) ? errors[name][0] : errors[name]

  const minDate =
    isEdit && form.date_needed === original?.date_needed
      ? undefined
      : today

  return (
    <section className="page request-form-page">
      <h1>{isEdit ? 'Edit Assistance Request' : 'New Assistance Request'}</h1>
      <Alert type="error" onClose={() => setMessage('')}>
        {message}
      </Alert>
      <form className="card request-form" onSubmit={handleSubmit} noValidate>
        {isEdit && isAdmin && original?.senior_citizen && (
          <p>
            <strong>Senior citizen:</strong>{' '}
            {original.senior_citizen.first_name} {original.senior_citizen.last_name}
          </p>
        )}

        <FormInput
          label="Title"
          name="title"
          error={fieldError('title')}
          value={form.title}
          onChange={handleChange}
          maxLength={150}
          required
        />

        <FormInput
          as="select"
          label="Assistance Type"
          name="assistance_type_id"
          error={fieldError('assistance_type_id')}
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
        </FormInput>

        <FormInput
          label="Date Needed"
          name="date_needed"
          type="date"
          error={fieldError('date_needed')}
          value={form.date_needed}
          onChange={handleChange}
          min={minDate}
          required
        />

        <FormInput
          as="textarea"
          label="Description"
          name="description"
          error={fieldError('description')}
          rows={4}
          value={form.description}
          onChange={handleChange}
          maxLength={2000}
          required
        />

        <div className="form-actions">
          <Button type="submit" loading={submitting}>
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/requests')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}
