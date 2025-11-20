export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

export interface AuthResponse {
  success: true
  message: string
  user: User
  token?: string // JWT token for mobile clients
}

export interface AuthError {
  success: false
  error: string
}

export interface CurrentUserResponse {
  success: true
  user: User
}

export interface LogoutResponse {
  success: true
  message: string
}

export interface ApiErrorResponse {
  success: false
  error: string
}

export type AuthApiResponse = AuthResponse | AuthError

export type CurrentUserApiResponse = CurrentUserResponse | ApiErrorResponse
