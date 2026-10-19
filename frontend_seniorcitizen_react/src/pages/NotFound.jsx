import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function NotFound() {
  const { user } = useAuth()
  const home = !user ? '/login' : user.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="page empty">
      <h1>404 - Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to={home}>
        Go back
      </Link>
    </div>
  )
}
