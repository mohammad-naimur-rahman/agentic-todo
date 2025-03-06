import { needAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { Todo } from '@/lib/models/todo'
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Define the result type for our tools
interface ToolResult {
  success: boolean
  message?: string
  error?: string
  todo?: any
  count?: number
  todos?: any[]
}

// Define the tool definition interface
interface TodoToolDefinition {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
  execute: (...args: any[]) => Promise<ToolResult>
}

// Define the tools for handling todo commands
const todoTools: TodoToolDefinition[] = [
  {
    name: 'addTodo',
    description: 'Add a new todo item to the list',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text of the todo item to add'
        }
      },
      required: ['text']
    },
    execute: async (text: string): Promise<ToolResult> => {
      await connectDB()
      const { userId, success } = await needAuth()
      if (!success) {
        return { success: false, error: 'Unauthorized' }
      }
      const newTodo = new Todo({ text, completed: false, userId })
      await newTodo.save()
      return {
        success: true,
        todo: newTodo,
        message: `Added new todo: "${text}"`
      }
    }
  },
  {
    name: 'markTodoAsDone',
    description: 'Mark a specific todo item as completed',
    parameters: {
      type: 'object',
      properties: {
        todoText: {
          type: 'string',
          description: 'The text of the todo item to mark as done'
        }
      },
      required: ['todoText']
    },
    execute: async (todoText: string): Promise<ToolResult> => {
      await connectDB()
      // Find the todo with text that most closely matches the provided text
      const todos = await Todo.find({})

      // Simple fuzzy matching - find the todo with the most similar text
      const matchedTodo = todos.reduce((best, current) => {
        const currentSimilarity = calculateSimilarity(
          current.text.toLowerCase(),
          todoText.toLowerCase()
        )
        const bestSimilarity = best
          ? calculateSimilarity(best.text.toLowerCase(), todoText.toLowerCase())
          : 0
        return currentSimilarity > bestSimilarity ? current : best
      }, null)

      if (
        !matchedTodo ||
        calculateSimilarity(
          matchedTodo.text.toLowerCase(),
          todoText.toLowerCase()
        ) < 0.5
      ) {
        return { success: false, error: 'Todo not found' }
      }

      matchedTodo.completed = true
      await matchedTodo.save()
      return {
        success: true,
        todo: matchedTodo,
        message: `Marked "${matchedTodo.text}" as done`
      }
    }
  },
  {
    name: 'markTodoAsUndone',
    description: 'Mark a specific todo item as not completed',
    parameters: {
      type: 'object',
      properties: {
        todoText: {
          type: 'string',
          description: 'The text of the todo item to mark as not done'
        }
      },
      required: ['todoText']
    },
    execute: async (todoText: string): Promise<ToolResult> => {
      await connectDB()
      const todos = await Todo.find({})

      const matchedTodo = todos.reduce((best, current) => {
        const currentSimilarity = calculateSimilarity(
          current.text.toLowerCase(),
          todoText.toLowerCase()
        )
        const bestSimilarity = best
          ? calculateSimilarity(best.text.toLowerCase(), todoText.toLowerCase())
          : 0
        return currentSimilarity > bestSimilarity ? current : best
      }, null)

      if (
        !matchedTodo ||
        calculateSimilarity(
          matchedTodo.text.toLowerCase(),
          todoText.toLowerCase()
        ) < 0.5
      ) {
        return { success: false, error: 'Todo not found' }
      }

      matchedTodo.completed = false
      await matchedTodo.save()
      return {
        success: true,
        todo: matchedTodo,
        message: `Marked "${matchedTodo.text}" as not done`
      }
    }
  },
  {
    name: 'deleteTodo',
    description: 'Delete a specific todo item',
    parameters: {
      type: 'object',
      properties: {
        todoText: {
          type: 'string',
          description: 'The text of the todo item to delete'
        }
      },
      required: ['todoText']
    },
    execute: async (todoText: string): Promise<ToolResult> => {
      await connectDB()
      const todos = await Todo.find({})

      const matchedTodo = todos.reduce((best, current) => {
        const currentSimilarity = calculateSimilarity(
          current.text.toLowerCase(),
          todoText.toLowerCase()
        )
        const bestSimilarity = best
          ? calculateSimilarity(best.text.toLowerCase(), todoText.toLowerCase())
          : 0
        return currentSimilarity > bestSimilarity ? current : best
      }, null)

      if (
        !matchedTodo ||
        calculateSimilarity(
          matchedTodo.text.toLowerCase(),
          todoText.toLowerCase()
        ) < 0.5
      ) {
        return { success: false, error: 'Todo not found' }
      }

      await Todo.findByIdAndDelete(matchedTodo._id)
      return { success: true, message: `Deleted todo: "${matchedTodo.text}"` }
    }
  },
  {
    name: 'clearAllTodos',
    description: 'Delete all todo items',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async (): Promise<ToolResult> => {
      await connectDB()
      await Todo.deleteMany({})
      return { success: true, message: 'All todos cleared' }
    }
  },
  {
    name: 'markFirstTodoAsDone',
    description: 'Mark the first todo in the list as completed',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async (): Promise<ToolResult> => {
      await connectDB()
      const firstTodo = await Todo.findOne().sort({ createdAt: 1 })

      if (!firstTodo) {
        return { success: false, error: 'No todos found' }
      }

      firstTodo.completed = true
      await firstTodo.save()
      return {
        success: true,
        todo: firstTodo,
        message: `Marked first todo "${firstTodo.text}" as done`
      }
    }
  },
  {
    name: 'markLastTodoAsDone',
    description: 'Mark the last todo in the list as completed',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async (): Promise<ToolResult> => {
      await connectDB()
      const lastTodo = await Todo.findOne().sort({ createdAt: -1 })

      if (!lastTodo) {
        return { success: false, error: 'No todos found' }
      }

      lastTodo.completed = true
      await lastTodo.save()
      return {
        success: true,
        todo: lastTodo,
        message: `Marked last todo "${lastTodo.text}" as done`
      }
    }
  },
  {
    name: 'markMultipleTodosAsDone',
    description: 'Mark multiple todos as completed',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of todos to mark as done'
        },
        fromEnd: {
          type: 'boolean',
          description:
            'Whether to start from the end of the list (most recent todos)'
        }
      },
      required: ['count']
    },
    execute: async (
      count: number,
      fromEnd: boolean = false
    ): Promise<ToolResult> => {
      await connectDB()
      const todos = await Todo.find({})
        .sort({ createdAt: fromEnd ? -1 : 1 })
        .limit(count)

      if (todos.length === 0) {
        return { success: false, error: 'No todos found' }
      }

      for (const todo of todos) {
        todo.completed = true
        await todo.save()
      }

      return {
        success: true,
        count: todos.length,
        message: `Marked ${todos.length} todos as done`
      }
    }
  }
]

