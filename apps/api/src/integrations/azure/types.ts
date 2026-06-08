// ─── Raw Azure DevOps API types ─────────────────────────────────────────────

export interface AzureProject {
  id: string
  name: string
  description: string
  state: string
  url: string
}

export interface AzureIteration {
  id: string
  name: string
  path: string
  attributes: {
    startDate?: string
    finishDate?: string
    timeFrame?: 'past' | 'current' | 'future'
  }
  url: string
}

export interface AzureIdentityRef {
  id: string
  displayName: string
  uniqueName: string // email-like identifier
  imageUrl?: string
  url: string
}

export interface AzureWorkItem {
  id: number
  rev: number
  url: string
  fields: {
    'System.Id': number
    'System.Title': string
    'System.State': string
    'System.WorkItemType': string
    'System.AssignedTo'?: AzureIdentityRef
    'System.Tags'?: string
    'System.CreatedDate': string
    'System.ChangedDate': string
    'System.IterationPath'?: string
    'System.AreaPath'?: string
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number
    'Microsoft.VSTS.Scheduling.Effort'?: number
    'Microsoft.VSTS.Common.ResolvedDate'?: string
    'Microsoft.VSTS.Common.ClosedDate'?: string
    'System.Parent'?: number
    [key: string]: unknown
  }
}

export interface AzurePullRequest {
  pullRequestId: number
  title: string
  status: 'active' | 'completed' | 'abandoned' | 'all'
  createdBy: AzureIdentityRef
  creationDate: string
  closedDate?: string
  sourceRefName: string
  targetRefName: string
  mergeStatus?: string
  url: string
  repository: {
    id: string
    name: string
  }
}

export interface AzureRepository {
  id: string
  name: string
  url: string
  defaultBranch?: string
  project: {
    id: string
    name: string
  }
}

export interface AzureTeamMember {
  identity: AzureIdentityRef
  isTeamAdmin: boolean
}

export interface AzureIterationWorkItems {
  workItemRelations: Array<{
    target: {
      id: number
      url: string
    }
    rel: string | null
  }>
}

// ─── Response wrappers ───────────────────────────────────────────────────────

export interface AzureListResponse<T> {
  count: number
  value: T[]
}

export interface AzureWiqlResponse {
  queryType: string
  queryResultType: string
  workItems: Array<{
    id: number
    url: string
  }>
}
