import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import StatusBadge from '../../components/StatusBadge'
import {
  deleteRequest,
  getRequests,
  updateRequestStatus,
} from '../../services/requestService'
import {
  canChangeRequestStatus,
  canDeleteRequest,
  canEditRequest,
  NEXT_STATUSES,
  STATUS_LABELS,
} from '../../utils/requestRules'

export default function AssistanceRequestList() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message ?? '')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let isActive = true

    const loadRequests = async () => {
      try {
        const { data } = await getRequests({
          page,
          per_page: 10,
          status: status || undefined,
        })

        if (isActive) {
          setItems(data.data)
          setMeta(data.meta)
        }
      } catch {
        if (isActive) {
          setItems([])
          setMeta(null)
          setError('Failed to load assistance requests.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      isActive = false
    }
  }, [page, refreshKey, status])

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setError('')
    setSuccess('')

    try {
      await deleteRequest(deleteTarget.id)
      setSuccess('Assistance request deleted.')
      setDeleteTarget(null)

      if (items.length === 1 && page > 1) {
        setLoading(true)
        setPage(page - 1)
      } else {
        setLoading(true)
        setRefreshKey((currentKey) => currentKey + 1)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusTarget) {
      return
    }

    if (
      statusTarget.status === 'rejected' &&
      !statusTarget.adminRemarks.trim()
    ) {
      setStatusError('A reason is required when rejecting a request.')
      return
    }

    setUpdatingStatus(true)
    setError('')
    setSuccess('')
    setStatusError('')

    try {
      await updateRequestStatus(statusTarget.request.id, {
        status: statusTarget.status,
        ...(statusTarget.status === 'rejected'
          ? { admin_remarks: statusTarget.adminRemarks }
          : {}),
      })
      setSuccess(
        `Request status updated to ${STATUS_LABELS[statusTarget.status]}.`,
      )
      setStatusTarget(null)
      setLoading(true)
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          'Could not update the request status.',
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handlePageChange = (nextPage) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setPage(nextPage)
  }

  const seniorName = (request) =>
    request.senior_citizen?.full_name ??
    (request.senior_citizen
      ? `${request.senior_citizen.first_name} ${request.senior_citizen.last_name}`
      : '-')

  return (
    <section className="requests-page">
      <header className="page-header">
        <h1>{isAdmin ? 'All Assistance Requests' : 'My Assistance Requests'}</h1>
        {!isAdmin && (
          <Link className="button-link" to="/requests/new">
            New Request
          </Link>
        )}
      </header>

      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>
      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      <div className="request-filter">
        <label htmlFor="request-status">Status</label>
        <select
          id="request-status"
          value={status}
          onChange={(event) => {
            setLoading(true)
            setError('')
            setSuccess('')
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading text="Loading requests..." />
      ) : items.length === 0 ? (
        <p className="empty">
          {status
            ? 'No requests with this status.'
            : isAdmin
              ? 'No requests have been submitted yet.'
              : 'You have not submitted any requests yet.'}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && <th>Senior Citizen</th>}
                <th>Title</th>
                <th>Type</th>
                <th>Date Needed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((request) => (
                <tr key={request.id}>
                  {isAdmin && (
                    <td data-label="Senior Citizen">
                      {seniorName(request)}
                    </td>
                  )}
                  <td data-label="Title">{request.title}</td>
                  <td data-label="Type">{request.assistance_type?.name ?? '-'}</td>
                  <td data-label="Date Needed">{request.date_needed ?? '-'}</td>
                  <td data-label="Status">
                    <StatusBadge status={request.status} />
                  </td>
                  <td data-label="Actions" className="actions">
                    <Link
                      className="btn btn-secondary"
                      to={`/requests/${request.id}`}
                    >
                      View
                    </Link>
                    {canEditRequest(user, request) && (
                      <Link
                        className="btn btn-secondary"
                        to={`/requests/${request.id}/edit`}
                      >
                        Edit
                      </Link>
                    )}
                    {canDeleteRequest(user, request) && (
                      <Button
                        variant="danger"
                        onClick={() => setDeleteTarget(request)}
                      >
                        Delete
                      </Button>
                    )}
                    {canChangeRequestStatus(user, request) && (
                      <div className="request-status-actions">
                        <label
                          className="sr-only"
                          htmlFor={`status-${request.id}`}
                        >
                          Update status for {request.title}
                        </label>
                        <select
                          id={`status-${request.id}`}
                          defaultValue=""
                          onChange={(event) => {
                            const nextStatus = event.target.value
                            if (nextStatus) {
                              setStatusError('')
                              setStatusTarget({
                                request,
                                status: nextStatus,
                                adminRemarks: '',
                              })
                              event.target.value = ''
                            }
                          }}
                        >
                          <option value="">Update status...</option>
                          {NEXT_STATUSES[request.status].map((nextStatus) => (
                            <option key={nextStatus} value={nextStatus}>
                              {STATUS_LABELS[nextStatus]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={handlePageChange} />

      {deleteTarget && (
        <Modal
          title="Delete assistance request?"
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p>This will permanently delete &quot;{deleteTarget.title}&quot;.</p>
        </Modal>
      )}

      {statusTarget && (
        <Modal
          title={`Change status to ${STATUS_LABELS[statusTarget.status]}?`}
          onClose={() => {
            if (!updatingStatus) {
              setStatusTarget(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={updatingStatus}
                onClick={() => setStatusTarget(null)}
              >
                Cancel
              </Button>
              <Button
                loading={updatingStatus}
                onClick={handleStatusUpdate}
              >
                Update status
              </Button>
            </>
          }
        >
          {statusError && <Alert type="error">{statusError}</Alert>}
          {statusTarget.status === 'rejected' && (
            <FormInput
              as="textarea"
              label="Reason for rejection"
              name="admin_remarks"
              rows={3}
              value={statusTarget.adminRemarks}
              onChange={(event) =>
                {
                  setStatusError('')
                  setStatusTarget({
                    ...statusTarget,
                    adminRemarks: event.target.value,
                  })
                }
              }
              maxLength={1000}
              required
            />
          )}
          <p>
            {statusTarget.request.title} — {seniorName(statusTarget.request)}
          </p>
        </Modal>
      )}
    </section>
  )
}
