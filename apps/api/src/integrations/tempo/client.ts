import pLimit from 'p-limit'
import { AppError } from '../../lib/errors.js'

const limit = pLimit(10)
const BASE_URL = 'https://api.tempo.io/4'

function getAuthHeaders(apiToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiToken}`,
    Accept: 'application/json',
  }
}

async function request<T>(apiToken: string, method: 'GET', path: string): Promise<T> {
  return limit(async () => {
    const url = `${BASE_URL}${path}`
    const headers = getAuthHeaders(apiToken)

    const response = await fetch(url, { method, headers })

    if (response.status === 429) {
      throw new AppError('TEMPO_RATE_LIMIT', 'Tempo rate limit exceeded', 429)
    }

    if (response.status === 401) {
      throw new AppError('TEMPO_UNAUTHORIZED', 'Invalid Tempo API token', 401)
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new AppError(
        'TEMPO_API_ERROR',
        `Tempo API ${method} ${path} failed: ${response.status}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text }
      )
    }

    return response.json() as Promise<T>
  })
}

export function createTempoClient(apiToken: string) {
  return {
    get<T>(path: string): Promise<T> {
      return request<T>(apiToken, 'GET', path)
    },
  }
}
