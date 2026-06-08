import type { KnownBlock } from '@slack/web-api'

function severityEmoji(severity: 'warning' | 'critical'): string {
  return severity === 'critical' ? ':red_circle:' : ':large_yellow_circle:'
}

export function buildStalePRAlert(
  projectName: string,
  prTitle: string,
  prNumber: number,
  severity: 'warning' | 'critical',
  hoursOpen: number,
): KnownBlock[] {
  const label = severity === 'critical' ? 'CRITICAL' : 'WARNING'
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji(severity)} *Stale PR [${label}]* — _${projectName}_`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*PR:* #${prNumber} ${prTitle}` },
        { type: 'mrkdwn', text: `*Open for:* ${Math.round(hoursOpen)}h` },
      ],
    },
    { type: 'divider' },
  ]
}

export function buildBudgetAlert(
  projectName: string,
  consumedPercent: number,
  totalBudget: number,
  spent: number,
): KnownBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji('warning')} *Budget Alert* — _${projectName}_`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Consumed:* ${consumedPercent.toFixed(1)}%` },
        { type: 'mrkdwn', text: `*Spent:* $${spent.toLocaleString()} / $${totalBudget.toLocaleString()}` },
      ],
    },
    { type: 'divider' },
  ]
}

export function buildSprintHealthAlert(
  projectName: string,
  sprintName: string,
  completionPercent: number,
  daysRemaining: number,
): KnownBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji('critical')} *Sprint Health Alert* — _${projectName}_`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Sprint:* ${sprintName}` },
        { type: 'mrkdwn', text: `*Completion:* ${completionPercent.toFixed(1)}%` },
        { type: 'mrkdwn', text: `*Days remaining:* ${daysRemaining.toFixed(1)}` },
      ],
    },
    { type: 'divider' },
  ]
}

export function buildDoneWithoutCodeAlert(
  projectName: string,
  issueKey: string,
  issueTitle: string,
): KnownBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji('warning')} *Done Without Code* — _${projectName}_`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Issue:* ${issueKey}` },
        { type: 'mrkdwn', text: `*Title:* ${issueTitle}` },
      ],
    },
    { type: 'divider' },
  ]
}

export function buildTestMessage(projectName: string): KnownBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:white_check_mark: *Spravio Test Message* — _${projectName}_\nSlack integration is working correctly!`,
      },
    },
    { type: 'divider' },
  ]
}

export function buildDeliveryRiskMessage(
  projectName: string,
  forecast: {
    onTimeProbability: number
    predictedEndDate: string | null
    confidence: string
    reasoning: string
  },
): KnownBlock[] {
  const severity = forecast.onTimeProbability < 30 ? 'critical' : 'warning'
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji(severity)} *Delivery Risk Alert* — _${projectName}_`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*On-time probability:* ${forecast.onTimeProbability}%` },
        { type: 'mrkdwn', text: `*Confidence:* ${forecast.confidence}` },
        ...(forecast.predictedEndDate
          ? [{ type: 'mrkdwn' as const, text: `*Predicted end:* ${forecast.predictedEndDate}` }]
          : []),
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Analysis:* ${forecast.reasoning}`,
      },
    },
    { type: 'divider' },
  ]
}
