import crypto from 'node:crypto'
import { env } from '../config/env.js'

// Algoritmo de criptografia (AES-256-GCM - autenticado)
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // Initialization Vector
const SALT_LENGTH = 64

/**
 * Deriva uma chave de criptografia a partir do secret usando PBKDF2
 * Torna brute-force muito mais difícil com 100k iterações
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    secret,
    salt,
    100000, // 100k iterações (recomendado OWASP)
    32,     // 32 bytes = 256 bits
    'sha512'
  )
}

/**
 * Encripta um valor usando AES-256-GCM
 * Formato de saída: salt:iv:authTag:encryptedData (tudo em base64)
 *
 * @param plaintext - Texto a ser criptografado
 * @returns String criptografada no formato salt:iv:authTag:encryptedData
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string')
  }

  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(env.ENCRYPTION_KEY, salt)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  // Formato: salt:iv:authTag:encryptedData
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Decripta um valor criptografado com encrypt()
 * Suporta rotação de chaves: tenta nova chave primeiro, depois antiga
 *
 * @param ciphertext - String criptografada no formato salt:iv:authTag:encryptedData
 * @returns Texto descriptografado
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Cannot decrypt empty string')
  }

  // Try with current key first
  try {
    return decryptWithKey(ciphertext, env.ENCRYPTION_KEY)
  } catch (error) {
    // If failed and old key exists, try old key (for rotation support)
    if (env.ENCRYPTION_KEY_OLD) {
      try {
        return decryptWithKey(ciphertext, env.ENCRYPTION_KEY_OLD)
      } catch {
        throw new Error('Failed to decrypt with both current and old encryption keys')
      }
    }
    throw error
  }
}

/**
 * Decripta com uma chave específica (helper interno)
 */
function decryptWithKey(ciphertext: string, encryptionKey: string): string {
  const parts = ciphertext.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format - expected 4 parts (salt:iv:authTag:data)')
  }

  const saltB64 = parts[0]!
  const ivB64 = parts[1]!
  const authTagB64 = parts[2]!
  const encryptedB64 = parts[3]!

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

/**
 * Verifica se um valor está no formato criptografado
 *
 * @param value - String a verificar
 * @returns true se está criptografado, false caso contrário
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false
  const parts = value.split(':')
  return parts.length === 4 && parts.every((part) => part.length > 0)
}
