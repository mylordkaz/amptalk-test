export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i
  const userAgentIsMobile = mobileRegex.test(userAgent.toLowerCase())

  const hasTouchSupport =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0

  const isSmallScreen = window.innerWidth < 768

  const platformIsMobile = /android|iphone|ipad|ipod/i.test(
    (navigator as any).platform || ''
  )

  return userAgentIsMobile || platformIsMobile || (hasTouchSupport && isSmallScreen)
}
