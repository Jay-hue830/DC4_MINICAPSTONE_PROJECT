import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import FormInput from '../../../components/FormInput'
import Loading from '../../../components/Loading'
import {
  createSenior,
  getSenior,
  updateSenior,
} from '../../../services/seniorService'
import { validateSenior } from '../../../utils/validateSenior'

const EMPTY_FORM = {
  user_id: '',
  first_name: '',
  last_name: '',
  birth_date: '',
  sex: '',
  address: '',
  barangay: '',
  contact_number: '',
  emergency_contact_name: '',
  emergency_contact_number: '',
}

function getServerErrors(errors) {
  return Object.fromEntries(
    Object.entries(errors ?? {}).map(([field, messages]) => [
      field,
      messages[0],
    ]),
  )
}

export default function SeniorForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    if (!isEdit) {
      return
    }

    const loadSenior = async () => {
      try {
        const { data } = await getSenior(id)
        const senior = data.data ?? data

        if (isActive) {
          setForm({
            ...EMPTY_FORM,
            user_id: String(senior.user_id ?? ''),
            first_name: senior.first_name ?? '',
            last_name: senior.last_name ?? '',
            birth_date: senior.birth_date ?? '',
            sex: senior.sex ?? '',
            address: senior.address ?? '',
            barangay: senior.barangay ?? '',
            contact_number: senior.contact_number ?? '',
            emergency_contact_name: senior.emergency_contact_name ?? '',
            emergency_contact_number:
              senior.emergency_contact_number ?? '',
          })
        }
      } catch (requestError) {
        if (isActive) {
          setMessage(
            requestError.response?.status === 404
              ? 'Senior citizen not found.'
              : requestError.response?.data?.message ??
                  'Could not load this senior citizen.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSenior()

    return () => {
      isActive = false
    }
  }, [id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const clientErrors = validateSenior(form)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
      }

      if (isEdit) {
        await updateSenior(id, payload)
      } else {
        await createSenior(payload)
      }

      navigate('/admin/senior-citizens', {
        replace: true,
        state: {
          message: isEdit
            ? 'Senior citizen updated successfully.'
            : 'Senior citizen added successfully.',
        },
      })
    } catch (requestError) {
      if (requestError.response?.status === 422) {
        setErrors(getServerErrors(requestError.response.data.errors))
      } else {
        setMessage(
          requestError.response?.data?.message ??
            'Save failed. Please try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading text="Loading senior citizen..." />
  }

  return (
    <section className="page senior-form-page">
      <h1>{isEdit ? 'Edit Senior Citizen' : 'Add Senior Citizen'}</h1>
      <Alert type="error" onClose={() => setMessage('')}>
        {message}
      </Alert>

      <form className="card senior-form" onSubmit={handleSubmit} noValidate>
        {!isEdit && (
          <>
            <p className="form-help">
              Enter the ID of an existing user account that does not already
              have a senior citizen profile.
            </p>
            <FormInput
              label="Existing User ID"
              name="user_id"
              type="number"
              min="1"
              value={form.user_id}
              onChange={handleChange}
              error={errors.user_id}
              required
            />
          </>
        )}

        <FormInput
          label="First Name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          error={errors.first_name}
          maxLength={100}
          required
        />
        <FormInput
          label="Last Name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          error={errors.last_name}
          maxLength={100}
          required
        />
        <FormInput
          label="Birth Date"
          name="birth_date"
          type="date"
          value={form.birth_date}
          onChange={handleChange}
          error={errors.birth_date}
          required
        />
        <FormInput
          as="select"
          label="Sex"
          name="sex"
          value={form.sex}
          onChange={handleChange}
          error={errors.sex}
          required
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </FormInput>
        <FormInput
          as="textarea"
          label="Address"
          name="address"
          rows={3}
          value={form.address}
          onChange={handleChange}
          error={errors.address}
          maxLength={255}
          required
        />
        <FormInput
          label="Barangay"
          name="barangay"
          value={form.barangay}
          onChange={handleChange}
          error={errors.barangay}
          maxLength={100}
          required
        />
        <FormInput
          label="Contact Number"
          name="contact_number"
          type="tel"
          placeholder="09171234567"
          value={form.contact_number}
          onChange={handleChange}
          error={errors.contact_number}
          required
        />
        <FormInput
          label="Emergency Contact Name"
          name="emergency_contact_name"
          value={form.emergency_contact_name}
          onChange={handleChange}
          error={errors.emergency_contact_name}
          maxLength={150}
        />
        <FormInput
          label="Emergency Contact Number"
          name="emergency_contact_number"
          type="tel"
          placeholder="09171234567"
          value={form.emergency_contact_number}
          onChange={handleChange}
          error={errors.emergency_contact_number}
        />

        <div className="actions">
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Update' : 'Save'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/senior-citizens')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}