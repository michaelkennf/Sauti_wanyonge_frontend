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
      "@radix-ui/react-slot", // Réactivé - composant critique pour Button
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "framer-motion",
      "recharts",
    ],
    optimizeCss: true, // Critters installé
  },
  // Compression
  compress: true,
  // Headers de performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
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
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
        poll: 1000, // Polling pour éviter les problèmes de watch sur Windows/OneDrive
      }
    }
    
    // Optimiser les chunks - Simplifié pour éviter les problèmes de résolution
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
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
            },
          },
        },
      }
    }
    
    // Résoudre les problèmes de résolution de module
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
      },
      fallback: {
        ...config.resolve.fallback,
      },
    }
    return config
  },
}

export default nextConfig