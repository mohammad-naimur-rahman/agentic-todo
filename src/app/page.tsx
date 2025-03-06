'use client'

import { TodoList } from '@/components/TodoList'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Homepage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get('token')
    console.log('Homepage token check:', token ? 'Token exists' : 'No token')

    if (!token) {
      console.log('No token found, redirecting to signin page')
      router.push('/auth/signin')
      return
    }

    // Decode token to get user info (without verification, just for display)
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      setUserEmail(payload.email)
      console.log('User authenticated:', payload.email)
    } catch (error) {
      console.error('Error decoding token:', error)
      // If token can't be decoded, it might be invalid
      Cookies.remove('token')
      router.push('/auth/signin')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleSignOut = () => {
    console.log('Signing out...')
    Cookies.remove('token')
    router.push('/auth/signin')
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <p>Loading...</p>
      </div>
    )
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
              className='mt-2 text-indigo-600 hover:text-indigo-500 underline'
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
