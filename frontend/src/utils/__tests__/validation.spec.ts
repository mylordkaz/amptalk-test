import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, calculatePasswordStrength } from '../validation'

describe('validateEmail', () => {
  it('accepts valid email', () => {
    const result = validateEmail('user@example.com')
    expect(result.valid).toBe(true)
  })

  it('rejects empty email', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Email is required')
  })

  it('rejects invalid email format', () => {
    const result = validateEmail('invalid-email')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Invalid email format')
  })
})

describe('validatePassword', () => {
  it('accepts strong password', () => {
    const result = validatePassword('StrongPass123!')
    expect(result.valid).toBe(true)
  })

  it('rejects password without minimum length', () => {
    const result = validatePassword('Short1!')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Password must be at least 8 characters')
  })

  it('rejects password without uppercase letter', () => {
    const result = validatePassword('weakpass123!')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Password must contain at least one uppercase letter')
  })

  it('rejects password without lowercase letter', () => {
    const result = validatePassword('STRONGPASS123!')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Password must contain at least one lowercase letter')
  })

  it('rejects password without number', () => {
    const result = validatePassword('StrongPass!')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Password must contain at least one number')
  })

  it('rejects password without special character', () => {
    const result = validatePassword('StrongPass123')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Password must contain at least one special character')
  })
})

describe('calculatePasswordStrength', () => {
  it('returns score 0 for empty password', () => {
    const result = calculatePasswordStrength('')
    expect(result.score).toBe(0)
    expect(result.requirements.length).toBe(false)
    expect(result.requirements.uppercase).toBe(false)
    expect(result.requirements.lowercase).toBe(false)
    expect(result.requirements.number).toBe(false)
    expect(result.requirements.special).toBe(false)
  })

  it('returns score 1 for password with only length', () => {
    const result = calculatePasswordStrength('12345678')
    expect(result.score).toBe(2) // length + number
    expect(result.requirements.length).toBe(true)
    expect(result.requirements.number).toBe(true)
  })

  it('returns score 5 for strong password with all requirements', () => {
    const result = calculatePasswordStrength('StrongPass123!')
    expect(result.score).toBe(5)
    expect(result.requirements.length).toBe(true)
    expect(result.requirements.uppercase).toBe(true)
    expect(result.requirements.lowercase).toBe(true)
    expect(result.requirements.number).toBe(true)
    expect(result.requirements.special).toBe(true)
  })

  it('validates all requirement flags correctly', () => {
    const weakPassword = calculatePasswordStrength('weak')
    expect(weakPassword.requirements.length).toBe(false)
    expect(weakPassword.requirements.uppercase).toBe(false)
    expect(weakPassword.requirements.lowercase).toBe(true)
    expect(weakPassword.requirements.number).toBe(false)
    expect(weakPassword.requirements.special).toBe(false)

    const partialPassword = calculatePasswordStrength('Password123')
    expect(partialPassword.requirements.length).toBe(true)
    expect(partialPassword.requirements.uppercase).toBe(true)
    expect(partialPassword.requirements.lowercase).toBe(true)
    expect(partialPassword.requirements.number).toBe(true)
    expect(partialPassword.requirements.special).toBe(false)
  })
})
