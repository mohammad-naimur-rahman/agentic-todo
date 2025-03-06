import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  // Toolcalling
  const { text, steps } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    tools: {
      moodDetector: tool({
        description:
          'Return mood depends on the text if you think the user is expressing a feeling',
        parameters: z.object({
          mood: z.string().describe('Users current mode')
        }),
        execute: async ({ mood }) => {
          console.log(mood)
          return {
            mood
          }
        }
      }),
      captionGenerator: tool({
        description:
          'Generate a caption for the text if you think the user is asking for a caption',
        parameters: z.object({
          caption: z.string().describe('The caption for the text')
        }),
        execute: async ({ caption }) => {
          console.log(caption)
          return {
            caption
          }
        }
      })
    },
    maxSteps: 2
  })

  console.log(text)
  console.log(steps)
  return NextResponse.json({ message: 'Hello, world!' })
}
