import type {
  LoginCredentials,
  RegisterData,
  AuthApiResponse,
  CurrentUserApiResponse,
  LogoutResponse,
} from '@/types/auth'
import apiClient from './client'

export const authApi = {
  async register(data: RegisterData): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/api/auth/register', data)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/api/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout')
    return response.data
  },

  async getCurrentUser(): Promise<CurrentUserApiResponse> {
    const response = await apiClient.get<CurrentUserApiResponse>('/api/auth/me')
    return response.data
  },
}

export default authApi
