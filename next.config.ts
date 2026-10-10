import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /*
    Every route on this site is prerendered from files in content/. With
    Cache Components on, reading those files would count as request-time
    data and need 'use cache' or Suspense everywhere; off, static is the
    default again and nothing can silently become dynamic. See DECISIONS.md.
  */
  cacheComponents: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
