import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq'
import { env } from '../config/env.js'

function parseRedisUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
  }
}

const connection = parseRedisUrl(env.REDIS_URL)

export function createQueue(name: string) {
  return new Queue(name, { connection })
}

export function createWorker<T>(
  name: string,
  processor: Processor<T>,
  opts?: Partial<WorkerOptions>,
) {
  return new Worker<T>(name, processor, {
    connection,
    concurrency: 1,
    ...opts,
  })
}

export const syncQueue = createQueue('sync')
export const alertQueue = createQueue('alerts')
