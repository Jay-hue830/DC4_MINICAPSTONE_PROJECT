import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user.role === 'admin'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      navigate('/login', {
        state: {
          message: 'Your local session ended, but the server could not confirm logout.',
        },
      })
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <strong>Senior Assistance Tracker</strong>
        <div className="nav-links">
          <NavLink to={isAdmin ? '/admin' : '/my-dashboard'}>Dashboard</NavLink>
          {isAdmin && <NavLink to="/senior-citizens">Senior Citizens</NavLink>}
          <NavLink to="/requests">Requests</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
