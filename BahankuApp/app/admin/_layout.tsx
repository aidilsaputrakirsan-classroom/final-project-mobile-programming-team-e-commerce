import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';

export default function AdminLayout() {
  const { user, initializing } = useAuth();

  // Tampilkan loading hanya saat pertama kali mengecek auth
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Redirect ke home jika bukan admin
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
