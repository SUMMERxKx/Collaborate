import SignIn from '@/components/auth/SignIn';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Collaborate',
  description: 'Sign in to your Collaborate workspace',
};

export default function SignInPage() {
  return <SignIn />;
} 