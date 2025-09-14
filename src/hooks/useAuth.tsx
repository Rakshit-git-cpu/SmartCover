import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // If Supabase is not configured, just set loading to false
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful signin
      const demoUser = {
        id: 'demo-user-id',
        email,
        user_metadata: { full_name: 'Demo User' }
      } as User;
      setUser(demoUser);
      return { data: { user: demoUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // If signin successful, ensure user profile exists
    if (data?.user && !error) {
      try {
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // User profile doesn't exist, create it
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 'User',
            });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        }
      } catch (profileError) {
        console.error('Error checking/creating user profile:', profileError);
      }
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful signup
      const demoUser = {
        id: 'demo-user-id',
        email,
        user_metadata: { full_name: fullName }
      } as User;
      setUser(demoUser);
      return { data: { user: demoUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // Disable email confirmation by not providing emailRedirectTo
      },
    });

    // If signup successful, ensure user profile is created
    if (data?.user && !error) {
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
          })
          .select();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw error as user is already created in auth
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      // Demo mode - just clear the user
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};