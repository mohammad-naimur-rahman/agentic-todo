'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.push('/')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Redirect to signin page on successful signup using hard navigation
      window.location.href = '/auth/signin'
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>
            Create your account
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
                autoComplete='new-password'
                required
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>

        <div className='text-sm text-center mt-4'>
          Already have an account?{' '}
          <Link
            href='/auth/signin'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
