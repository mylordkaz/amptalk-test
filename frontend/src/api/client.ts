import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status)
    }
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.error || error.message

      console.error(`[API Error] ${status}:`, message)

      switch (status) {
        case 401:
          console.warn('Unauthorized access - user may need to login')
          break
        case 403:
          console.warn('Forbidden - insufficient permissions')
          break
        case 404:
          console.warn('Resource not found')
          break
        case 429:
          console.warn('Too many requests - rate limited')
          break
        case 500:
          console.error('Server error')
          break
      }
    } else if (error.request) {
      console.error('[API Error] No response received:', error.request)
    } else {
      console.error('[API Error] Request setup failed:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
