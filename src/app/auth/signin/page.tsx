import { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import SignIn from './SignIn'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your account'
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  )
}
