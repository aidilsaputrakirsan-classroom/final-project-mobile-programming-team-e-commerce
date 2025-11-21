import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { theme } from '@/theme';

interface BrandHeaderProps {
  userName?: string | null;
}

export const BrandHeader = ({ userName }: BrandHeaderProps) => {
  const getFirstName = (email?: string | null) => {
    if (!email) return 'Pengguna';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <View style={styles.brandHeader}>
      <Text style={styles.brandName}>BahanKu</Text>
      <Text style={styles.brandTagline}>Halo {getFirstName(userName)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  brandHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  brandTagline: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
