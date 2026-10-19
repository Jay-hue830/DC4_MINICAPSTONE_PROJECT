import api from './api'

const BASE = '/senior-citizens'

export const getSeniors = (params) => api.get(BASE, { params })
export const getSenior = (id) => api.get(`${BASE}/${id}`)
export const createSenior = (payload) => api.post(BASE, payload)
export const updateSenior = (id, payload) => api.put(`${BASE}/${id}`, payload)
export const deleteSenior = (id) => api.delete(`${BASE}/${id}`)
