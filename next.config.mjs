/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration pour éviter les problèmes de watch sur Windows/OneDrive
  // Note: webpackDevMiddleware n'existe plus dans Next.js 15, on utilise webpack directement
  
  // Configuration pour éviter les erreurs EINVAL sur Windows/OneDrive
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimisations de performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-slot",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "framer-motion",
      "recharts",
    ],
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Désactiver outputFileTracing pour éviter les erreurs EINVAL sur OneDrive/Windows
  // Note: Dans Next.js 15, outputFileTracingExcludes est au niveau racine, pas dans experimental
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc',
      'node_modules/webpack',
      'node_modules/.cache',
    ],
  },
  outputFileTracingIncludes: {},
  // Compression
  compress: true,
  // Headers de sécurité et performance
  async headers() {
    // CSP strict pour la protection XSS
    // En développement, autoriser localhost pour l'API backend
    const isDev = process.env.NODE_ENV === 'development'
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    
    // Récupérer l'URL de l'API depuis les variables d'environnement
    // En production, cela devrait être configuré dans Vercel ou votre plateforme d'hébergement
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const apiUrlEnv = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    
    // Extraire le domaine de l'URL de l'API pour la CSP
    let apiDomain = 'http://localhost:3001'
    try {
      const apiUrlObj = new URL(apiUrlEnv)
      apiDomain = `${apiUrlObj.protocol}//${apiUrlObj.host}`
    } catch (e) {
      // Si l'URL n'est pas valide, utiliser la valeur par défaut
      console.warn('⚠️ URL API invalide pour CSP, utilisation de localhost:', apiUrlEnv)
    }
    
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://static.cloudflareinsights.com", // Autoriser Vercel Analytics + Cloudflare Insights
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      `connect-src 'self' ${apiDomain} ${apiUrl} http://localhost:3001 https://api.openai.com https://va.vercel-scripts.com https://static.cloudflareinsights.com`, // API backend + OpenAI + Vercel Analytics + Cloudflare Insights
      "media-src 'self' blob: data:", // Pour les enregistrements audio/vidéo
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]), // Désactiver en dev pour localhost
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Plus strict que SAMEORIGIN
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), microphone=(self), camera=(self)'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Configuration pour éviter les problèmes de watch sur Windows/OneDrive
    // Toujours désactiver les liens symboliques (problème OneDrive)
    if (!config.resolve) {
      config.resolve = {}
    }
    config.resolve.symlinks = false
    
    // Améliorer la résolution des modules pour éviter les erreurs
    if (!config.resolve.fallback) {
      config.resolve.fallback = {}
    }
    
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/OneDrive/**', // Ignorer OneDrive pour éviter les problèmes de liens symboliques
        ],
        poll: 1000, // Polling pour éviter les problèmes de watch sur Windows/OneDrive
        aggregateTimeout: 300, // Délai avant de déclencher le rebuild
        followSymlinks: false, // Désactiver le suivi des liens symboliques (problème OneDrive)
      }
    }
    
    // Configuration simplifiée pour éviter les erreurs avec Next.js 15
    // Ne pas surcharger la configuration d'optimisation par défaut de Next.js
    if (!isServer && dev) {
      // En développement, garder la configuration par défaut de Next.js
      // qui est optimisée pour le hot-reload
    }
    
    return config
  },
}

export default nextConfig