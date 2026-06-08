import { Card } from '@/components/ui/card'
import { Github } from 'lucide-react'

export function GithubPlaceholder({ message = 'GitHub not connected' }: { message?: string }) {
  return (
    <Card className="flex items-center gap-3 border-dashed p-4 text-gray-400">
      <Github className="h-5 w-5" />
      <span className="text-sm">{message}</span>
    </Card>
  )
}
