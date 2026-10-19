import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Loading from '../../components/Loading'
import StatusBadge from '../../components/StatusBadge'
import StatusControls from '../../components/StatusControls'
import useAuth from '../../hooks/useAuth'
import { getRequest } from '../../services/requestService'
import { canEditRequest } from '../../utils/requestRules'

export default function AssistanceRequestDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [request, setRequest] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadedId, setLoadedId] = useState(null)

  useEffect(() => {
    let isActive = true

    const loadRequest = async () => {
      try {
        const { data } = await getRequest(id)
        if (isActive) {
          setRequest(data.data ?? data)
          setError('')
        }
      } catch (requestError) {
        if (isActive) {
          setRequest(null)
          const status = requestError.response?.status
          setError(
            status === 404
              ? 'Assistance request not found.'
              : status === 403
                ? 'You are not allowed to view this request.'
                : requestError.response?.data?.message ??
                  'Failed to load request details.',
          )
        }
      } finally {
        if (isActive) {
          setLoadedId(id)
        }
      }
    }

    loadRequest()

    return () => {
      isActive = false
    }
  }, [id])

  if (loadedId !== id) {
    return <Loading text="Loading request details..." />
  }

  return (
    <section className="page">
      <h1>Assistance Request Details</h1>
      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>
      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      {request ? (
        <article className="card request-detail">
          <h2>{request.title}</h2>
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
            <dt>Description</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>
              {request.description ?? '-'}
            </dd>
          </dl>
          {user.role === 'admin' && (
            <div style={{ marginTop: 20 }}>
              <h3>Update Status</h3>
              <StatusControls
                request={request}
                onChanged={(message, updatedRequest) => {
                  setRequest(updatedRequest)
                  setSuccess(message)
                  setError('')
                }}
                onError={setError}
              />
            </div>
          )}
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
