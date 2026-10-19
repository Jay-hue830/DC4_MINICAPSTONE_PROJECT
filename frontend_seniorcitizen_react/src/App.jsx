import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import SeniorCitizenDashboard from './pages/SeniorCitizenDashboard'
import SeniorList from './pages/admin/seniors/SeniorList'
import SeniorForm from './pages/admin/seniors/SeniorForm'
import SeniorDetail from './pages/admin/seniors/SeniorDetail'
import RequestList from './pages/requests/RequestList'
import RequestForm from './pages/requests/RequestForm'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/requests" element={<RequestList />} />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute roles={['senior_citizen']}>
              <RequestForm />
            </ProtectedRoute>
          }
        />
        <Route path="/requests/:id/edit" element={<RequestForm />} />
        <Route
          path="/my-dashboard"
          element={
            <ProtectedRoute roles={['senior_citizen']}>
              <SeniorCitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/senior-citizens"
          element={<Navigate to="/admin/senior-citizens" replace />}
        />
        <Route
          path="/admin/senior-citizens"
          element={
            <ProtectedRoute roles={['admin']}>
              <SeniorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/senior-citizens/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <SeniorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/senior-citizens/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <SeniorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/senior-citizens/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <SeniorDetail />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
