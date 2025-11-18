import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware pour optimiser les performances
 * - Compression
 * - Cache headers
 * - Prefetch optimization
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de performance
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Cache pour les assets statiques
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache pour les images
  if (request.nextUrl.pathname.startsWith('/images') || 
      request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

