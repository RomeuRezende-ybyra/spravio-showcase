import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { PortalExportButton } from '@/components/portal/portal-export-button'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

interface PortalData {
  projectName: string
  jiraProjectKey: string | null
  lastSyncAt: string | null
  currentSprint: {
    sprint: {
      name: string
      startDate: string | null
      endDate: string | null
      totalPoints: number
      completedPoints: number
    }
    totalCards: number
    completedCards: number
    remainingCards: number
    completionPercentage: number
    totalPoints: number
    burndown: Array<{
      date: string
      baselinePoints: number
      actualPoints: number
      completedPoints: number
    }>
  } | null
  overallProgress: number
  progressByStatus: {
    done: number
    uat: number
    test: number
    inProgress: number
    todo: number
  }
  teamDeliveryRate: number
}

async function getPortalData(token: string): Promise<PortalData | null> {
  try {
    const res = await fetch(`${API_URL}/portal/${token}`, { cache: 'no-store' })
    const json = await res.json()
    if (!json.success) return null
    return json.data
  } catch {
    return null
  }
}

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await getPortalData(token)

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-lg font-bold text-gray-900">Invalid or Expired Link</h1>
          <p className="mt-2 text-sm text-gray-500">
            This portal link is no longer valid. Please request a new one from your project manager.
          </p>
        </Card>
      </div>
    )
  }

  const { currentSprint, progressByStatus } = data
  const sprint = currentSprint?.sprint
  const totalStatusCards = progressByStatus.done + progressByStatus.uat +
    progressByStatus.test + progressByStatus.inProgress + progressByStatus.todo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-7 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{data.projectName}</h1>
              <p className="text-xs text-gray-500">{data.jiraProjectKey ?? 'Project'} — Client Portal</p>
            </div>
          </div>
          <PortalExportButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-7">
        <div className="flex flex-col gap-5">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-t-[3px] border-t-teal-500 p-4">
              <p className="text-xs font-medium text-gray-500">Progress</p>
              <p className="mt-1 text-2xl font-bold font-mono text-teal-600">{data.overallProgress}%</p>
            </Card>
            <Card className="border-t-[3px] border-t-green-500 p-4">
              <p className="text-xs font-medium text-gray-500">Cards Done</p>
              <p className="mt-1 text-2xl font-bold font-mono text-green-600">
                {currentSprint?.completedCards ?? 0}/{currentSprint?.totalCards ?? 0}
              </p>
            </Card>
            <Card className="border-t-[3px] border-t-blue-500 p-4">
              <p className="text-xs font-medium text-gray-500">Team Delivery</p>
              <p className="mt-1 text-2xl font-bold font-mono text-blue-600">{data.teamDeliveryRate}%</p>
            </Card>
            <Card className="border-t-[3px] border-t-purple-500 p-4">
              <p className="text-xs font-medium text-gray-500">Last Sync</p>
              <p className="mt-1 text-sm font-medium text-purple-600">
                {data.lastSyncAt ? new Date(data.lastSyncAt).toLocaleDateString() : 'Never'}
              </p>
            </Card>
          </div>

          {/* Sprint info */}
          {sprint && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">{sprint.name}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {sprint.startDate && <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>}
                {sprint.endDate && <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>}
                <Badge variant="default">{currentSprint.completionPercentage}% complete</Badge>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${currentSprint.completionPercentage}%` }}
                />
              </div>
            </Card>
          )}

          {/* Progress by status */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Progress by Status</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Done', count: progressByStatus.done, color: 'bg-green-500' },
                { label: 'UAT', count: progressByStatus.uat, color: 'bg-teal-500' },
                { label: 'Test', count: progressByStatus.test, color: 'bg-blue-500' },
                { label: 'In Progress', count: progressByStatus.inProgress, color: 'bg-amber-500' },
                { label: 'To Do', count: progressByStatus.todo, color: 'bg-gray-300' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-600">{s.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color}`}
                      style={{ width: totalStatusCards > 0 ? `${(s.count / totalStatusCards) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-gray-500">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Burndown table */}
          {currentSprint && currentSprint.burndown.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Burndown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 text-left font-semibold text-gray-400 uppercase">Date</th>
                      <th className="pb-2 text-left font-semibold text-gray-400 uppercase">Baseline</th>
                      <th className="pb-2 text-left font-semibold text-gray-400 uppercase">Actual</th>
                      <th className="pb-2 text-left font-semibold text-gray-400 uppercase">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSprint.burndown.map((bp) => (
                      <tr key={bp.date} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{bp.date}</td>
                        <td className="py-2 text-gray-500">{bp.baselinePoints}</td>
                        <td className="py-2 text-gray-500">{bp.actualPoints}</td>
                        <td className="py-2 text-gray-500">{bp.completedPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-gray-400">
          Powered by Spravio
        </div>
      </main>
    </div>
  )
}
