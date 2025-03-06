import { Document, Schema, model, models } from 'mongoose'
import { z } from 'zod'

// Zod schema for validation
export const TodoSchema = z.object({
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  userId: z.string().min(1, 'User ID is required')
})

export type TodoType = z.infer<typeof TodoSchema>

// Mongoose interface
export interface ITodo extends Document {
  text: string
  completed: boolean
  createdAt: Date
  userId: Schema.Types.ObjectId
}

// Mongoose schema
const todoSchema = new Schema<ITodo>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

// Create or retrieve the model
export const Todo = models.Todo || model<ITodo>('Todo', todoSchema)

// Helper function to validate todo with Zod
export function validateTodo(data: unknown): {
  success: boolean
  data?: Omit<TodoType, 'userId'>
  error?: string
} {
  try {
    const parsedData = TodoSchema.omit({ userId: true }).parse(data)
    return { success: true, data: parsedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Invalid todo data' }
  }
}
