// Asana API response types

export interface AsanaProject {
  gid: string
  name: string
  archived: boolean
  color: string | null
  created_at: string
  modified_at: string
  notes: string
  public: boolean
  workspace: { gid: string; name: string }
}

export interface AsanaSection {
  gid: string
  name: string
  project: { gid: string; name: string }
  created_at: string
}

export interface AsanaTask {
  gid: string
  name: string
  notes: string
  completed: boolean
  completed_at: string | null
  due_on: string | null
  due_at: string | null
  start_on: string | null
  created_at: string
  modified_at: string
  assignee: AsanaUser | null
  memberships: AsanaTaskMembership[]
  tags: AsanaTag[]
  custom_fields: AsanaCustomField[]
  num_subtasks: number
  permalink_url: string
}

export interface AsanaTaskMembership {
  project: { gid: string; name: string }
  section: { gid: string; name: string } | null
}

export interface AsanaUser {
  gid: string
  name: string
  email: string
  photo: { image_60x60: string } | null
}

export interface AsanaTag {
  gid: string
  name: string
  color: string | null
}

export interface AsanaCustomField {
  gid: string
  name: string
  type: string
  number_value: number | null
  text_value: string | null
  enum_value: { gid: string; name: string; color: string } | null
}

export interface AsanaWorkspace {
  gid: string
  name: string
  is_organization: boolean
}

// API response wrappers
export interface AsanaResponse<T> {
  data: T
}

export interface AsanaListResponse<T> {
  data: T[]
  next_page: {
    offset: string
    path: string
    uri: string
  } | null
}
