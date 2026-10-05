/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Allow server-side Node.js packages used in Route Handlers
  serverExternalPackages: ['pdf-parse', '@prisma/client'],
  experimental: {
    // Required for streaming and large file handling
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
}

export default nextConfig
