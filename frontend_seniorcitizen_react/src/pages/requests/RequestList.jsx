import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { deleteRequest, getRequests } from '../../services/requestService'

export default function RequestList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
          setError('Failed to load requests.')
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

    try {
      await deleteRequest(deleteTarget.id)
      setDeleteTarget(null)

      if (items.length === 1 && page > 1) {
        setLoading(true)
        setPage(page - 1)
      } else {
        setLoading(true)
        setRefreshKey((currentKey) => currentKey + 1)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handlePageChange = (nextPage) => {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return (
    <section className="requests-page">
      <header className="page-header">
        <h1>Assistance Requests</h1>
        {user.role === 'senior_citizen' && (
          <Link className="button-link" to="/requests/new">
            New Request
          </Link>
        )}
      </header>

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
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Loading requests..." />
      ) : items.length === 0 ? (
        <p className="empty">No requests found.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {user.role === 'admin' && <th>Senior Citizen</th>}
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
                  {user.role === 'admin' && (
                    <td data-label="Senior Citizen">
                      {request.senior_citizen?.full_name ?? '-'}
                    </td>
                  )}
                  <td data-label="Title">{request.title}</td>
                  <td data-label="Type">{request.assistance_type?.name ?? '-'}</td>
                  <td data-label="Date Needed">{request.date_needed ?? '-'}</td>
                  <td data-label="Status">{request.status.replace('_', ' ')}</td>
                  <td data-label="Actions" className="actions">
                    {request.status === 'pending' && (
                      <>
                        <Link to={`/requests/${request.id}/edit`}>Edit</Link>
                        <Button
                          variant="danger"
                          onClick={() => setDeleteTarget(request)}
                        >
                          Delete
                        </Button>
                      </>
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
    </section>
  )
}
