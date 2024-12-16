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
    minimumCacheTTL: 1500000,
    formats: ['image/avif', 'image/webp'], // Use modern image formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Device breakpoints for image resizing
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Custom image sizes
  },
  typescript: {
    ignoreBuildErrors: false, // It's better to address TypeScript errors instead of ignoring them
  },
  eslint: {
    ignoreDuringBuilds: false, // Encourages addressing lint issues during the build
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
