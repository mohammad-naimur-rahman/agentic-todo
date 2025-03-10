import { Metadata, Viewport } from 'next'
import SignUp from './SignUp'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Sign up to your account'
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default function SignUppage() {
  return <SignUp />
}
