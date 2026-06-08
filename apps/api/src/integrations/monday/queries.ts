import { mondayGraphQL } from './client.js'
import type {
  MondayBoard,
  MondayBoardResponse,
  MondayGroup,
  MondayGroupsResponse,
  MondayItem,
  MondayItemsResponse,
  MondayItemsNextPageResponse,
  MondayUser,
  MondayBoardSubscribersResponse,
} from './types.js'

/**
 * Get a board by ID
 */
export async function getBoard(boardId: string): Promise<MondayBoard | null> {
  const query = `
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        id
        name
        description
        state
        board_kind
        workspace {
          id
          name
        }
      }
    }
  `

  const response = await mondayGraphQL<MondayBoardResponse>(query, { boardId: [boardId] })
  return response.data.boards[0] ?? null
}

/**
 * Get all groups in a board
 */
export async function getBoardGroups(boardId: string): Promise<MondayGroup[]> {
  const query = `
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        groups {
          id
          title
          color
          position
          archived
        }
      }
    }
  `

  const response = await mondayGraphQL<MondayGroupsResponse>(query, { boardId: [boardId] })
  const groups = response.data.boards[0]?.groups ?? []

  // Filter out archived groups
  return groups.filter((g) => !g.archived)
}

/**
 * Get all items in a board with pagination
 */
export async function getBoardItems(boardId: string): Promise<MondayItem[]> {
  const allItems: MondayItem[] = []

  // First page query
  const firstPageQuery = `
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100) {
          cursor
          items {
            id
            name
            state
            created_at
            updated_at
            group {
              id
              title
            }
            column_values {
              id
              title
              type
              text
              value
            }
            subscribers {
              id
              name
              email
              photo_thumb
              enabled
            }
          }
        }
      }
    }
  `

  const firstResponse: MondayItemsResponse = await mondayGraphQL<MondayItemsResponse>(firstPageQuery, { boardId: [boardId] })
  const firstPage = firstResponse.data.boards[0]?.items_page

  if (!firstPage) return []

  allItems.push(...firstPage.items)
  let cursor = firstPage.cursor

  // Subsequent pages
  while (cursor) {
    const nextPageQuery = `
      query($cursor: String!) {
        next_items_page(cursor: $cursor, limit: 100) {
          cursor
          items {
            id
            name
            state
            created_at
            updated_at
            group {
              id
              title
            }
            column_values {
              id
              title
              type
              text
              value
            }
            subscribers {
              id
              name
              email
              photo_thumb
              enabled
            }
          }
        }
      }
    `

    const nextResponse: MondayItemsNextPageResponse = await mondayGraphQL<MondayItemsNextPageResponse>(nextPageQuery, { cursor })
    allItems.push(...nextResponse.data.next_items_page.items)
    cursor = nextResponse.data.next_items_page.cursor
  }

  // Filter out non-active items
  return allItems.filter((item) => item.state === 'active')
}

/**
 * Get board subscribers (members)
 */
export async function getBoardSubscribers(boardId: string): Promise<MondayUser[]> {
  const query = `
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        subscribers {
          id
          name
          email
          photo_thumb
          enabled
        }
      }
    }
  `

  const response = await mondayGraphQL<MondayBoardSubscribersResponse>(query, { boardId: [boardId] })
  const subscribers = response.data.boards[0]?.subscribers ?? []

  // Filter to enabled users only
  return subscribers.filter((u) => u.enabled)
}
