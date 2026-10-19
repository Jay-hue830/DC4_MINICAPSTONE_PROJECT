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
import AssistanceRequestList from './pages/requests/AssistanceRequestList'
import AssistanceRequestForm from './pages/requests/AssistanceRequestForm'
import AssistanceRequestDetails from './pages/requests/AssistanceRequestDetails'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/requests" element={<AssistanceRequestList />} />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute roles={['senior_citizen']}>
              <AssistanceRequestForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id/edit"
          element={<AssistanceRequestForm />}
        />
        <Route
          path="/requests/:id"
          element={<AssistanceRequestDetails />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['senior_citizen']}>
              <SeniorCitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-dashboard"
          element={<Navigate to="/dashboard" replace />}
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
