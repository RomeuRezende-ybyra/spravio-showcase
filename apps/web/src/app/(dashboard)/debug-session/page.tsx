'use client'

import { useSession } from 'next-auth/react'

export default function DebugSessionPage() {
  const { data: session, status } = useSession()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Debug Session</h1>

      <div className="bg-bg-el border border-rule rounded p-4 space-y-2">
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</div>
      </div>

      {session && (
        <div className="bg-bg-el border border-rule rounded p-4">
          <h2 className="font-bold mb-2">Session Data:</h2>
          <pre className="text-xs overflow-auto max-h-96 bg-bg-el-2 p-4 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-bg-el border border-rule rounded p-4">
        <h2 className="font-bold mb-2">Environment:</h2>
        <div><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'}</div>
      </div>
    </div>
  )
}
