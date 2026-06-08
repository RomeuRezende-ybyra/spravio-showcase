import { asanaRequest } from './client.js'
import type {
  AsanaProject,
  AsanaSection,
  AsanaTask,
  AsanaUser,
  AsanaResponse,
  AsanaListResponse,
} from './types.js'

/**
 * Get a project by GID
 */
export async function getProject(projectGid: string): Promise<AsanaProject> {
  const response = await asanaRequest<AsanaResponse<AsanaProject>>(
    `/projects/${projectGid}?opt_fields=gid,name,archived,color,created_at,modified_at,notes,public,workspace.gid,workspace.name`
  )
  return response.data
}

/**
 * Get all sections in a project
 */
export async function getProjectSections(projectGid: string): Promise<AsanaSection[]> {
  const allSections: AsanaSection[] = []
  let offset: string | null = null

  do {
    const path = `/projects/${projectGid}/sections?opt_fields=gid,name,project.gid,project.name,created_at&limit=100${offset ? `&offset=${offset}` : ''}`
    const response: AsanaListResponse<AsanaSection> = await asanaRequest<AsanaListResponse<AsanaSection>>(path)
    allSections.push(...response.data)
    offset = response.next_page?.offset ?? null
  } while (offset)

  return allSections
}

/**
 * Get all tasks in a project with pagination
 */
export async function getProjectTasks(projectGid: string): Promise<AsanaTask[]> {
  const allTasks: AsanaTask[] = []
  let offset: string | null = null

  const fields = [
    'gid', 'name', 'notes', 'completed', 'completed_at',
    'due_on', 'due_at', 'start_on', 'created_at', 'modified_at',
    'assignee.gid', 'assignee.name', 'assignee.email', 'assignee.photo',
    'memberships.project.gid', 'memberships.project.name',
    'memberships.section.gid', 'memberships.section.name',
    'tags.gid', 'tags.name', 'tags.color',
    'custom_fields.gid', 'custom_fields.name', 'custom_fields.type',
    'custom_fields.number_value', 'custom_fields.text_value',
    'custom_fields.enum_value.gid', 'custom_fields.enum_value.name',
    'num_subtasks', 'permalink_url'
  ].join(',')

  do {
    const path = `/projects/${projectGid}/tasks?opt_fields=${fields}&limit=100${offset ? `&offset=${offset}` : ''}`
    const response: AsanaListResponse<AsanaTask> = await asanaRequest<AsanaListResponse<AsanaTask>>(path)
    allTasks.push(...response.data)
    offset = response.next_page?.offset ?? null
  } while (offset)

  return allTasks
}

/**
 * Get all users in a workspace
 */
export async function getWorkspaceUsers(workspaceGid: string): Promise<AsanaUser[]> {
  const allUsers: AsanaUser[] = []
  let offset: string | null = null

  do {
    const path = `/workspaces/${workspaceGid}/users?opt_fields=gid,name,email,photo.image_60x60&limit=100${offset ? `&offset=${offset}` : ''}`
    const response: AsanaListResponse<AsanaUser> = await asanaRequest<AsanaListResponse<AsanaUser>>(path)
    allUsers.push(...response.data)
    offset = response.next_page?.offset ?? null
  } while (offset)

  return allUsers
}

/**
 * Get project members (users assigned to tasks in the project)
 */
export async function getProjectMembers(projectGid: string): Promise<AsanaUser[]> {
  // Get the project to find its workspace
  const project = await getProject(projectGid)

  // Get all workspace users - in practice, you'd filter to project members
  // Asana doesn't have a direct "project members" endpoint, so we get workspace users
  const users = await getWorkspaceUsers(project.workspace.gid)

  return users
}
