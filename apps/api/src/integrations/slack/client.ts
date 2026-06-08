import { WebClient, type KnownBlock } from '@slack/web-api'
import { env } from '../../config/env.js'

let webClient: WebClient | null = null

function getClient(): WebClient {
  if (!webClient) {
    webClient = new WebClient(env.SLACK_BOT_TOKEN || undefined)
  }
  return webClient
}

/** Send a message via Slack Incoming Webhook URL (preferred for per-project configs) */
export async function sendWebhookMessage(webhookUrl: string, blocks: KnownBlock[], text: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks, text }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Slack webhook failed (${response.status}): ${body}`)
  }
}

/** Send a message via Slack Bot Token to a specific channel */
export async function sendChannelMessage(channelId: string, blocks: KnownBlock[], text: string): Promise<void> {
  const client = getClient()
  await client.chat.postMessage({
    channel: channelId,
    blocks,
    text,
  })
}
