import { encrypt, decrypt, isEncrypted } from './crypto.js'

/**
 * Salva um token de forma segura (criptografado)
 * Use este helper ao SALVAR tokens no banco de dados
 *
 * @param plainToken - Token em texto plano
 * @returns Token criptografado (ou null se input for null/undefined)
 */
export function secureToken(plainToken: string | null | undefined): string | null {
  if (!plainToken) return null
  try {
    return encrypt(plainToken)
  } catch (error) {
    console.error('Error encrypting token:', error)
    throw new Error('Failed to encrypt token', { cause: error })
  }
}

/**
 * Lê um token de forma segura (decriptografa se necessário)
 * Use este helper ao LER tokens do banco de dados
 *
 * @param encryptedToken - Token criptografado (ou plaintext para retrocompatibilidade)
 * @returns Token em texto plano (ou null se input for null/undefined)
 */
export function readToken(encryptedToken: string | null | undefined): string | null {
  if (!encryptedToken) return null

  try {
    // Se já está criptografado, decripta
    if (isEncrypted(encryptedToken)) {
      return decrypt(encryptedToken)
    }

    // Se não está criptografado (legacy/dev), retorna como está
    // Isso permite migração gradual e compatibilidade com dev
    return encryptedToken
  } catch (error) {
    console.error('Error decrypting token:', error)
    // Em caso de erro, retornar null é mais seguro que expor dados corrompidos
    return null
  }
}

/**
 * Salva múltiplos tokens de forma segura
 * Útil para objetos com vários tokens
 *
 * @param tokens - Objeto com tokens em texto plano
 * @returns Objeto com tokens criptografados
 */
export function secureTokens<T extends Record<string, string | null | undefined>>(
  tokens: T
): T {
  const secured = {} as T
  for (const [key, value] of Object.entries(tokens)) {
    secured[key as keyof T] = secureToken(value) as T[keyof T]
  }
  return secured
}

/**
 * Lê múltiplos tokens de forma segura
 * Útil para objetos com vários tokens
 *
 * @param tokens - Objeto com tokens criptografados
 * @returns Objeto com tokens em texto plano
 */
export function readTokens<T extends Record<string, string | null | undefined>>(
  tokens: T
): T {
  const decrypted = {} as T
  for (const [key, value] of Object.entries(tokens)) {
    decrypted[key as keyof T] = readToken(value) as T[keyof T]
  }
  return decrypted
}