// Convert todoTools to the format needed for generateText by mapping through the array
const tools = Object.fromEntries(
  todoTools.map(toolDef => {
    const paramSchema: Record<string, any> = {}

    // Convert JSON Schema properties to Zod schema
    Object.entries(toolDef.parameters.properties || {}).forEach(
      ([key, value]) => {
        const propDef = value as any
        if (propDef.type === 'string') {
          paramSchema[key] = z.string().describe(propDef.description || '')
        } else if (propDef.type === 'number') {
          paramSchema[key] = z.number().describe(propDef.description || '')
        } else if (propDef.type === 'boolean') {
          paramSchema[key] = z.boolean().describe(propDef.description || '')
        }
      }
    )

    return [
      toolDef.name,
      tool({
        description: toolDef.description,
        parameters: z.object(paramSchema),
        execute: async (params: Record<string, any>) => {
          // Handle different parameter patterns based on the tool
          switch (toolDef.name) {
            case 'addTodo':
              return await toolDef.execute(params.text)
            case 'markTodoAsDone':
            case 'markTodoAsUndone':
            case 'deleteTodo':
              return await toolDef.execute(params.todoText)
            case 'clearAllTodos':
            case 'markFirstTodoAsDone':
            case 'markLastTodoAsDone':
              return await toolDef.execute()
            case 'markMultipleTodosAsDone':
              return await toolDef.execute(params.count, params.fromEnd)
            default:
              // Default case - pass the first required parameter
              if (
                toolDef.parameters.required &&
                toolDef.parameters.required.length > 0
              ) {
                return await toolDef.execute(
                  params[toolDef.parameters.required[0]]
                )
              }
              return await toolDef.execute()
          }
        }
      })
    ]
  })
)

// Helper function to calculate similarity between two strings (simple Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1 // Both strings are empty

  // Convert distance to similarity score (1 is perfect match, 0 is completely different)
  return 1 - track[str2.length][str1.length] / maxLength
}

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
      model: openai('gpt-4o-mini'),
      prompt: command,
      tools,
      maxSteps: 2
    })

    // Extract the result from the last step if available
    let result: any = { success: true, message: text }

    // Process the steps to find tool results
    let toolResult: ToolResult | null = null
    for (const step of steps) {
      // Check if this step has tool calls
      if (step.toolCalls && step.toolCalls.length > 0) {
        // Get the tool name from the last tool call
        const toolName = step.toolCalls[0].toolName

        // Find the corresponding tool in our todoTools array
        const matchingTool = todoTools.find(tool => tool.name === toolName)
        if (matchingTool) {
          // The next step should contain the result of this tool call
          const nextIndex = steps.indexOf(step) + 1
          if (nextIndex < steps.length) {
            // Use the tool result as our final result
            const nextStep = steps[nextIndex]
            toolResult = {
              success: true,
              message:
                typeof nextStep === 'object' && 'text' in nextStep
                  ? (nextStep.text as string)
                  : text
            }
          }
        }
      }
    }

    // Use the tool result if found, otherwise use the default result
    if (toolResult) {
      result = toolResult
    }

    return NextResponse.json(
      {
        result: { text: result.message || result.error || text },
        success: result.success !== false,
        steps: steps
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
