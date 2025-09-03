import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession, getCurrentUser } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch user details from the database when user auth state changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('userId', user.id)
            .single();

          if (error) {
            console.error('Error fetching user details:', error);
            return;
          }

          setUserDetails(data);
        } catch (error) {
          console.error('Error in fetchUserDetails:', error);
        }
      } else {
        setUserDetails(null);
      }
    };

    fetchUserDetails();
  }, [user]);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Create user profile in the database
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              userId: data.user.id,
              email: data.user.email,
              subscriptionTier: 'Free',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    userDetails,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
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

