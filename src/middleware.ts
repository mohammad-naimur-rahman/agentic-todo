import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/signup']
// API routes are also public
const apiRoutes = ['/api/']
// Static assets that don't need authentication
const staticAssets = ['/_next/', '/favicon.ico', '/images/']

// JWT secret from environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-fallback-secret-key-for-development'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to static assets without authentication
  if (staticAssets.some(asset => pathname.startsWith(asset))) {
    return NextResponse.next()
  }

  // Allow access to public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow access to API routes without authentication check in middleware
  // (API routes will handle their own authentication)
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value

  // If no token is found, redirect to signin page
  if (!token) {
    console.log('No token found, redirecting to signin page')
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, JWT_SECRET)

    // If token is valid, allow access
    if (payload) {
      console.log('Valid token, allowing access')
      return NextResponse.next()
    }

    // If token is invalid, redirect to signin page
    throw new Error('Invalid token')
  } catch (error) {
    console.error('Token verification error:', error)
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    response.cookies.delete('token')
    return response
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all paths except those starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
