/**** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.api.playstation.com',
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  }
};

module.exports = nextConfig;
