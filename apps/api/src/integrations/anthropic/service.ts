import { getAnthropicClient } from './client.js'
import { FORECAST_SYSTEM_PROMPT, buildUserPrompt } from './prompts.js'
import { ForecastOutputSchema, type ForecastInput, type ForecastOutput } from './types.js'

export async function generateForecast(input: ForecastInput): Promise<ForecastOutput> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: FORECAST_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input) }],
  })

  // Extract text content
  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Parse JSON from response
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return ForecastOutputSchema.parse(parsed)
}
