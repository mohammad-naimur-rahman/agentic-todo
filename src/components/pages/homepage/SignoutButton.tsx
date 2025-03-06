'use client'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignoutButton() {
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
    <>
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
    </>
  )
}
