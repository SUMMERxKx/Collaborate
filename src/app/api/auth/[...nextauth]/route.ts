import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'app-storage-key'
    }
  }
);

export const authOptions: AuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            throw new Error(error.message);
          }

          if (!user || !session) {
            throw new Error('No user found');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      // Check if the token needs to be refreshed
      const tokenExpirationTime = (token as any).exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenExpirationTime - currentTime;

      // If token is about to expire (less than 5 minutes), refresh it
      if (timeUntilExpiry < 300 && token.refreshToken) {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession({
            refresh_token: token.refreshToken as string,
          });

          if (error) throw error;

          if (session) {
            token.accessToken = session.access_token;
            token.refreshToken = session.refresh_token;
            (token as any).exp = Math.floor(Date.now() / 1000 + session.expires_in);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 