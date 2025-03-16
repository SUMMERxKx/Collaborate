import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
} 