import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Loading from '../../components/Loading'
import StatusBadge from '../../components/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { getRequest } from '../../services/requestService'
import { canEditRequest } from '../../utils/requestRules'

export default function AssistanceRequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [request, setRequest] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadRequest = async () => {
      try {
        const { data } = await getRequest(id)
        if (isActive) {
          setRequest(data.data ?? data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.status === 404
              ? 'Assistance request not found.'
              : requestError.response?.data?.message ??
                  'Failed to load request details.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadRequest()

    return () => {
      isActive = false
    }
  }, [id])

  if (loading) {
    return <Loading text="Loading request details..." />
  }

  return (
    <section className="page">
      <Alert type="error">{error}</Alert>
      {request ? (
        <article className="card request-detail">
          <h1>{request.title}</h1>
          <dl className="detail-grid">
            {user.role === 'admin' && (
              <>
                <dt>Senior Citizen</dt>
                <dd>
                  {request.senior_citizen?.full_name ||
                    `${request.senior_citizen?.first_name ?? ''} ${request.senior_citizen?.last_name ?? ''}`.trim() ||
                    '-'}
                </dd>
              </>
            )}
            <dt>Assistance Type</dt>
            <dd>{request.assistance_type?.name ?? '-'}</dd>
            <dt>Date Needed</dt>
            <dd>{request.date_needed ?? '-'}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={request.status} />
            </dd>
            <dt>Submitted</dt>
            <dd>{request.created_at ?? '-'}</dd>
            {request.admin_remarks && (
              <>
                <dt>Admin Remarks</dt>
                <dd>{request.admin_remarks}</dd>
              </>
            )}
          </dl>
          <p className="request-description">{request.description}</p>
          <div className="actions">
            {canEditRequest(user, request) && (
              <Link
                className="btn btn-primary"
                to={`/requests/${request.id}/edit`}
              >
                Edit
              </Link>
            )}
            <Link className="btn btn-secondary" to="/requests">
              Back to requests
            </Link>
          </div>
        </article>
      ) : (
        <Link to="/requests">Back to requests</Link>
      )}
    </section>
  )
}
