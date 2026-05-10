/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Disable webpack cache to prevent 32-bit memory crashes
  webpack: (config) => {
    config.cache = false;
    return config;
  },
}

module.exports = nextConfig
