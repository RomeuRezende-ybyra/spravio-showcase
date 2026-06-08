// ──────────────────────────────────────────────────────────────────────────────
// Spravio — Enhanced Helmet Configuration with HSTS
// Cole este código em apps/api/src/plugins/helmet.ts
// ──────────────────────────────────────────────────────────────────────────────

import helmet from '@fastify/helmet'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remover unsafe-inline e usar nonces
        styleSrc: ["'self'", "'unsafe-inline'"],  // TODO: Remover unsafe-inline e usar nonces
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://api.spravio.io'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // ✨ NOVO: HSTS - Force HTTPS
    hsts: env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 ano em segundos
      includeSubDomains: true,
      preload: true, // Permite inclusão na lista de HSTS preload do navegador
    } : false,

    // ✨ NOVO: Prevenir MIME sniffing
    noSniff: true,

    // ✨ NOVO: Prevenir clickjacking
    frameguard: {
      action: 'deny',
    },

    // ✨ NOVO: Remover header X-Powered-By
    hidePoweredBy: true,

    // ✨ NOVO: Prevenir XSS refletido
    xssFilter: true,
  })

  fastify.log.info(
    {
      csp: env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
      hsts: env.NODE_ENV === 'production' ? 'enabled (1 year)' : 'disabled',
      xssFilter: 'enabled',
      frameguard: 'deny',
    },
    'Helmet security headers configured'
  )
})
