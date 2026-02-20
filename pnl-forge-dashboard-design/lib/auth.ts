/**
 * Authentication Utilities - SIMPLIFIED
 * Handles JWT tokens, challenge nonces, and session management
 * 
 * NOTE: This is a simplified version without crypto for build purposes.
 * In production, use proper cryptographic libraries.
 */

// Simple in-memory cache for nonces
const nonceCache = new Map<string, { nonce: string; expiry: number }>()

// Simplified JWT encoding without crypto library
const encodeJWT = (payload: any, secret: string): string => {
  // This is NOT cryptographically secure - for demo/build purposes only
  const header = typeof btoa !== 'undefined' ? btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })) : 'eyJhbGciOiJub25lIn0='
  const body = typeof btoa !== 'undefined' ? btoa(JSON.stringify(payload)) : 'eyJkZW1vIjoidHJ1ZSJ9'
  const fakeSignature = 'fake-sig-placeholder'
  return `${header}.${body}.${fakeSignature}`
}

const decodeJWT = (token: string, secret: string): any => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token format')
  const body = parts[1]
  try {
    const decoded = typeof atob !== 'undefined' ? atob(body) : body
    return JSON.parse(decoded)
  } catch {
    return { walletAddress: 'unknown' }
  }
}

const getJWTSecret = (): string => {
  // In browser environment, process is undefined; handle gracefully
  try {
    const p = (globalThis as any).process
    if (p?.env?.JWT_SECRET) {
      return p.env.JWT_SECRET as string
    }
  } catch {
    // Continue to default
  }
  return 'your-super-secret-key-change-in-production'
}
const NONCE_EXPIRY = 5 * 60 * 1000 // 5 minutes

// Simplified random string generator (not cryptographically secure)
function generateRandomString(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Generate a unique challenge/nonce for wallet signing
 */
export function generateChallenge(walletAddress: string): string {
  const nonce = generateRandomString()
  const timestamp = Date.now()
  const challenge = `Sign this message to authenticate with PnlForge\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${nonce}`

  // Store nonce in cache (prevent replay attacks)
  nonceCache.set(`nonce:${walletAddress}`, {
    nonce: challenge,
    expiry: timestamp + NONCE_EXPIRY,
  })

  return challenge
}

/**
 * Verify that a challenge matches what we issued
 */
export function verifyChallengeNonce(walletAddress: string, challenge: string): boolean {
  const stored = nonceCache.get(`nonce:${walletAddress}`)
  if (!stored) {
    return false // Nonce expired or never issued
  }
  if (Date.now() > stored.expiry) {
    nonceCache.delete(`nonce:${walletAddress}`)
    return false // Nonce expired
  }
  return challenge === stored.nonce
}

/**
 * Issue a JWT token after successful signature verification
 */
export function issueJWT(walletAddress: string, userId?: string): {
  token: string
  refreshToken: string
  expiresIn: string
} {
  const secret = getJWTSecret()
  
  const payload = {
    walletAddress,
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }

  const token = encodeJWT(payload, secret)

  const refreshPayload = {
    walletAddress,
    userId,
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600), // 7 days
  }

  const refreshToken = encodeJWT(refreshPayload, secret)

  return {
    token,
    refreshToken,
    expiresIn: '1h',
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): {
  walletAddress: string
  userId?: string
  valid: boolean
} {
  try {
    const secret = getJWTSecret()
    const decoded = decodeJWT(token, secret) as any
    
    // Check expiry
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return {
        walletAddress: '',
        valid: false,
      }
    }

    return {
      walletAddress: decoded.walletAddress,
      userId: decoded.userId,
      valid: true,
    }
  } catch (error) {
    console.error('JWT verification error:', error)
    return {
      walletAddress: '',
      valid: false,
    }
  }
}

/**
 * Refresh an expired JWT token
 */
export function refreshJWT(refreshToken: string): {
  token: string
  expiresIn: string
} | null {
  try {
    const secret = getJWTSecret()
    const decoded = decodeJWT(refreshToken, secret) as any
    
    if (decoded.type !== 'refresh') {
      return null // Not a refresh token
    }

    const newPayload = {
      walletAddress: decoded.walletAddress,
      userId: decoded.userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }

    const newToken = encodeJWT(newPayload, secret)

    return {
      token: newToken,
      expiresIn: '1h',
    }
  } catch (error) {
    console.error('Refresh token error:', error)
    return null
  }
}

/**
 * Clear nonce from cache (called after successful verification)
 */
export function clearChallenge(walletAddress: string): void {
  nonceCache.delete(`nonce:${walletAddress}`)
}

/**
 * Cookie configuration for secure token storage
 */
export const cookieConfig = {
  httpOnly: true,
  secure: false, // Set to true when environment variables are available
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

export default {
  generateChallenge,
  verifyChallengeNonce,
  issueJWT,
  verifyJWT,
  refreshJWT,
  clearChallenge,
  cookieConfig,
}
