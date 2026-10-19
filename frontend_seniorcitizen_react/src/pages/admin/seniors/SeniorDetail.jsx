import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../../components/Alert'
import Loading from '../../../components/Loading'
import { getSenior } from '../../../services/seniorService'

export default function SeniorDetail() {
  const { id } = useParams()
  const [senior, setSenior] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadSenior = async () => {
      try {
        const { data } = await getSenior(id)

        if (isActive) {
          setSenior(data.data ?? data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.status === 404
              ? 'Senior citizen not found.'
              : requestError.response?.data?.message ??
                  'Failed to load details.',
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
  }, [id])

  if (loading) {
    return <Loading text="Loading senior details..." />
  }

  return (
    <section className="page senior-detail-page">
      <h1>Senior Citizen Details</h1>
      <Alert type="error">{error}</Alert>

      {senior ? (
        <div className="card">
          <dl className="detail-grid">
            <dt>Full Name</dt>
            <dd>{senior.full_name ?? `${senior.first_name} ${senior.last_name}`}</dd>
            <dt>Account</dt>
            <dd>{senior.user?.email ?? `User ID ${senior.user_id}`}</dd>
            <dt>Birth Date</dt>
            <dd>{senior.birth_date}</dd>
            <dt>Age</dt>
            <dd>{senior.age ?? '-'}</dd>
            <dt>Sex</dt>
            <dd>{senior.sex ?? '-'}</dd>
            <dt>Address</dt>
            <dd>{senior.address}</dd>
            <dt>Barangay</dt>
            <dd>{senior.barangay ?? '-'}</dd>
            <dt>Contact</dt>
            <dd>{senior.contact_number || '-'}</dd>
            <dt>Emergency Contact</dt>
            <dd>{senior.emergency_contact_name || '-'}</dd>
            <dt>Emergency Number</dt>
            <dd>{senior.emergency_contact_number || '-'}</dd>
          </dl>
          <div className="actions senior-detail-actions">
            <Link
              className="btn btn-primary"
              to={`/admin/senior-citizens/${senior.id}/edit`}
            >
              Edit
            </Link>
            <Link
              className="btn btn-secondary"
              to="/admin/senior-citizens"
            >
              Back to list
            </Link>
          </div>
        </div>
      ) : (
        <Link to="/admin/senior-citizens">Back to list</Link>
      )}
    </section>
  )
}