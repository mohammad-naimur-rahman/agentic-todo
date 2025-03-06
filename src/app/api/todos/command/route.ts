import connectDB from '@/lib/db'
import { Todo } from '@/lib/models/todo'
import { NextRequest, NextResponse } from 'next/server'

// Define the result type for our tools
interface ToolResult {
  success: boolean
  message?: string
  error?: string
  todo?: any
  count?: number
  todos?: any[]
}

// Define the tools for handling todo commands
const todoTools = [
  {
    name: 'addTodo',
    description: 'Add a new todo item to the list',
    execute: async (text: string): Promise<ToolResult> => {
      await connectDB()
      const newTodo = new Todo({ text, completed: false })
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
    execute: async (): Promise<ToolResult> => {
      await connectDB()
      await Todo.deleteMany({})
      return { success: true, message: 'All todos cleared' }
    }
  },
  {
    name: 'markFirstTodoAsDone',
    description: 'Mark the first todo in the list as completed',
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

// Process natural language commands
export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required and must be a string' },
        { status: 400 }
      )
    }

    // Parse the command
    const commandLower = command.toLowerCase()
    let result: ToolResult

    // Add a todo
    if (commandLower.startsWith('add') || commandLower.includes('add a todo')) {
      const todoText = command.replace(/add a todo|add todo|add/i, '').trim()
      if (todoText) {
        result = await todoTools[0].execute(todoText)
      } else {
        result = { success: false, error: 'No todo text provided' }
      }
    }
    // Mark as done
    else if (commandLower.includes('mark') && commandLower.includes('done')) {
      if (commandLower.includes('first')) {
        result = await todoTools[6].execute()
      } else if (commandLower.includes('last')) {
        result = await todoTools[7].execute()
      } else if (commandLower.match(/mark\s+(\d+)/i)) {
        const match = commandLower.match(/mark\s+(\d+)/i)
        const count = parseInt(match![1], 10)
        const fromEnd = commandLower.includes('last')
        result = await todoTools[8].execute(count, fromEnd)
      } else {
        // Extract the todo text
        const todoText = command
          .replace(/mark as done|mark done|mark|as done|done/gi, '')
          .trim()
        if (todoText) {
          result = await todoTools[1].execute(todoText)
        } else {
          result = {
            success: false,
            error: 'No todo specified to mark as done'
          }
        }
      }
    }
    // Mark as undone
    else if (
      commandLower.includes('mark') &&
      (commandLower.includes('undone') || commandLower.includes('not done'))
    ) {
      const todoText = command
        .replace(
          /mark as undone|mark undone|mark as not done|mark not done|undone|not done/gi,
          ''
        )
        .trim()
      if (todoText) {
        result = await todoTools[2].execute(todoText)
      } else {
        result = {
          success: false,
          error: 'No todo specified to mark as undone'
        }
      }
    }
    // Delete a todo
    else if (commandLower.includes('delete') && !commandLower.includes('all')) {
      const todoText = command.replace(/delete todo|delete/i, '').trim()
      if (todoText) {
        result = await todoTools[3].execute(todoText)
      } else {
        result = { success: false, error: 'No todo specified to delete' }
      }
    }
    // Clear all todos
    else if (
      commandLower.includes('clear') ||
      commandLower.includes('reset') ||
      (commandLower.includes('delete') && commandLower.includes('all'))
    ) {
      result = await todoTools[4].execute()
    } else {
      result = { success: false, error: 'Command not recognized' }
    }

    return NextResponse.json(
      {
        result: { text: result.message || result.error },
        success: result.success
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
