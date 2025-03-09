import { google } from '@ai-sdk/google'
import { streamText, tool } from 'ai'
import { Message } from 'ai/react'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Maximum number of messages to keep in history to control costs
const MAX_MESSAGES_HISTORY = 10

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Limit the number of messages sent to the API to control costs
  // Keep the most recent messages, including system messages at the beginning if any
  const limitedMessages = limitMessagesHistory(messages, MAX_MESSAGES_HISTORY)

  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    messages: limitedMessages,
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for')
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32)
          return {
            location,
            temperature
          }
        }
      })
    }
  })

  return result.toDataStreamResponse()
}

/**
 * Limits the message history to a specified number of messages
 * Preserves system messages at the beginning and keeps the most recent messages
 */
function limitMessagesHistory(messages: Message[], maxMessages: number) {
  if (!messages || messages.length <= maxMessages) {
    return messages
  }

  // Extract system messages from the beginning
  const systemMessages: Message[] = []
  let i = 0
  while (i < messages.length && messages[i].role === 'system') {
    systemMessages.push(messages[i])
    i++
  }

  // Calculate how many non-system messages we can keep
  const remainingSlots = maxMessages - systemMessages.length

  // If we can't keep any non-system messages, just return the system messages
  if (remainingSlots <= 0) {
    return systemMessages
  }

  // Get the most recent non-system messages
  const recentMessages = messages.slice(i).slice(-remainingSlots)

  // Combine system messages with recent messages
  return [...systemMessages, ...recentMessages]
}
