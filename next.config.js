/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ototrading.com',
        port: '',
        pathname: '/image/**',
      },
    ],
  },
};

module.exports = nextConfig;
