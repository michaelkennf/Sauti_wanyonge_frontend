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
    // Désactiver outputFileTracing pour éviter les erreurs EINVAL sur OneDrive/Windows
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc',
        'node_modules/webpack',
        'node_modules/.cache',
      ],
    },
  },
  
  // Désactiver les liens symboliques pour éviter les problèmes OneDrive sur Windows
  outputFileTracingIncludes: {},
  // Compression
  compress: true,
  // Headers de sécurité et performance
  async headers() {
    // CSP strict pour la protection XSS
    // En développement, autoriser localhost pour l'API backend
    const isDev = process.env.NODE_ENV === 'development'
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval nécessaire pour Next.js en dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      `connect-src 'self' ${apiUrl} http://localhost:3001 https://api.openai.com https://va.vercel-scripts.com`, // API backend + OpenAI + Vercel Analytics
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
    
    // Optimiser les chunks - Configuration avancée pour haute performance
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000, // 20KB minimum
          maxSize: 244000, // 244KB maximum (pour HTTP/2)
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              reuseExistingChunk: true,
              chunks: 'all',
            },
            // Séparer les grandes librairies
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
              name: 'react',
              priority: 20,
              chunks: 'all',
            },
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'ui',
              priority: 15,
              chunks: 'all',
            },
            charts: {
              test: /[\\/]node_modules[\\/](recharts|chart\.js)[\\/]/,
              name: 'charts',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
}

export default nextConfig