import { clickupRequest } from './client.js'
import type {
  ClickUpTeam,
  ClickUpTeamsResponse,
  ClickUpSpace,
  ClickUpSpacesResponse,
  ClickUpFolder,
  ClickUpFoldersResponse,
  ClickUpList,
  ClickUpListsResponse,
  ClickUpTask,
  ClickUpTasksResponse,
  ClickUpMember,
} from './types.js'

/**
 * Get all teams (workspaces) for the authenticated user
 */
export async function getTeams(): Promise<ClickUpTeam[]> {
  const response = await clickupRequest<ClickUpTeamsResponse>('/team')
  return response.teams
}

/**
 * Get all spaces in a team/workspace
 */
export async function getTeamSpaces(teamId: string): Promise<ClickUpSpace[]> {
  const response = await clickupRequest<ClickUpSpacesResponse>(`/team/${teamId}/space?archived=false`)
  return response.spaces
}

/**
 * Get a specific space by ID
 */
export async function getSpace(spaceId: string): Promise<ClickUpSpace> {
  return clickupRequest<ClickUpSpace>(`/space/${spaceId}`)
}

/**
 * Get all folders in a space
 */
export async function getSpaceFolders(spaceId: string): Promise<ClickUpFolder[]> {
  const response = await clickupRequest<ClickUpFoldersResponse>(`/space/${spaceId}/folder?archived=false`)
  return response.folders
}

/**
 * Get all folderless lists in a space (lists directly in the space)
 */
export async function getSpaceLists(spaceId: string): Promise<ClickUpList[]> {
  const response = await clickupRequest<ClickUpListsResponse>(`/space/${spaceId}/list?archived=false`)
  return response.lists
}

/**
 * Get all lists in a folder
 */
export async function getFolderLists(folderId: string): Promise<ClickUpList[]> {
  const response = await clickupRequest<ClickUpListsResponse>(`/folder/${folderId}/list?archived=false`)
  return response.lists
}

/**
 * Get all tasks in a list with pagination
 */
export async function getListTasks(listId: string, page = 0): Promise<ClickUpTask[]> {
  const allTasks: ClickUpTask[] = []
  let currentPage = page
  let hasMore = true

  while (hasMore) {
    const response = await clickupRequest<ClickUpTasksResponse>(
      `/list/${listId}/task?page=${currentPage}&subtasks=true&include_closed=true`
    )
    allTasks.push(...response.tasks)
    hasMore = !response.last_page
    currentPage++
  }

  return allTasks
}

/**
 * Get all tasks in a space (across all lists)
 */
export async function getSpaceTasks(spaceId: string): Promise<ClickUpTask[]> {
  const allTasks: ClickUpTask[] = []

  // Get folderless lists
  const folderlessLists = await getSpaceLists(spaceId)
  for (const list of folderlessLists) {
    const tasks = await getListTasks(list.id)
    allTasks.push(...tasks)
  }

  // Get folders and their lists
  const folders = await getSpaceFolders(spaceId)
  for (const folder of folders) {
    for (const list of folder.lists) {
      const tasks = await getListTasks(list.id)
      allTasks.push(...tasks)
    }
  }

  return allTasks
}

/**
 * Get all members of a space via its workspace/team
 * ClickUp doesn't have direct space members - we get team members
 */
export async function getSpaceMembers(spaceId: string): Promise<ClickUpMember[]> {
  // First get the space to find its team
  const teams = await getTeams()

  // Find which team contains this space
  for (const team of teams) {
    const spaces = await getTeamSpaces(team.id)
    const spaceInTeam = spaces.find(s => s.id === spaceId)
    if (spaceInTeam) {
      return team.members
    }
  }

  return []
}

/**
 * Get all lists (sprints/iterations) in a space
 * Includes both folderless lists and lists within folders
 */
export async function getAllSpaceLists(spaceId: string): Promise<ClickUpList[]> {
  const allLists: ClickUpList[] = []

  // Get folderless lists
  const folderlessLists = await getSpaceLists(spaceId)
  allLists.push(...folderlessLists)

  // Get folders and their lists
  const folders = await getSpaceFolders(spaceId)
  for (const folder of folders) {
    const folderLists = await getFolderLists(folder.id)
    allLists.push(...folderLists)
  }

  return allLists
}
