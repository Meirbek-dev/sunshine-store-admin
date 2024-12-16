/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Helps identify potential issues in React
  poweredByHeader: false, // Removes the "X-Powered-By: Next.js" header for security
  trailingSlash: false, // Adds or removes a trailing slash to routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    minimumCacheTTL: 1500000
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
      ],
    },
  ],
};

export default nextConfig;
