import { IconPlus, IconSend, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Todo } from './Todo'
import { Input } from './ui/input'

interface TodoItem {
  _id: string
  text: string
  completed: boolean
  createdAt: string
}

export function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [commandResult, setCommandResult] = useState<string | null>(null)

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

  // Fetch all todos from the API
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  // Add a new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newTodo })
      })

      if (response.ok) {
        setNewTodo('')
        fetchTodos()
      }
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  // Toggle todo completion status
  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t._id === id)
      if (!todo) return

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !todo.completed })
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  // Clear all todos
  const clearTodos = async () => {
    try {
      const response = await fetch('/api/todos', {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Error clearing todos:', error)
    }
  }

  // Process natural language command
  const processCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    setLoading(true)
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

      if (response.ok && data.result) {
        setCommandResult(data.result.text || 'Command processed successfully')
        fetchTodos()
        setCommand('')
      } else {
        setCommandResult(data.error || 'Failed to process command')
      }
    } catch (error) {
      console.error('Error processing command:', error)
      setCommandResult('Error processing command')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Todo List</h1>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className='flex gap-2 mb-6'>
        <Input
          type='text'
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder='Add a new todo...'
          className='flex-1'
        />
        <button
          type='submit'
          className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md'
          aria-label='Add todo'
        >
          <IconPlus size={20} />
        </button>
      </form>

      {/* Command Input */}
      <form onSubmit={processCommand} className='flex gap-2 mb-6'>
        <Input
          type='text'
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="Enter a command (e.g., 'Add a todo: Buy groceries')"
          className='flex-1'
          disabled={loading}
        />
        <button
          type='submit'
          className='bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md'
          aria-label='Send command'
          disabled={loading}
        >
          <IconSend size={20} />
        </button>
      </form>

      {/* Command Result */}
      {commandResult && (
        <div className='mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm'>
          {commandResult}
        </div>
      )}

      {/* Todo List */}
      <div className='space-y-1 mb-4'>
        {todos.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400 py-4'>
            No todos yet. Add one above!
          </p>
        ) : (
          todos.map(todo => (
            <Todo
              key={todo._id}
              id={todo._id}
              text={todo.text}
              completed={todo.completed}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      {/* Clear All Button */}
      {todos.length > 0 && (
        <button
          onClick={clearTodos}
          className='flex items-center gap-2 text-red-500 hover:text-red-600 text-sm mx-auto'
        >
          <IconTrash size={16} />
          Clear All Todos
        </button>
      )}
    </div>
  )
}
