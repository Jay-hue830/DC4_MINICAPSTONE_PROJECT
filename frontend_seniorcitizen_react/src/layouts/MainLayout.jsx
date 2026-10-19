import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
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
      <header className="navbar">
        <div className="navbar-inner">
          <strong className="brand">Senior Assistance Tracker</strong>
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
              Dashboard
            </NavLink>
            {isAdmin ? (
              <>
                <NavLink to="/admin/senior-citizens">Senior Citizens</NavLink>
                <NavLink to="/requests">Requests</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/requests" end>My Requests</NavLink>
                <NavLink to="/requests/new">New Request</NavLink>
              </>
            )}
            <NavLink to="/profile">Profile</NavLink>
          </nav>
          <div className="nav-user">
            <span>{user.name}</span>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
