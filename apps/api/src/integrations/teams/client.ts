import { AppError } from '../../lib/errors.js'
import type { AdaptiveCard } from './types.js'

export async function sendTeamsMessage(
  webhookUrl: string,
  card: AdaptiveCard,
  summary: string
): Promise<void> {
  const payload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card,
      },
    ],
    summary,
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AppError(
      'TEAMS_WEBHOOK_ERROR',
      `Teams webhook failed: ${response.status} ${response.statusText}`,
      response.status,
      { body: text }
    )
  }
}
