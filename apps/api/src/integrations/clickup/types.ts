// ClickUp API response types

export interface ClickUpTeam {
  id: string
  name: string
  color: string
  avatar: string | null
  members: ClickUpMember[]
}

export interface ClickUpSpace {
  id: string
  name: string
  private: boolean
  statuses: ClickUpStatus[]
  features: {
    sprints?: { enabled: boolean }
    time_tracking?: { enabled: boolean }
  }
}

export interface ClickUpStatus {
  id: string
  status: string
  type: string
  orderindex: number
  color: string
}

export interface ClickUpFolder {
  id: string
  name: string
  orderindex: number
  hidden: boolean
  space: { id: string }
  task_count: string
  lists: ClickUpList[]
}

export interface ClickUpList {
  id: string
  name: string
  orderindex: number
  status: { status: string; color: string } | null
  priority: { priority: string; color: string } | null
  start_date: string | null
  due_date: string | null
  folder: { id: string; name: string } | null
  space: { id: string }
  task_count: number
}

export interface ClickUpTask {
  id: string
  custom_id: string | null
  name: string
  text_content: string | null
  description: string | null
  status: { status: string; type: string; color: string }
  orderindex: string
  date_created: string
  date_updated: string
  date_closed: string | null
  date_done: string | null
  creator: ClickUpUser
  assignees: ClickUpUser[]
  watchers: ClickUpUser[]
  tags: ClickUpTag[]
  parent: string | null
  priority: { priority: string; color: string } | null
  due_date: string | null
  start_date: string | null
  points: number | null
  time_estimate: number | null
  time_spent: number | null
  list: { id: string; name: string }
  folder: { id: string; name: string } | null
  space: { id: string }
  url: string
}

export interface ClickUpUser {
  id: number
  username: string
  email: string
  color: string | null
  profilePicture: string | null
  initials: string
}

export interface ClickUpMember {
  user: ClickUpUser
}

export interface ClickUpTag {
  name: string
  tag_fg: string
  tag_bg: string
}

export interface ClickUpSprint {
  id: string
  name: string
  start_date: number | null
  due_date: number | null
  status: string
}

export interface ClickUpTasksResponse {
  tasks: ClickUpTask[]
  last_page: boolean
}

export interface ClickUpFoldersResponse {
  folders: ClickUpFolder[]
}

export interface ClickUpListsResponse {
  lists: ClickUpList[]
}

export interface ClickUpSpacesResponse {
  spaces: ClickUpSpace[]
}

export interface ClickUpTeamsResponse {
  teams: ClickUpTeam[]
}
