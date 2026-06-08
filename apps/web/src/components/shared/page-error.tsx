'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export function PageError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bad/10 border-2 border-bad/20">
            <AlertTriangle className="h-8 w-8 text-bad" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
        <p className="text-sm text-ink-3 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/portfolio'}
            className="px-6 py-2 border border-rule rounded-sv hover:bg-bg-el-2 transition-colors text-sm font-medium text-ink flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <div className="mt-6 bg-bg-el border border-rule rounded-sv p-4 text-left">
            <p className="text-xs font-semibold text-ink mb-2">Stack Trace (dev only):</p>
            <pre className="text-xs text-ink-3 overflow-auto max-h-40 font-mono">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
