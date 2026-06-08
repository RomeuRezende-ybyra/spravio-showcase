export type TeamsAlertType = 'stale_pr' | 'budget' | 'sprint_health' | 'done_without_code'

export interface TeamsAlertJob {
  projectId: string
  alertType: TeamsAlertType
  severity: 'warning' | 'critical'
  payload: {
    projectName: string
    message: string
    details: Record<string, unknown>
  }
}

export interface AdaptiveCard {
  type: 'AdaptiveCard'
  $schema: string
  version: string
  body: AdaptiveCardElement[]
}

export interface AdaptiveCardElement {
  type: string
  text?: string
  weight?: string
  size?: string
  color?: string
  wrap?: boolean
  facts?: Array<{ title: string; value: string }>
}
