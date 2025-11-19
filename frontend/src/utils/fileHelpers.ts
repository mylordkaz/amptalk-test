/**
 * File handling utility functions for image management
 */

// Constants
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
export const MAX_UPLOAD_BATCH_SIZE = 10 // Maximum files per upload

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface BatchValidationResult {
  valid: File[]
  invalid: Map<File, string>
  tooManyFiles: boolean
}

/**
 * Validates an image file for type and size constraints
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}. Please choose a smaller image.`
    }
  }

  return { valid: true }
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Formats an ISO date string to a readable format
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  return date.toLocaleDateString('en-US', options)
}

/**
 * Formats an ISO date string to include time
 * @param isoString - ISO 8601 date string
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  const dateStr = date.toLocaleDateString('en-US', dateOptions)
  const timeStr = date.toLocaleTimeString('en-US', timeOptions)

  return `${dateStr} at ${timeStr}`
}

/**
 * Gets a displayable filename, truncating if too long
 * @param filename - Original filename
 * @param maxLength - Maximum length before truncation (default: 30)
 * @returns Truncated filename with ellipsis if needed
 */
export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename

  const extension = filename.substring(filename.lastIndexOf('.'))
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3)

  return `${truncatedName}...${extension}`
}

/**
 * Validates multiple image files for batch upload
 * @param files - Array of files to validate
 * @returns Validation result with valid files, invalid files with reasons, and batch size check
 */
export function validateImageFiles(files: File[]): BatchValidationResult {
  const valid: File[] = []
  const invalid = new Map<File, string>()
  const tooManyFiles = files.length > MAX_UPLOAD_BATCH_SIZE

  // If too many files, reject entire batch
  if (tooManyFiles) {
    return {
      valid: [],
      invalid,
      tooManyFiles
    }
  }

  // Otherwise validate all files
  for (const file of files) {
    const result = validateImageFile(file)
    if (result.valid) {
      valid.push(file)
    } else {
      invalid.set(file, result.error || 'Unknown error')
    }
  }

  return {
    valid,
    invalid,
    tooManyFiles
  }
}
