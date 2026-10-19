import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import SeniorCitizenDashboard from './pages/SeniorCitizenDashboard'
import SeniorCitizens from './pages/SeniorCitizens'
import AssistanceRequests from './pages/AssistanceRequests'
import AssistanceRequestForm from './pages/AssistanceRequestForm'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/requests" element={<AssistanceRequests />} />
        <Route path="/requests/new" element={<AssistanceRequestForm />} />
        <Route path="/requests/:id/edit" element={<AssistanceRequestForm />} />
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
          element={
            <ProtectedRoute roles={['admin']}>
              <SeniorCitizens />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
