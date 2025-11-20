import type {
  LoginCredentials,
  RegisterData,
  AuthApiResponse,
  CurrentUserApiResponse,
  LogoutResponse,
} from '@/types/auth'
import apiClient from './client'
import { setToken, removeToken } from '@/utils/tokenStorage'
import { isMobileDevice } from '@/utils/deviceDetection'

export const authApi = {
  async register(data: RegisterData): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/api/auth/register', data)
    if (response.data.token && isMobileDevice()) {
      setToken(response.data.token)
    }
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/api/auth/login', credentials)
    if (response.data.token && isMobileDevice()) {
      setToken(response.data.token)
    }
    return response.data
  },

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/api/auth/logout')
      return response.data
    } finally {
      removeToken()
    }
  },

  async getCurrentUser(): Promise<CurrentUserApiResponse> {
    const response = await apiClient.get<CurrentUserApiResponse>('/api/auth/me')
    return response.data
  },
}

export default authApi
