import api from './api'

export const getRequests = (params) =>
  api.get('/assistance-requests', { params })

export const getRequest = (id) => api.get(`/assistance-requests/${id}`)

export const createRequest = (payload) =>
  api.post('/assistance-requests', payload)

export const updateRequest = (id, payload) =>
  api.put(`/assistance-requests/${id}`, payload)

export const deleteRequest = (id) =>
  api.delete(`/assistance-requests/${id}`)

export const getAssistanceTypes = () => api.get('/assistance-types')
