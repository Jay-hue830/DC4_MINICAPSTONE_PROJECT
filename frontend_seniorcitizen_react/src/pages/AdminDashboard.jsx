import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import StatCard from '../components/StatCard'
import useAuth from '../hooks/useAuth'
import useDashboard from '../hooks/useDashboard'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useDashboard()
  const requestsByStatus = stats?.requests_by_status ?? {}

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <Alert type="error">{error}</Alert>
      {loading ? (
        <Loading />
      ) : (
        stats && (
          <div className="stat-grid">
            <StatCard label="Senior Citizens" value={stats.total_senior_citizens} />
            <StatCard label="Total Requests" value={stats.total_requests} />
            <StatCard label="Pending" value={requestsByStatus.pending} tone="warn" />
            <StatCard label="Approved" value={requestsByStatus.approved} tone="info" />
            <StatCard label="Completed" value={requestsByStatus.completed} tone="good" />
            <StatCard label="Rejected" value={requestsByStatus.rejected} tone="bad" />
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
