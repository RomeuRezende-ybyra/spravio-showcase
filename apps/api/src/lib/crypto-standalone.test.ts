import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'

// Versão standalone da lógica de criptografia para testes (sem dependência de env.js)
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64

function deriveKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha512')
}

function encrypt(plaintext: string, encryptionKey: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(encryptionKey, salt)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

function decrypt(ciphertext: string, encryptionKey: string): string {
  const parts = ciphertext.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format')
  }

  const [saltB64, ivB64, authTagB64, encryptedB64] = parts

  const salt = Buffer.from(saltB64, 'base64')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')

  const key = deriveKey(encryptionKey, salt)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

function isEncrypted(value: string): boolean {
  if (!value) return false
  const parts = value.split(':')
  return parts.length === 4 && parts.every((part) => part.length > 0)
}

describe('Crypto (Standalone)', () => {
  const testKey = 'test-encryption-key-64-bytes-base64-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa='

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt correctly', () => {
      const plaintext = 'my-super-secret-api-token-12345'
      const encrypted = encrypt(plaintext, testKey)
      const decrypted = decrypt(encrypted, testKey)

      expect(decrypted).toBe(plaintext)
      expect(encrypted).not.toBe(plaintext)
    })

    it('should generate different ciphertext for same plaintext', () => {
      const plaintext = 'same-secret'
      const encrypted1 = encrypt(plaintext, testKey)
      const encrypted2 = encrypt(plaintext, testKey)

      expect(encrypted1).not.toBe(encrypted2)
      expect(decrypt(encrypted1, testKey)).toBe(plaintext)
      expect(decrypt(encrypted2, testKey)).toBe(plaintext)
    })

    it('should handle special characters', () => {
      const plaintext = 'token!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
      const encrypted = encrypt(plaintext, testKey)
      const decrypted = decrypt(encrypted, testKey)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle unicode characters', () => {
      const plaintext = 'token-with-emoji-🔐-and-português-字符'
      const encrypted = encrypt(plaintext, testKey)
      const decrypted = decrypt(encrypted, testKey)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(10000)
      const encrypted = encrypt(plaintext, testKey)
      const decrypted = decrypt(encrypted, testKey)

      expect(decrypted).toBe(plaintext)
    })

    it('should throw on invalid format', () => {
      expect(() => decrypt('invalid-format', testKey)).toThrow('Invalid encrypted format')
      expect(() => decrypt('one:two:three', testKey)).toThrow('Invalid encrypted format')
    })

    it('should throw on tampered data', () => {
      const encrypted = encrypt('original-value', testKey)
      const parts = encrypted.split(':')
      // Tamper with encrypted data
      parts[3] = Buffer.from('tampered').toString('base64')
      const tampered = parts.join(':')

      expect(() => decrypt(tampered, testKey)).toThrow()
    })

    it('should throw on tampered auth tag', () => {
      const encrypted = encrypt('original-value', testKey)
      const parts = encrypted.split(':')
      // Tamper with auth tag
      parts[2] = Buffer.from('0'.repeat(16)).toString('base64')
      const tampered = parts.join(':')

      expect(() => decrypt(tampered, testKey)).toThrow()
    })
  })

  describe('isEncrypted', () => {
    it('should detect encrypted values', () => {
      const encrypted = encrypt('test-value', testKey)
      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('should return false for plaintext', () => {
      expect(isEncrypted('plaintext-value')).toBe(false)
      expect(isEncrypted('one:two:three')).toBe(false)
      expect(isEncrypted('one:two')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false)
    })

    it('should detect valid format with 4 parts', () => {
      const validFormat = 'part1:part2:part3:part4'
      expect(isEncrypted(validFormat)).toBe(true)
    })

    it('should reject empty parts', () => {
      const invalidFormat = 'part1::part3:part4'
      expect(isEncrypted(invalidFormat)).toBe(false)
    })
  })
})
