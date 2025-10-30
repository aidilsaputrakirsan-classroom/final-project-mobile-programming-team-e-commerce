import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase.client';
import { useAuthStore } from '@/store/auth.store';
import { LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { Alert } from 'react-native';

export const useAuth = () => {
  const { user, supabaseUser, isLoading, isAuthenticated, setUser, setLoading, logout: logoutStore } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  // Inisialisasi session saat pertama kali load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error inisialisasi auth:', error);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initializeAuth();

    // Listener untuk perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        logoutStore();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile dari database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Jika user belum ada di tabel users (baru register, email belum diverifikasi)
        // Gunakan data dari auth.users saja
        if (error.code === 'PGRST116') {
          const { data: { user: supaUser } } = await supabase.auth.getUser();
          
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

      const { data: { user: supaUser } } = await supabase.auth.getUser();

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
  };

  // Login dengan email dan password
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
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register user baru
  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      
      // Buat akun di Supabase Auth dengan metadata
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

      // Simpan profile ke tabel users
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: credentials.email,
        name: credentials.name,
        role: 'user',
      });

      if (profileError) {
        console.error('Error membuat profile:', profileError);
        // Tetap lanjutkan karena auth sudah berhasil
      }

      // JANGAN load profile dulu, tunggu sampai email diverifikasi
      // onAuthStateChange akan handle saat user login setelah verifikasi
      
      Alert.alert(
        'Registrasi Berhasil', 
        'Silakan cek email Anda untuk verifikasi akun. Setelah verifikasi, Anda bisa login.',
        [{ text: 'OK' }]
      );
      
      return { success: true };
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      setLoading(false);
      
      // Google Sign-In untuk React Native memerlukan setup khusus
      // Untuk sementara, tampilkan pesan bahwa fitur belum tersedia
      Alert.alert(
        'Google Sign-In Belum Tersedia',
        'Fitur Google Sign-In memerlukan konfigurasi tambahan di Supabase Dashboard dan Google Cloud Console. Silakan gunakan email dan password untuk sementara.',
        [{ text: 'OK' }]
      );
      
      return { success: false, error: 'Feature not configured' };
      
      // TODO: Uncomment code di bawah setelah Google OAuth dikonfigurasi
      /*
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'bahankuapp://auth/callback',
        },
      });

      if (error) {
        Alert.alert('Login Google Gagal', error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
      */
    } catch (error: any) {
      Alert.alert('Login Google Gagal', error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout
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
    } catch (error: any) {
      Alert.alert('Logout Gagal', error.message);
      return { success: false, error: error.message };
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
