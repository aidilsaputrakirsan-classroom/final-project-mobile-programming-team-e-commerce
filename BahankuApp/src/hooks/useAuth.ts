import { AuthApiError } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { supabase } from '@/services/supabase.client';

import { useAuthStore } from '@/store/auth.store';
import { LoginCredentials, RegisterCredentials, User } from '@/types/auth';

let authSubscription:
  | ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription']
  | null = null;

const getSessionWithTimeout = (timeoutMs: number) =>
  new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>(
    (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
      supabase.auth
        .getSession()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    },
  );

export const useAuth = () => {
  const {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const clearAuthSession = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Gagal membersihkan sesi Supabase:', signOutError);
    } finally {
      logoutStore();
    }
  }, [logoutStore]);

  const isInvalidRefreshToken = (error: unknown) =>
    error instanceof AuthApiError &&
    error.message?.toLowerCase().includes('invalid refresh token');

  const loadUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            const {
              data: { user: supaUser },
            } = await supabase.auth.getUser();

            if (supaUser) {
              const userData: User = {
                id: supaUser.id,
                email: supaUser.email || '',
                name: supaUser.user_metadata?.name,
                role: 'user',
              };
              setUser(userData, supaUser);
            }
            return;
          }

          console.error('Error loading profile:', error);
          return;
        }

        const {
          data: { user: supaUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          if (isInvalidRefreshToken(authError)) {
            console.warn(
              'Refresh token tidak valid saat mengambil user, membersihkan sesi.',
            );
            await clearAuthSession();
          } else {
            console.error('Error Supabase getUser:', authError);
          }
          return;
        }

        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          created_at: profile.created_at,
        };

        setUser(userData, supaUser);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    },
    [clearAuthSession, setUser],
  );

  const attemptRestoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getSessionWithTimeout(8000);

      if (result?.data.session?.user) {
        await loadUserProfile(result.data.session.user.id);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error && error.message === 'timeout') {
        console.warn(
          'Inisialisasi auth melewati batas waktu, menjalankan sesi tanpa Supabase.',
        );
      } else if (isInvalidRefreshToken(error)) {
        console.warn('Refresh token tidak valid saat init, membersihkan sesi lokal.');
        await clearAuthSession();
      } else {
        console.error('Error inisialisasi auth:', error);
      }
      return false;
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }, [clearAuthSession, loadUserProfile, setLoading]);

  useEffect(() => {
    attemptRestoreSession();

    if (!authSubscription) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          logoutStore();
        }
      });

      authSubscription = subscription;
    }

    return () => {};
  }, [attemptRestoreSession, loadUserProfile, logoutStore]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (isAuthenticated || isLoading) {
      return;
    }

    const retryTimer = setInterval(() => {
      attemptRestoreSession();
    }, 10000);

    return () => clearInterval(retryTimer);
  }, [attemptRestoreSession, initializing, isAuthenticated, isLoading]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        Alert.alert('Login Gagal', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login gagal';
      Alert.alert('Login Gagal', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            display_name: credentials.name,
          },
        },
      });

      if (authError) {
        Alert.alert('Registrasi Gagal', authError.message);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        Alert.alert('Registrasi Gagal', 'User tidak dapat dibuat');
        return { success: false, error: 'User tidak dapat dibuat' };
      }

      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: credentials.email,
        name: credentials.name,
        role: 'user',
      });

      if (profileError) {
        console.error('Error membuat profile:', profileError);
      }

      Alert.alert(
        'Registrasi Berhasil',
        'Silakan cek email Anda untuk verifikasi akun. Setelah verifikasi, Anda bisa login.',
        [{ text: 'OK' }],
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registrasi gagal';
      Alert.alert('Registrasi Gagal', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(false);

      Alert.alert(
        'Google Sign-In Belum Tersedia',
        'Fitur Google Sign-In memerlukan konfigurasi tambahan di Supabase Dashboard dan Google Cloud Console. Silakan gunakan email dan password untuk sementara.',
        [{ text: 'OK' }],
      );

      return { success: false, error: 'Feature not configured' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login Google gagal';
      Alert.alert('Login Google Gagal', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Logout Gagal', error.message);
        return { success: false, error: error.message };
      }

      logoutStore();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout gagal';
      Alert.alert('Logout Gagal', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
    initializing,
    login,
    register,
    signInWithGoogle,
    logout,
  };
};
