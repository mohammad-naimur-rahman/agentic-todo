'use client'

import { TodoList } from '@/components/TodoList'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Homepage() {
  const { push } = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const user = Cookies.get('user')
    if (user) {
      setUserEmail(JSON.parse(user).email)
    }
  }, [])

  const handleSignOut = () => {
    Cookies.remove('token')
    Cookies.remove('user')
    push('/auth/signin')
  }

  return (
    <div className='flex flex-col w-full max-w-lg py-12 mx-auto min-h-screen'>
      {/* Header */}
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>Smart Todo App</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Manage your todos with text commands or UI controls
        </p>
        {userEmail && (
          <div className='mt-4 text-sm'>
            <p>
              Signed in as: <span className='font-medium'>{userEmail}</span>
            </p>
            <button
              onClick={handleSignOut}
              className='mt-2 text-indigo-600 hover:text-indigo-500 underline cursor-pointer'
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Todo List Component */}
      <TodoList />
    </div>
  )
}
