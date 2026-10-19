import { useState } from 'react'
import { AuthContext } from './auth-context'
import api from '../services/api'

export { AuthContext } from './auth-context'

function getStoredUser() {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const saveSession = ({ user: sessionUser, token }) => {
    if (!sessionUser || !token) {
      throw new Error('The authentication response is missing a user or token.')
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(sessionUser))
    setUser(sessionUser)
  }

  const login = async (credentials) => {
    const { data } = await api.post('/login', credentials)
    saveSession(data.data)
    return data.data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/register', payload)
    saveSession(data.data)
    return data.data.user
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
