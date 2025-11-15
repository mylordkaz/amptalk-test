export interface ValidationResult {
  valid: boolean
  message?: string
}

export interface PasswordStrengthResult {
  score: number
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return { valid: false, message: 'Email is required' }
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' }
  }

  return { valid: true }
}

export const validatePassword = (password: string): ValidationResult => {
  const requirements = calculatePasswordStrength(password).requirements

  if (!password) {
    return { valid: false, message: 'Password is required' }
  }

  if (!requirements.length) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }

  if (!requirements.uppercase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!requirements.lowercase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!requirements.number) {
    return { valid: false, message: 'Password must contain at least one number' }
  }

  if (!requirements.special) {
    return { valid: false, message: 'Password must contain at least one special character' }
  }

  return { valid: true }
}

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const score = Object.values(requirements).filter(Boolean).length

  return { score, requirements }
}
