import type { SlackAlertType } from '@spravio/types'

export interface SlackAlertJob {
  projectId: string
  alertType: SlackAlertType
  severity: 'warning' | 'critical'
  payload: {
    projectName: string
    message: string
    details: Record<string, unknown>
  }
}
