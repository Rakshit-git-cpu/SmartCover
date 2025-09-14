import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           supabaseAnonKey !== 'placeholder-key' &&
                           supabaseUrl.includes('supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable email confirmation for immediate access
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // This will be overridden by the database migration
  }
});

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials;

export const signUp = async (email: string, password: string, fullName: string) => {
  if (!hasValidCredentials) {
    // For demo purposes, simulate successful signup
    console.warn('Supabase not configured - using demo mode');
    return { 
      data: { 
        user: { 
          id: 'demo-user-id', 
          email, 
          user_metadata: { full_name: fullName } 
        } 
      }, 
      error: null 
    };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!hasValidCredentials) {
    // For demo purposes, simulate successful signin
    console.warn('Supabase not configured - using demo mode');
    return { 
      data: { 
        user: { 
          id: 'demo-user-id', 
          email, 
          user_metadata: { full_name: 'Demo User' } 
        } 
      }, 
      error: null 
    };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};