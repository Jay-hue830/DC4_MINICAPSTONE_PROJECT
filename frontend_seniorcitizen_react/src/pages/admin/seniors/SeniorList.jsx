import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import Loading from '../../../components/Loading'
import Modal from '../../../components/Modal'
import Pagination from '../../../components/Pagination'
import { deleteSenior, getSeniors } from '../../../services/seniorService'

export default function SeniorList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message ?? '')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let isActive = true

    const loadSeniors = async () => {
      try {
        const { data } = await getSeniors({
          page,
          per_page: 10,
          search: debouncedSearch || undefined,
        })

        if (isActive) {
          setItems(data.data)
          setMeta(data.meta)
        }
      } catch (requestError) {
        if (isActive) {
          setItems([])
          setMeta(null)
          setError(
            requestError.response?.data?.message ??
              'Failed to load senior citizens.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSeniors()

    return () => {
      isActive = false
    }
  }, [debouncedSearch, page, refreshKey])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setPage(1)
    setLoading(true)
    setError('')
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    setLoading(true)
    setError('')
  }

  const confirmDelete = async () => {
    if (!toDelete) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      await deleteSenior(toDelete.id)
      setSuccess(`${toDelete.first_name} ${toDelete.last_name} was deleted.`)
      setToDelete(null)

      if (items.length === 1 && page > 1) {
        setPage(page - 1)
        setLoading(true)
      } else {
        setLoading(true)
        setRefreshKey((currentKey) => currentKey + 1)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Delete failed.')
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="page">
      <h1>Senior Citizens</h1>

      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>
      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          aria-label="Search senior citizens"
          placeholder="Search by name..."
          value={search}
          onChange={handleSearchChange}
        />
        <Link
          to="/admin/senior-citizens/new"
          className="btn btn-primary"
        >
          + Add Senior
        </Link>
      </div>

      {loading ? (
        <Loading text="Loading senior citizens..." />
      ) : items.length === 0 ? (
        <div className="card empty">
          {debouncedSearch
            ? `No senior citizens match "${debouncedSearch}".`
            : 'No senior citizens yet.'}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Birth Date</th>
                <th>Sex</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((senior) => (
                <tr key={senior.id}>
                  <td data-label="Name">
                    {senior.first_name} {senior.last_name}
                  </td>
                  <td data-label="Birth Date">{senior.birth_date}</td>
                  <td data-label="Sex">
                    {senior.sex
                      ? senior.sex.charAt(0).toUpperCase() + senior.sex.slice(1)
                      : '-'}
                  </td>
                  <td data-label="Contact">{senior.contact_number || '-'}</td>
                  <td data-label="Actions">
                    <div className="actions">
                      <Link
                        className="btn btn-secondary"
                        to={`/admin/senior-citizens/${senior.id}`}
                      >
                        View
                      </Link>
                      <Link
                        className="btn btn-secondary"
                        to={`/admin/senior-citizens/${senior.id}/edit`}
                      >
                        Edit
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => setToDelete(senior)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={handlePageChange} />

      {toDelete && (
        <Modal
          title="Delete senior citizen?"
          onClose={() => {
            if (!deleting) {
              setToDelete(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>
            This will delete{' '}
            <strong>
              {toDelete.first_name} {toDelete.last_name}
            </strong>
            . Their associated assistance requests will also be deleted. This
            cannot be undone.
          </p>
        </Modal>
      )}
    </section>
  )
}