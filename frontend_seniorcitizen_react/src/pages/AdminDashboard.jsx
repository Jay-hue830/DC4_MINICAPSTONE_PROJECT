import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Loading from '../components/Loading'
import StatCard from '../components/StatCard'
import useAuth from '../hooks/useAuth'
import useDashboard from '../hooks/useDashboard'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { stats, loading, error, reload } = useDashboard()

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
      {error ? (
        <Alert type="error">
          <>
            {error}{' '}
            <Button variant="secondary" onClick={reload}>
              Retry
            </Button>
          </>
        </Alert>
      ) : loading ? (
        <Loading />
      ) : (
        stats && (
          <div className="stat-grid">
            <StatCard
              label="Total Senior Citizens"
              value={stats.total_senior_citizens}
            />
            <StatCard
              label="Total Assistance Requests"
              value={stats.total_requests}
            />
            <StatCard
              label="Pending Requests"
              value={stats.pending_requests}
              tone="warn"
            />
            <StatCard
              label="Approved Requests"
              value={stats.approved_requests}
              tone="info"
            />
            <StatCard
              label="Completed Requests"
              value={stats.completed_requests}
              tone="good"
            />
            <StatCard
              label="Rejected Requests"
              value={stats.rejected_requests}
              tone="bad"
            />
          </div>
        )
      )}
      <div className="actions dashboard-actions">
        <Link className="btn btn-primary" to="/admin/senior-citizens">
          Manage Senior Citizens
        </Link>
        <Link className="btn btn-secondary" to="/requests">
          View Requests
        </Link>
      </div>
    </section>
  )
}
