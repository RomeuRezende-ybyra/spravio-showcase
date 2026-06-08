import pLimit from 'p-limit'
import { env } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'

// Azure DevOps: 200 req/min ≈ ~3.3 req/sec — use concurrency 5 to stay safe
const limit = pLimit(5)

function getAuthHeaders(): Record<string, string> {
  if (!env.AZURE_PAT) {
    throw new AppError(
      'AZURE_NOT_CONFIGURED',
      'Azure DevOps credentials are not configured. Set AZURE_PAT.',
      503,
    )
  }

  // Azure PAT auth: Basic base64(":PAT") — note the colon prefix
  const token = Buffer.from(`:${env.AZURE_PAT}`).toString('base64')

  return {
    'Authorization': `Basic ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

function buildUrl(path: string): string {
  const org = env.AZURE_ORG
  if (!org) {
    throw new AppError('AZURE_NOT_CONFIGURED', 'Azure DevOps org is not configured. Set AZURE_ORG.', 503)
  }

  const base = env.AZURE_BASE_URL?.replace(/\/+$/, '') ?? `https://dev.azure.com/${org}`
  return `${base}${path}`
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  return limit(async () => {
    // Append api-version if not already in the path
    const separator = path.includes('?') ? '&' : '?'
    const url = buildUrl(`${path}${path.includes('api-version') ? '' : `${separator}api-version=7.1`}`)
    const headers = getAuthHeaders()

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      throw new AppError(
        'AZURE_RATE_LIMIT',
        `Azure DevOps rate limit exceeded. Retry after ${retryAfter ?? 'unknown'} seconds.`,
        429,
      )
    }

    if (!response.ok) {
      const text = await response.text().catch(() => 'No response body')
      throw new AppError(
        'AZURE_API_ERROR',
        `Azure DevOps API ${method} ${path} failed: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text },
      )
    }

    return response.json() as Promise<T>
  })
}

export const azureClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },
}
