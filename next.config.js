/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Moved out of experimental (Next.js 15)
  serverExternalPackages: ['mongoose', 'mongodb', 'mjml', 'bunyan'],

  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: false,
  images: {
    domains: ['jerur-next-production.onrender.com', 'jerur-next.onrender.com'],
    formats: ['image/avif', 'image/webp']
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, DELETE, PATCH, POST, PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      }
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'source-map-support': false,
        'dtrace-provider': false,
      };
    }

    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('source-map-support', 'dtrace-provider');
    }

    config.module.exprContextCritical = false;

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Deprecation/,
    ];

    return config;
  }
};

// Conditionally add Sentry if installed
try {
  const { withSentryConfig } = require('@sentry/nextjs');
  module.exports = withSentryConfig(nextConfig, {
    org: 'suftnetcom',
    project: 'snatchi',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true
  });
} catch (error) {
  console.warn('⚠️ Sentry is not installed. Skipping Sentry configuration.');
  module.exports = nextConfig;
}