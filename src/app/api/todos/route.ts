import { needAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { Todo, validateTodo } from '@/lib/models/todo'
import { NextRequest, NextResponse } from 'next/server'

// GET all todos
export async function GET() {
  try {
    await connectDB()
    const { success, userId, error } = await needAuth()
    if (!success) {
      return NextResponse.json({ error }, { status: 401 })
    }
    const todos = await Todo.find({ userId: userId }).sort({
      createdAt: -1
    })
    return NextResponse.json({ todos }, { status: 200 })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

// Create a new todo
export async function POST(request: NextRequest) {
  try {
    const { success, userId, error } = await needAuth()
    if (!success) {
      return NextResponse.json({ error }, { status: 401 })
    }
    const body = await request.json()
    const validation = validateTodo(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    await connectDB()
    const newTodo = new Todo({
      text: validation.data!.text,
      completed: validation.data!.completed,
      userId
    })

    await newTodo.save()
    return NextResponse.json({ todo: newTodo }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}

// DELETE all todos
export async function DELETE() {
  try {
    const { success, userId, error } = await needAuth()
    if (!success) {
      return NextResponse.json({ error }, { status: 401 })
    }
    await connectDB()
    await Todo.deleteMany({ userId: userId })
    return NextResponse.json({ message: 'All todos deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting todos:', error)
    return NextResponse.json(
      { error: 'Failed to delete todos' },
      { status: 500 }
    )
  }
}
