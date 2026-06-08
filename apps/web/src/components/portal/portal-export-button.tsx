'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export function PortalExportButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5"
      onClick={() => window.print()}
    >
      <FileDown className="h-3.5 w-3.5" />
      Export PDF
    </Button>
  )
}
