'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestProfilePage() {
  const { data: session } = useSession()
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testGetProfile = async () => {
    try {
      setLoading(true)
      setResult('Testing...')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'
      const url = `${API_URL}/users/me`

      setResult(`Calling: ${url}\nToken: ${session?.apiToken ? 'Present' : 'Missing'}\n\n`)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.apiToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(prev => prev + `Status: ${response.status}\n\nResponse:\n${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testUpdateProfile = async () => {
    try {
      setLoading(true)
      setResult('Testing update...')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'
      const url = `${API_URL}/users/me`

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'pt-BR',
        }),
      })

      const data = await response.json()
      setResult(`Status: ${response.status}\n\nResponse:\n${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Profile API</h1>

      <div className="bg-bg-el border border-rule rounded p-4 space-y-2">
        <div><strong>Session:</strong> {session ? 'Logged in' : 'Not logged in'}</div>
        <div><strong>User ID:</strong> {session?.userId || 'N/A'}</div>
        <div><strong>Token:</strong> {session?.apiToken ? 'Present' : 'Missing'}</div>
        <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={testGetProfile}
          disabled={loading || !session}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test GET /users/me
        </button>

        <button
          onClick={testUpdateProfile}
          disabled={loading || !session}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test PUT /users/me
        </button>
      </div>

      {result && (
        <pre className="bg-bg-el-2 border border-rule rounded p-4 text-xs overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </div>
  )
}
