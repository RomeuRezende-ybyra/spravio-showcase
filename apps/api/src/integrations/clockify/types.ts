// Clockify API Response Types

export interface ClockifyTimeInterval {
  start: string // ISO datetime
  end: string // ISO datetime
  duration: string // ISO 8601 duration (e.g., "PT1H30M")
}

export interface ClockifyTimeEntry {
  id: string
  description: string
  timeInterval: ClockifyTimeInterval
  userId: string
  projectId: string | null
  workspaceId: string
}

export interface ClockifyUser {
  id: string
  email: string
  name: string
  activeWorkspace: string
  status: string
}

export interface ClockifyProject {
  id: string
  name: string
  workspaceId: string
}
