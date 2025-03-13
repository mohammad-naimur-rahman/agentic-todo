import { needAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { ITodo, Todo } from '@/lib/models/todo'
import { tool } from 'ai'
import { z } from 'zod'
import { fuzzyMatchSingleTodo } from './utils'

interface ToolResult {
  success: boolean
  message?: string
  error?: string
  todo?: ITodo
  count?: number
  todos?: ITodo[]
}

export const todoTools = {
  addTodo: tool({
    description: 'Add a new todo item',
    parameters: z.object({ text: z.string().describe('The todo text') }),
    execute: async ({ text }: { text: string }): Promise<ToolResult> => {
      if (!global.mongoose?.conn) {
        await connectDB()
      }
      const { userId, success } = await needAuth()
      if (!success) return { success: false, error: 'Unauthorized' }

      await Todo.create({ text, completed: false, userId })
      return { success: true, message: `Added: "${text}"` }
    }
  }),

  markTodoAsCompletedOrIncomplete: tool({
    description:
      'Mark a todo as completed or incomplete, no need for exact match, because fuzzy search will be used',
    parameters: z.object({
      todoText: z.string().describe('The todo text'),
      toMarkAsCompleted: z
        .boolean()
        .describe('Whether the todo needs to be marked as completed')
    }),
    execute: async ({
      todoText,
      toMarkAsCompleted
    }: {
      todoText: string
      toMarkAsCompleted: boolean
    }): Promise<ToolResult> => {
      const matchedTodo = await fuzzyMatchSingleTodo(todoText)
      if (!matchedTodo) return { success: false, error: 'Todo not found' }

      await Todo.updateOne(
        { _id: matchedTodo._id },
        { completed: toMarkAsCompleted }
      )
      return {
        success: true,
        message: `Marked "${matchedTodo.text}" as ${
          toMarkAsCompleted ? 'done' : 'not done'
        }`
      }
    }
  }),
  markFirstOrLastTodoAsCompletedOrIncomplete: tool({
    description:
      'Mark the first or last todo as completed or incomplete, no need for exact match, because fuzzy search will be used',
    parameters: z.object({
      toMarkAsCompleted: z.boolean().describe('Whether the todo is completed'),
      fromEnd: z.boolean().describe('Whether to mark the last todo')
    }),
    execute: async ({
      toMarkAsCompleted,
      fromEnd
    }: {
      toMarkAsCompleted: boolean
      fromEnd: boolean
    }): Promise<ToolResult> => {
      if (!global.mongoose?.conn) {
        await connectDB()
      }
      const { userId, success } = await needAuth()
      if (!success) return { success: false, error: 'Unauthorized' }

      const todos = await Todo.find({ userId })
        .sort({ createdAt: fromEnd ? -1 : 1 })
        .limit(1)
        .select('_id text')

      if (!todos.length) return { success: false, error: 'No todos found' }

      const matchedTodo = todos[0]
      await Todo.updateOne(
        { _id: matchedTodo._id },
        { completed: toMarkAsCompleted }
      )
      return {
        success: true,
        message: `Marked "${matchedTodo.text}" as ${
          toMarkAsCompleted ? 'done' : 'not done'
        }`
      }
    }
  }),

  deleteTodo: tool({
    description:
      'Delete a todo, no need for exact match, because fuzzy search will be used',
    parameters: z.object({ todoText: z.string().describe('The todo text') }),
    execute: async ({
      todoText
    }: {
      todoText: string
    }): Promise<ToolResult> => {
      const matchedTodo = await fuzzyMatchSingleTodo(todoText)
      if (!matchedTodo) return { success: false, error: 'Todo not found' }

      await Todo.findByIdAndDelete(matchedTodo._id)
      return { success: true, message: `Deleted "${matchedTodo.text}"` }
    }
  }),

  deleteFirstOrLastTodo: tool({
    description: 'Delete the first or last todo',
    parameters: z.object({
      fromEnd: z.boolean().describe('Whether to delete the last todo')
    }),
    execute: async ({ fromEnd }: { fromEnd: boolean }): Promise<ToolResult> => {
      if (!global.mongoose?.conn) {
        await connectDB()
      }
      const { userId, success } = await needAuth()
      if (!success) return { success: false, error: 'Unauthorized' }

      const todos = await Todo.find({ userId })
        .sort({ createdAt: fromEnd ? -1 : 1 })
        .limit(1)
        .select('_id')

      if (!todos.length) return { success: false, error: 'No todos found' }

      await Todo.findByIdAndDelete(todos[0]._id)
      return { success: true, message: `Deleted "${todos[0].text}"` }
    }
  }),
  clearAllTodos: tool({
    description: 'Delete all todos',
    parameters: z.object({}),
    execute: async (): Promise<ToolResult> => {
      if (!global.mongoose?.conn) {
        await connectDB()
      }
      const { userId, success } = await needAuth()
      if (!success) return { success: false, error: 'Unauthorized' }

      await Todo.deleteMany({ userId })
      return { success: true, message: 'All todos cleared' }
    }
  }),

  markMultipleTodosAsDone: tool({
    description: 'Mark multiple todos as done',
    parameters: z.object({
      count: z.number(),
      fromEnd: z.boolean().optional()
    }),
    execute: async ({
      count,
      fromEnd
    }: {
      count: number
      fromEnd?: boolean
    }): Promise<ToolResult> => {
      await connectDB()
      const { userId, success } = await needAuth()
      if (!success) return { success: false, error: 'Unauthorized' }

      const todos = await Todo.find({ userId, completed: false })
        .sort({ createdAt: fromEnd ? -1 : 1 })
        .limit(count)
        .select('_id')

      if (!todos.length) return { success: false, error: 'No todos found' }

      await Todo.updateMany(
        { _id: { $in: todos.map(t => t._id) } },
        { completed: true }
      )
      return {
        success: true,
        count: todos.length,
        message: `Marked ${todos.length} todos as done`
      }
    }
  })
}
