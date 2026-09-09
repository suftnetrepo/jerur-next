const isLowMemoryBuild = process.env.SENTRY_SKIP_UPLOAD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Moved out of experimental (Next.js 15)
  serverExternalPackages: ['mongoose', 'mongodb', 'mjml', 'bunyan'],

  experimental: {
    // This application still has a small custom webpack hook, which prevents
    // Next from enabling its lower-memory build worker automatically.
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
    serverSourceMaps: !isLowMemoryBuild
  },

  productionBrowserSourceMaps: false,
  enablePrerenderSourceMaps: !isLowMemoryBuild,

  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'jerur-next-production.onrender.com' },
      { protocol: 'https', hostname: 'jerur-next.onrender.com' }
    ],
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

// Sentry's webpack wrapper creates and processes source maps even when upload
// is disabled. Skip the build plugin on memory-constrained Render builds;
// runtime instrumentation remains active via instrumentation-client/server.
if (isLowMemoryBuild) {
  module.exports = nextConfig;
} else try {
  const { withSentryConfig } = require('@sentry/nextjs/config');
  module.exports = withSentryConfig(nextConfig, {
    org: 'suftnetcom',
    project: 'snatchi',
    silent: !process.env.CI,
    // Upload the normal set of source maps. Widening this set substantially
    // increases webpack memory and build time without affecting runtime error
    // reporting for application-owned chunks.
    widenClientFileUpload: false,
    sourcemaps: {
      // Useful for offline/local release verification. Production keeps
      // source-map uploads enabled unless this flag is explicitly set.
      disable: process.env.SENTRY_SKIP_UPLOAD === '1'
    },
    webpack: {
      unstable_sentryWebpackPluginOptions: {
        disable: process.env.SENTRY_SKIP_UPLOAD === '1'
      },
      treeshake: {
        removeDebugLogging: true
      },
      automaticVercelMonitors: true
    }
  });
} catch (error) {
  console.warn('⚠️ Sentry is not installed. Skipping Sentry configuration.');
  module.exports = nextConfig;
}
