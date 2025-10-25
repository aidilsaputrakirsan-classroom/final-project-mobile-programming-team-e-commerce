import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/theme';
import { formatCurrency } from '@/libs/currency';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  onPress?: () => void;
}

export function ProductCard({
  name,
  price,
  image_url,
  stock,
  onPress,
}: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image
        source={{
          uri: image_url || 'https://via.placeholder.com/150',
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>{formatCurrency(price)}</Text>
        <Text style={styles.stock}>Stok: {stock > 0 ? stock : 'Habis'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  stock: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
