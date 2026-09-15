import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, phone, avatar_url, verification_status')
      .eq('id', userId)
      .single();
    if (profileError) throw profileError;
    setProfile(data);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    loadProfile(userId).catch((profileError) => setError(profileError.message));
  }, [loadProfile, session?.user?.id]);

  const signUp = useCallback(async ({ email, password, displayName }) => {
    if (!supabase) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    if (signUpError) throw signUpError;
    return data;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    isAuthenticated: Boolean(session?.user),
    signUp,
    signIn,
    signOut,
    refreshProfile: () => loadProfile(session?.user?.id),
  };
}
