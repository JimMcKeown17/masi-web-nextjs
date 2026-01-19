import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Fix workspace root detection for pnpm workspace
  outputFileTracingRoot: path.join(__dirname, '../../'),

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