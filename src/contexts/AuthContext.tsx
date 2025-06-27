'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      console.log('🔍 AuthContext: Getting initial session...');
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();
      
      console.log('🔍 AuthContext: Initial session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: error?.message,
        sessionId: session?.access_token?.substring(0, 20) + '...'
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        sessionId: session?.access_token?.substring(0, 20) + '...'
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If we just signed in, refresh the page to ensure proper state sync
      if (event === 'SIGNED_IN' && session) {
        console.log('🔄 User signed in, refreshing page to sync state...');
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithFacebook = async () => {
    console.log('🚀 Initiating Facebook OAuth...');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🏠 Origin:', window.location.origin);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      console.error('❌ Error signing in with Facebook:', error);
    } else {
      console.log('✅ OAuth redirect initiated:', data);
      console.log('📍 Redirect URL that will be used:', data.url);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithFacebook,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
