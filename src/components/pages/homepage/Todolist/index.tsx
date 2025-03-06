'use client'
import { Input } from '@/components/ui/input'
import { useGetTodosQuery } from '@/redux/features/todosApi'
import { IconLoader2, IconPlus, IconSend, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Todo } from './Todo'

export function TodoList() {
  const { data, isLoading, isSuccess } = useGetTodosQuery()
  const [newTodo, setNewTodo] = useState('')
  const [command, setCommand] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)
  const [togglingTodo, setTogglingTodo] = useState<string | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<string | null>(null)
  const [clearingTodos, setClearingTodos] = useState(false)
  const [commandResult, setCommandResult] = useState<string | null>(null)

  const todos = data?.todos

  // Add a new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      setAddingTodo(true)
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newTodo })
      })

      if (response.ok) {
        setNewTodo('')
        toast.success('Todo added successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add todo')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add todo')
    } finally {
      setAddingTodo(false)
    }
  }

  // Toggle todo completion status
  const toggleTodo = async (id: string) => {
    try {
      setTogglingTodo(id)
      const todo = todos?.find(t => t._id === id)
      if (!todo) return

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !todo.completed })
      })

      if (response.ok) {
        toast.success(
          `Todo marked as ${!todo.completed ? 'completed' : 'incomplete'}`
        )
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update todo')
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast.error('Failed to update todo')
    } finally {
      setTogglingTodo(null)
    }
  }

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      setDeletingTodo(id)
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Todo deleted successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete todo')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete todo')
    } finally {
      setDeletingTodo(null)
    }
  }

  // Clear all todos
  const clearTodos = async () => {
    try {
      setClearingTodos(true)
      const response = await fetch('/api/todos', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('All todos cleared successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to clear todos')
      }
    } catch (error) {
      console.error('Error clearing todos:', error)
      toast.error('Failed to clear todos')
    } finally {
      setClearingTodos(false)
    }
  }

  // Process natural language command
  const processCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    setCommandResult(null)

    try {
      const response = await fetch('/api/todos/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      })

      const data = await response.json()

      if (response.ok) {
        // Extract the text from the result
        const resultText = data.result?.text || 'Command processed successfully'
        setCommandResult(resultText)
        setCommand('')
        toast.success(resultText)
      } else {
        const errorMessage = data.error || 'Failed to process command'
        setCommandResult(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error processing command:', error)
      const errorMessage = 'Error processing command'
      setCommandResult(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className='w-full max-w-lg mx-auto flex flex-col h-[72vh]'>
      {/* Header Section - Fixed at top */}
      <div className='flex-none'>
        {/* Command Result */}
        {commandResult && (
          <div className='mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm'>
            {commandResult}
          </div>
        )}
      </div>

      {/* Todo List - Scrollable */}
      <div className='flex-grow overflow-y-auto my-4 pr-1'>
        <div className='space-y-1 relative'>
          {isLoading && todos?.length === 0 && (
            <div className='flex justify-center items-center py-8'>
              <IconLoader2 size={24} className='animate-spin text-gray-400' />
            </div>
          )}

          {isSuccess && todos?.length === 0 ? (
            <p className='text-center text-gray-500 dark:text-gray-400 py-4 italic'>
              No todos yet. Add one below!
            </p>
          ) : (
            todos?.map(todo => (
              <Todo
                key={todo._id}
                id={todo._id}
                text={todo.text}
                completed={todo.completed}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                isToggling={togglingTodo === todo._id}
                isDeleting={deletingTodo === todo._id}
              />
            ))
          )}
        </div>

        {/* Clear All Button */}
        {todos?.length && todos?.length > 0 && (
          <div className='mt-4 text-center'>
            <button
              onClick={clearTodos}
              className='flex items-center gap-2 text-red-500 hover:text-red-600 text-sm mx-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              disabled={clearingTodos}
            >
              {clearingTodos ? (
                <IconLoader2 size={16} className='animate-spin' />
              ) : (
                <IconTrash size={16} />
              )}
              Clear All Todos
            </button>
          </div>
        )}
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className='flex-none mt-auto'>
        {/* Add Todo Form */}
        <form onSubmit={addTodo} className='flex gap-2 mb-3'>
          <Input
            type='text'
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            placeholder='Add a new todo...'
            className='flex-1'
            disabled={addingTodo}
          />
          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            aria-label='Add todo'
            disabled={addingTodo}
          >
            {addingTodo ? (
              <IconLoader2 size={20} className='animate-spin' />
            ) : (
              <IconPlus size={20} />
            )}
          </button>
        </form>

        {/* Command Input */}
        <form onSubmit={processCommand} className='flex gap-2'>
          <Input
            type='text'
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="Enter a command (e.g., 'Add a todo: Buy groceries')"
            className='flex-1'
            disabled={isLoading}
          />
          <button
            type='submit'
            className='bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            aria-label='Send command'
            disabled={isLoading}
          >
            {isLoading ? (
              <IconLoader2 size={20} className='animate-spin' />
            ) : (
              <IconSend size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
