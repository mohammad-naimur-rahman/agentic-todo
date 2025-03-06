'use client'

import { TodoList } from '@/components/TodoList'

export default function Homepage() {
  return (
    <div className='flex flex-col w-full max-w-lg py-12 mx-auto min-h-screen'>
      {/* Header */}
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>Smart Todo App</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Manage your todos with text commands or UI controls
        </p>
      </div>

      {/* Todo List Component */}
      <TodoList />
    </div>
  )
}
