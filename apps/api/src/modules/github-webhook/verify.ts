import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verify GitHub webhook signature (HMAC-SHA256)
 * @param payload - Raw request body as Buffer
 * @param signature - X-Hub-Signature-256 header value (sha256=xxx)
 * @param secret - Webhook secret
 */
export function verifyGitHubSignature(
  payload: Buffer,
  signature: string,
  secret: string,
): boolean {
  if (!signature.startsWith('sha256=')) return false

  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  const expectedSig = `sha256=${expected}`

  // Both must be same length for timingSafeEqual
  if (signature.length !== expectedSig.length) return false

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig),
  )
}
