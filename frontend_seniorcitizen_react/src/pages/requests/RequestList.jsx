import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
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
  const [deletingId, setDeletingId] = useState(null)
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      await deleteRequest(id)

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
      setDeletingId(null)
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

      {error && <p className="error" role="alert">{error}</p>}
      {loading ? (
        <p>Loading requests...</p>
      ) : items.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
                    <td>{request.senior_citizen?.full_name ?? '-'}</td>
                  )}
                  <td>{request.title}</td>
                  <td>{request.assistance_type?.name ?? '-'}</td>
                  <td>{request.date_needed ?? '-'}</td>
                  <td>{request.status.replace('_', ' ')}</td>
                  <td className="table-actions">
                    {request.status === 'pending' && (
                      <>
                        <Link to={`/requests/${request.id}/edit`}>Edit</Link>
                        <button
                          type="button"
                          disabled={deletingId === request.id}
                          onClick={() => handleDelete(request.id)}
                        >
                          {deletingId === request.id ? 'Deleting...' : 'Delete'}
                        </button>
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
    </section>
  )
}
