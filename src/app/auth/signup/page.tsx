import SignUp from '@/components/auth/SignUp';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Collaborate',
  description: 'Create your Collaborate account',
};

export default function SignUpPage() {
  return <SignUp />;
} 