
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, is_admin`)
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
    return null;
  }, []);
  
  const refreshProfile = useCallback(async () => {
    if(user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    if (currentUser) {
      await fetchProfile(currentUser.id);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated" });
      return { error: { message: "User not authenticated" } };
    }

    const profileUpdate = {
      ...updates,
      id: user.id,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(profileUpdate);

    if (error) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated successfully!" });
    }
    return { error };
  }, [user, toast, refreshProfile]);

  const updateUserEmail = useCallback(async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ variant: "destructive", title: "Failed to update email", description: error.message });
    } else {
      toast({ title: "Email update requested", description: "Please check your old and new email inboxes to confirm the change." });
    }
    return { error };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ variant: "destructive", title: "Failed to update password", description: error.message });
    } else {
      toast({ title: "Password updated successfully!" });
    }
    return { error };
  }, [toast]);

  const resetPasswordForEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast({ variant: "destructive", title: "Password Reset Failed", description: error.message });
    }
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    updateUserEmail,
    updateUserPassword,
    resetPasswordForEmail,
  }), [user, session, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile, updateUserEmail, updateUserPassword, resetPasswordForEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
