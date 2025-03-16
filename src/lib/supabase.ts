import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Helper function to get authenticated supabase client
export const getAuthenticatedClient = async () => {
  try {
    // Get the session from NextAuth
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    const session = await response.json();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    // Set the access token in the Supabase client
    const { data: { session: supabaseSession }, error } = await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });

    if (error) {
      throw error;
    }

    // Return the authenticated client
    return { data: { session: supabaseSession }, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { data: { session: null }, error: new Error('Authentication failed') };
  }
}; 