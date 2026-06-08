'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

interface ExportPdfButtonProps {
  projectId: string
}

export function ExportPdfButton({ projectId }: ExportPdfButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5"
      onClick={() => {
        window.open(`${API_URL}/projects/${projectId}/report.pdf`, '_blank')
      }}
    >
      <FileDown className="h-3.5 w-3.5" />
      Export PDF
    </Button>
  )
}
