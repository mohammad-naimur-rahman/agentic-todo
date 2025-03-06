import mongoose, { Document, Schema } from 'mongoose'
import { z } from 'zod'

// Zod schema for validation
export const TodoSchema = z.object({
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean().default(false),
  createdAt: z.date().default(() => new Date())
})

export type TodoType = z.infer<typeof TodoSchema>

// Mongoose interface
export interface ITodo extends Document {
  text: string
  completed: boolean
  createdAt: Date
}

// Mongoose schema
const todoSchema = new Schema<ITodo>({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

// Create or retrieve the model
export const Todo =
  mongoose.models.Todo || mongoose.model<ITodo>('Todo', todoSchema)

// Helper function to validate todo with Zod
export function validateTodo(data: unknown): {
  success: boolean
  data?: TodoType
  error?: string
} {
  try {
    const validatedData = TodoSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Invalid todo data' }
  }
}
