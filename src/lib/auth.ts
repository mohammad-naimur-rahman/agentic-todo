import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// JWT secret from environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-fallback-secret-key-for-development'

// Interface for JWT payload
export interface JwtPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

/**
 * Generate a JWT token
 */
export const generateToken = (payload: {
  userId: string
  email: string
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verify a JWT token
 */
export const verifyJwtToken = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Set token in cookies
 */
export const setTokenCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict'
  })
}

/**
 * Remove token from cookies
 */
export const removeTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

/**
 * Get current user from token in cookies
 */
export const getCurrentUser = async (): Promise<JwtPayload | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return null
  }

  return verifyJwtToken(token)
}

/**
 * Check if user is authenticated
 */
export const needAuth = async (): Promise<{
  success: boolean
  userId: string
  email: string
  error: string
}> => {
  let userData: { userId: string; email: string } | null = null
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) {
    return { success: false, error: 'Unauthorized', userId: '', email: '' }
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET!
    jwt.verify(token.value, JWT_SECRET)
    // Extract user data from token
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: string
      email: string
    }
    userData = decoded
  } catch (error) {
    return { success: false, error: 'Invalid token', userId: '', email: '' }
  }

  return { success: true, ...userData, error: '' }
}
