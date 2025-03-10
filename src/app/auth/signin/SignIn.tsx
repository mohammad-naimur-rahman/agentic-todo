'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Signin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.push(callbackUrl)
    }
  }, [callbackUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials')
      }

      // Store token in cookie with proper configuration
      Cookies.set('token', data.token, {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
      })

      Cookies.set('user', JSON.stringify(data.user), {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
      })

      // Force a hard navigation instead of client-side routing
      window.location.href = callbackUrl
    } catch (err: any) {
      console.error('Signin error:', err)
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4 mb-4'>
            <div className='flex'>
              <div className='ml-3'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className='mt-8 space-y-3' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <Input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                placeholder='Email address'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className='text-sm text-center mt-4'>
          Don't have an account?{' '}
          <Link
            href='/auth/signup'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
