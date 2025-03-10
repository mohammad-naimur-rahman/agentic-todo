import { Metadata, Viewport } from 'next'
import SignIn from './SignIn'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your account'
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default function SignInPage() {
  return <SignIn />
}
