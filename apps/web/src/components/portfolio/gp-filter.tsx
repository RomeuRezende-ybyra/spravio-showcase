'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface GPFilterProps {
  gpList: Array<{ userId: string; name: string }>
}

export function GPFilter({ gpList }: GPFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentGP = searchParams.get('gp') ?? ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set('gp', e.target.value)
      } else {
        params.delete('gp')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <select
      value={currentGP}
      onChange={handleChange}
      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
    >
      <option value="">All GPs</option>
      {gpList.map((gp) => (
        <option key={gp.userId} value={gp.userId}>
          {gp.name}
        </option>
      ))}
    </select>
  )
}
