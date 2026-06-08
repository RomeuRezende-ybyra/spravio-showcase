// Monday.com API (GraphQL) response types

export interface MondayBoard {
  id: string
  name: string
  description: string | null
  state: 'active' | 'archived' | 'deleted'
  board_kind: 'public' | 'private' | 'share'
  workspace: { id: string; name: string } | null
}

export interface MondayGroup {
  id: string
  title: string
  color: string
  position: string
  archived: boolean
}

export interface MondayItem {
  id: string
  name: string
  state: 'active' | 'archived' | 'deleted'
  created_at: string
  updated_at: string
  group: { id: string; title: string }
  column_values: MondayColumnValue[]
  subscribers: MondayUser[]
}

export interface MondayColumnValue {
  id: string
  title: string
  type: string
  text: string | null
  value: string | null
}

export interface MondayUser {
  id: string
  name: string
  email: string
  photo_thumb: string | null
  enabled: boolean
}

export interface MondayWorkspace {
  id: string
  name: string
  kind: 'open' | 'closed'
}

// GraphQL response wrappers
export interface MondayBoardsResponse {
  data: {
    boards: MondayBoard[]
  }
}

export interface MondayBoardResponse {
  data: {
    boards: MondayBoard[]
  }
}

export interface MondayGroupsResponse {
  data: {
    boards: Array<{
      groups: MondayGroup[]
    }>
  }
}

export interface MondayItemsResponse {
  data: {
    boards: Array<{
      items_page: {
        cursor: string | null
        items: MondayItem[]
      }
    }>
  }
}

export interface MondayItemsNextPageResponse {
  data: {
    next_items_page: {
      cursor: string | null
      items: MondayItem[]
    }
  }
}

export interface MondayUsersResponse {
  data: {
    users: MondayUser[]
  }
}

export interface MondayBoardSubscribersResponse {
  data: {
    boards: Array<{
      subscribers: MondayUser[]
    }>
  }
}
