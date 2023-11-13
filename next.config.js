/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [{
            protocol: "https", hostname: "res.cloudinary.com",
        },], minimumCacheTTL: 1500000,
    },
};

module.exports = nextConfig;
