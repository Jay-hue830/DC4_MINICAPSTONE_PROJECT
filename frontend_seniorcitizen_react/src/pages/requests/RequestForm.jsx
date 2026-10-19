import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  if (loading) {
    return <Loading text="Loading request form..." />
  }

  return (
    <section className="card request-form">
      <h1>{isEdit ? 'Edit Request' : 'New Request'}</h1>
      <Alert type="error" onClose={() => setMessage('')}>
        {message}
      </Alert>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Title"
          name="title"
          error={errors.title?.[0]}
          value={form.title}
          onChange={handleChange}
          maxLength={150}
          required
        />

        <FormInput
          as="select"
          label="Assistance Type"
          name="assistance_type_id"
          error={errors.assistance_type_id?.[0]}
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
          error={errors.date_needed?.[0]}
          value={form.date_needed}
          onChange={handleChange}
          min={minimumDate}
          required
        />

        <FormInput
          as="textarea"
          label="Description"
          name="description"
          error={errors.description?.[0]}
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
