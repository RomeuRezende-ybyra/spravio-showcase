import type { AdaptiveCard } from './types.js'

function severityColor(severity: 'warning' | 'critical'): string {
  return severity === 'critical' ? 'attention' : 'warning'
}

export function buildStalePRCard(
  projectName: string,
  prTitle: string,
  prNumber: number,
  severity: 'warning' | 'critical',
  hoursOpen: number
): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Stale PR [${severity.toUpperCase()}] - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color: severityColor(severity),
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'PR', value: `#${prNumber} ${prTitle}` },
          { title: 'Open for', value: `${Math.round(hoursOpen)}h` },
        ],
      },
    ],
  }
}

export function buildBudgetCard(
  projectName: string,
  consumedPercent: number,
  totalBudget: number,
  spent: number
): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Budget Alert - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'warning',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Consumed', value: `${consumedPercent.toFixed(1)}%` },
          { title: 'Spent', value: `$${spent.toLocaleString()} / $${totalBudget.toLocaleString()}` },
        ],
      },
    ],
  }
}

export function buildSprintHealthCard(
  projectName: string,
  sprintName: string,
  completionPercent: number,
  daysRemaining: number
): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Sprint Health Alert - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'attention',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Sprint', value: sprintName },
          { title: 'Completion', value: `${completionPercent.toFixed(1)}%` },
          { title: 'Days remaining', value: `${daysRemaining.toFixed(1)}` },
        ],
      },
    ],
  }
}

export function buildDoneWithoutCodeCard(
  projectName: string,
  issueKey: string,
  issueTitle: string
): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Done Without Code - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'warning',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Issue', value: issueKey },
          { title: 'Title', value: issueTitle },
        ],
      },
    ],
  }
}

export function buildTestCard(projectName: string): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Spravio Test Message - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'good',
      },
      {
        type: 'TextBlock',
        text: 'Teams integration is working correctly!',
        wrap: true,
      },
    ],
  }
}

export function buildTeamsDeliveryRiskCard(
  projectName: string,
  forecast: {
    onTimeProbability: number
    predictedEndDate: string | null
    confidence: string
    reasoning: string
  }
): AdaptiveCard {
  const color = forecast.onTimeProbability < 30 ? 'attention' : 'warning'
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `Delivery Risk Alert - ${projectName}`,
        weight: 'Bolder',
        size: 'Medium',
        color,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'On-time probability', value: `${forecast.onTimeProbability}%` },
          { title: 'Confidence', value: forecast.confidence },
          ...(forecast.predictedEndDate
            ? [{ title: 'Predicted end', value: forecast.predictedEndDate }]
            : []),
        ],
      },
      {
        type: 'TextBlock',
        text: forecast.reasoning,
        wrap: true,
      },
    ],
  }
}
