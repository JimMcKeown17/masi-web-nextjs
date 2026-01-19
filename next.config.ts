import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Fix workspace root detection for pnpm workspace
  // In the separate frontend repo, workspace root is one level up (frontend/)
  outputFileTracingRoot: path.join(__dirname, '../'),

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