import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <>
      <h1>Admin Dashboard</h1>
      <Link className="btn btn-primary" to="/admin/senior-citizens">
        Manage Senior Citizens
      </Link>
    </>
  )
}
