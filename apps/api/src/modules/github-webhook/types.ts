import { z } from 'zod'

export const GitHubPullRequestEventSchema = z.object({
  action: z.string(), // "opened", "closed", "synchronize", "reopened", etc.
  number: z.number(),
  pull_request: z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    state: z.string(),
    merged: z.boolean().optional(),
    user: z.object({
      login: z.string(),
      id: z.number(),
    }),
    head: z.object({
      ref: z.string(),
      sha: z.string(),
    }),
    base: z.object({
      ref: z.string(),
    }),
    html_url: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    merged_at: z.string().nullable(),
    closed_at: z.string().nullable(),
  }),
  repository: z.object({
    full_name: z.string(),
    name: z.string(),
    owner: z.object({
      login: z.string(),
    }),
  }),
})

export type GitHubPullRequestEvent = z.infer<typeof GitHubPullRequestEventSchema>

export const GitHubPushEventSchema = z.object({
  ref: z.string(),
  after: z.string(),
  before: z.string(),
  commits: z.array(z.object({
    id: z.string(),
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string(),
      username: z.string().optional(),
    }),
    timestamp: z.string(),
  })),
  repository: z.object({
    full_name: z.string(),
    name: z.string(),
    owner: z.object({
      login: z.string(),
    }),
  }),
  pusher: z.object({
    name: z.string(),
    email: z.string().optional(),
  }),
})

export type GitHubPushEvent = z.infer<typeof GitHubPushEventSchema>
