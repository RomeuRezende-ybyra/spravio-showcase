import pLimit from 'p-limit'
import { AppError } from '../../lib/errors.js'

const limit = pLimit(10)
const BASE_URL = 'https://api.clockify.me/api/v1'

function getAuthHeaders(apiKey: string): Record<string, string> {
  return {
    'X-Api-Key': apiKey,
    Accept: 'application/json',
  }
}

async function request<T>(apiKey: string, method: 'GET', path: string): Promise<T> {
  return limit(async () => {
    const url = `${BASE_URL}${path}`
    const headers = getAuthHeaders(apiKey)

    const response = await fetch(url, { method, headers })

    if (response.status === 429) {
      throw new AppError('CLOCKIFY_RATE_LIMIT', 'Clockify rate limit exceeded', 429)
    }

    if (response.status === 401) {
      throw new AppError('CLOCKIFY_UNAUTHORIZED', 'Invalid Clockify API key', 401)
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new AppError(
        'CLOCKIFY_API_ERROR',
        `Clockify API ${method} ${path} failed: ${response.status}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text }
      )
    }

    return response.json() as Promise<T>
  })
}

export function createClockifyClient(apiKey: string) {
  return {
    get<T>(path: string): Promise<T> {
      return request<T>(apiKey, 'GET', path)
    },
  }
}
