import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence workspace root warning (we have a pnpm workspace structure)
  outputFileTracingRoot: path.join(__dirname, "../../"),

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