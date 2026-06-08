import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const session = await getSession()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (session?.apiToken) {
      headers['Authorization'] = `Bearer ${session.apiToken}`
    }

    return headers
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }
}

export const api = new ApiClient()
