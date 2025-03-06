import connectDB from '@/lib/db'
import { Todo } from '@/lib/models/todo'
import { NextRequest, NextResponse } from 'next/server'

// GET a specific todo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const todo = await Todo.findById(params.id)

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json({ todo }, { status: 200 })
  } catch (error) {
    console.error('Error fetching todo:', error)
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 })
  }
}

// PATCH to update a todo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    await connectDB()
    const todo = await Todo.findById(params.id)

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    // Update only the fields that are provided
    if (body.text !== undefined) todo.text = body.text
    if (body.completed !== undefined) todo.completed = body.completed

    await todo.save()
    return NextResponse.json({ todo }, { status: 200 })
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

// DELETE a specific todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const todo = await Todo.findByIdAndDelete(params.id)

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Todo deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
