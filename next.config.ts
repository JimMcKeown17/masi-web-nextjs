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

  // SEO: Redirects for URL changes and canonical domain
  async redirects() {
    return [
      // Canonical domain: force www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'masinyusane.org',
          },
        ],
        destination: 'https://www.masinyusane.org/:path*',
        permanent: true,
      },
      // URL structure changes from Django → Next.js
      {
        source: '/children',
        destination: '/programs/early-childhood-education',
        permanent: true,
      },
      {
        source: '/children/',
        destination: '/programs/early-childhood-education',
        permanent: true,
      },
      {
        source: '/youth',
        destination: '/programs/community-jobs',
        permanent: true,
      },
      {
        source: '/youth/',
        destination: '/programs/community-jobs',
        permanent: true,
      },
      {
        source: '/top-learner',
        destination: '/programs/top-learners',
        permanent: true,
      },
      {
        source: '/top-learner/',
        destination: '/programs/top-learners',
        permanent: true,
      },
      {
        source: '/data',
        destination: '/impact/data-portal',
        permanent: true,
      },
      {
        source: '/data/',
        destination: '/impact/data-portal',
        permanent: true,
      },
      {
        source: '/where',
        destination: '/about/where-we-work',
        permanent: true,
      },
      {
        source: '/where/',
        destination: '/about/where-we-work',
        permanent: true,
      },
      {
        source: '/apply',
        destination: '/about/apply',
        permanent: true,
      },
      {
        source: '/apply/',
        destination: '/about/apply',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/about/our-team',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/about/our-team',
        permanent: true,
      },
      {
        source: '/impact',
        destination: '/impact/reports',
        permanent: true,
      },
      {
        source: '/impact/',
        destination: '/impact/reports',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;