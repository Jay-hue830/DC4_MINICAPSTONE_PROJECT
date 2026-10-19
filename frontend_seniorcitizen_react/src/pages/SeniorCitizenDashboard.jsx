import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import StatCard from '../components/StatCard'
import useAuth from '../hooks/useAuth'
import useDashboard from '../hooks/useDashboard'

export default function SeniorCitizenDashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useDashboard()
  const requestsByStatus = stats?.requests_by_status ?? {}

  return (
    <section className="page">
      <h1>My Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <Alert type="error">{error}</Alert>
      {loading ? (
        <Loading />
      ) : (
        stats && (
          <div className="stat-grid">
            <StatCard label="My Requests" value={stats.total_requests} />
            <StatCard label="Pending" value={requestsByStatus.pending} tone="warn" />
            <StatCard label="Approved" value={requestsByStatus.approved} tone="info" />
            <StatCard label="Completed" value={requestsByStatus.completed} tone="good" />
            <StatCard label="Rejected" value={requestsByStatus.rejected} tone="bad" />
          </div>
        )
      )}
      <div className="actions dashboard-actions">
        <Link className="btn btn-primary" to="/requests/new">
          Submit a Request
        </Link>
        <Link className="btn btn-secondary" to="/requests">
          View My Requests
        </Link>
      </div>
    </section>
  )
}
