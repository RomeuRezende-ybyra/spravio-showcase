import helmet from '@fastify/helmet'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        // ✅ Removed unsafe-inline - API doesn't serve HTML/scripts directly
        // This is a JSON API, so we only allow self-hosted scripts
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://api.spravio.io'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    } : false, // Disabled in dev for easier debugging
    crossOriginEmbedderPolicy: false, // Can cause issues with some integrations
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // HSTS - Force HTTPS (production only)
    hsts: env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true, // Allow inclusion in browser HSTS preload list
    } : false,

    // Prevent MIME type sniffing
    noSniff: true,

    // Prevent clickjacking
    frameguard: {
      action: 'deny',
    },

    // Remove X-Powered-By header
    hidePoweredBy: true,
  })

  fastify.log.info(
    {
      csp: env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
      hsts: env.NODE_ENV === 'production' ? 'enabled (1 year)' : 'disabled',
      xssFilter: 'enabled',
      frameguard: 'deny',
      noSniff: 'enabled',
    },
    'Helmet security headers configured'
  )
})
