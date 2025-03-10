import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { todoTools } from './tools'
// Define the tools for handling todo commands

export const geminiModelMini = google('gemini-2.0-flash-lite')
export const openAiModelMini = openai('gpt-4o-mini')

// Process natural language commands using LLM
export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required and must be a string' },
        { status: 400 }
      )
    }

    // Use the AI to process the command with our tools
    const { text, steps } = await generateText({
      model: geminiModelMini,
      prompt: command,
      tools: todoTools,
      maxSteps: 2
    })

    return NextResponse.json(
      {
        result: { text, steps },
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing command:', error)
    return NextResponse.json(
      { error: 'Failed to process command' },
      { status: 500 }
    )
  }
}
