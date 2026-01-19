import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Google Cloud Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/masi-website/**',
      },
    ],
  },
};

export default nextConfig;