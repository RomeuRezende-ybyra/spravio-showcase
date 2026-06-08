const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

export interface GitHubRepo {
  id: number
  full_name: string
  name: string
  private: boolean
  default_branch: string
  html_url: string
  description: string | null
  language: string | null
  updated_at: string
}

export interface GitHubStatus {
  connected: boolean
  githubOrg: string | null
}

async function fetchWithAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  })

  const json = await res.json() as { success: boolean; data: T; error?: { message: string } }
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`)
  }
  return json.data
}

export const githubApi = {
  async listRepos(token: string): Promise<GitHubRepo[]> {
    return fetchWithAuth<GitHubRepo[]>('/github/repos', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  async connectRepo(projectId: string, repoFullName: string, token: string): Promise<void> {
    await fetchWithAuth(`/projects/${projectId}/github/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ repoFullName }),
    })
  },

  async disconnectRepo(projectId: string, token: string): Promise<void> {
    await fetchWithAuth(`/projects/${projectId}/github/disconnect`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  async getStatus(token: string): Promise<GitHubStatus> {
    return fetchWithAuth<GitHubStatus>('/organizations/github/status', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
