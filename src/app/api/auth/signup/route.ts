import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Define validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB()

    // Parse and validate request body
    const body = await req.json()
    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = new User({ email, password })
    await newUser.save()

    // Return success response (without password)
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
