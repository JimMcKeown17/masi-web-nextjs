import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/masi-website/**', // Replace with your actual bucket name
      },
    ],
  },
};

export default nextConfig;