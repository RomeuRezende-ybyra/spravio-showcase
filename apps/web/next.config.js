// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@spravio/types', '@spravio/utils'],
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
})
