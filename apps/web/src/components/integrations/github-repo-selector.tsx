'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import type { GitHubRepo } from '@/lib/api/github'
import { githubApi } from '@/lib/api/github'

interface GitHubRepoSelectorProps {
  projectId: string
  currentRepo: string | null
  onConnect: (repoFullName: string) => void
  onDisconnect: () => void
}

export function GitHubRepoSelector({
  projectId,
  currentRepo,
  onConnect,
  onDisconnect,
}: GitHubRepoSelectorProps) {
  const { data: session } = useSession()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (isOpen && repos.length === 0 && session?.apiToken) {
      loadRepos()
    }
  }, [isOpen, session?.apiToken])

  const loadRepos = async () => {
    if (!session?.apiToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await githubApi.listRepos(session.apiToken)
      setRepos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repos')
    } finally {
      setLoading(false)
    }
  }

  const filteredRepos = useMemo(() => {
    if (!search) return repos
    const lower = search.toLowerCase()
    return repos.filter(
      (r) =>
        r.full_name.toLowerCase().includes(lower) ||
        r.description?.toLowerCase().includes(lower)
    )
  }, [repos, search])

  const handleConnect = async (repoFullName: string) => {
    if (!session?.apiToken) return
    setConnecting(true)
    try {
      await githubApi.connectRepo(projectId, repoFullName, session.apiToken)
      onConnect(repoFullName)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repo')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!session?.apiToken) return
    setConnecting(true)
    try {
      await githubApi.disconnectRepo(projectId, session.apiToken)
      onDisconnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect repo')
    } finally {
      setConnecting(false)
    }
  }

  if (currentRepo) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900 font-mono">{currentRepo}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={connecting}
        >
          {connecting ? '...' : 'Unlink'}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        Select Repository
      </Button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repos..."
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading && (
              <p className="text-sm text-gray-500 p-3">Loading repositories...</p>
            )}

            {error && (
              <p className="text-sm text-red-600 p-3">{error}</p>
            )}

            {!loading && !error && filteredRepos.length === 0 && (
              <p className="text-sm text-gray-400 p-3">No repositories found</p>
            )}

            {filteredRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleConnect(repo.full_name)}
                disabled={connecting}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {repo.full_name}
                  </span>
                  {repo.private && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                      private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-0.5">
                  {repo.language && (
                    <span className="text-[10px] text-gray-400">{repo.language}</span>
                  )}
                  <span className="text-[10px] text-gray-400">{repo.default_branch}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
