import { Link } from 'react-router-dom'

export default function SeniorCitizenDashboard() {
  return (
    <>
      <h1>Senior Citizen Dashboard</h1>
      <div className="actions">
        <Link className="btn btn-primary" to="/requests/new">
          Submit a Request
        </Link>
        <Link className="btn btn-secondary" to="/requests">
          My Requests
        </Link>
      </div>
    </>
  )
}
