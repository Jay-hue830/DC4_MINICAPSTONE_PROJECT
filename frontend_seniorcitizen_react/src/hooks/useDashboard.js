import { useCallback, useEffect, useState } from 'react'
import { getDashboard } from '../services/dashboardService'

export default function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      try {
        const { data } = await getDashboard()
        if (isActive) {
          setStats(data.data ?? data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ??
              'Failed to load dashboard statistics.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      isActive = false
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    setReloadKey((currentKey) => currentKey + 1)
  }, [])

  return { stats, loading, error, reload }
}
