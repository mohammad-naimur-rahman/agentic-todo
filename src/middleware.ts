import { NextRequest, NextResponse } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/signup']
// API routes are also public
const apiRoutes = ['/api/']
// Static assets that don't need authentication
const staticAssets = ['/_next/', '/favicon.ico', '/images/']

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
    console.error('No token found, redirecting to signin page')
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Simple token validation - check if it's a valid JWT format
  // This is a basic check that doesn't verify the signature but ensures it's a properly formatted JWT
  const parts = token.split('.')
  if (parts.length !== 3) {
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    response.cookies.delete('token')
    console.error('Invalid token, redirecting to signin page')
    return response
  }

  // Allow access if token format is valid
  // The actual verification will happen in the client-side components
  return NextResponse.next()
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
