import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  discountPercent?: number;
  discountedPrice?: number;
  onPress?: () => void;
}

export function ProductCard({
  name,
  price,
  image_url,
  stock,
  discountPercent,
  discountedPrice,
  onPress,
}: ProductCardProps) {
  const isOutOfStock = stock <= 0;
  const hasDiscount = discountPercent && discountPercent > 0 && discountedPrice;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isOutOfStock && styles.outOfStock,
      ]}
      onPress={onPress}
      disabled={isOutOfStock}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: image_url || 'https://via.placeholder.com/150',
          }}
          style={[styles.image, isOutOfStock && styles.imageDisabled]}
          resizeMode="cover"
        />
        {hasDiscount && !isOutOfStock ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        ) : null}
        {isOutOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Habis</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.name, isOutOfStock && styles.textDisabled]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
        {hasDiscount ? (
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{formatCurrency(price)}</Text>
            <Text style={[styles.price, isOutOfStock && styles.textDisabled]}>
              {formatCurrency(discountedPrice)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.price, isOutOfStock && styles.textDisabled]}>
            {formatCurrency(price)}
          </Text>
        )}
        <Text style={[styles.stock, isOutOfStock && styles.stockEmpty]}>
          {isOutOfStock ? 'Stok Habis' : `Stok: ${stock}`}
        </Text>
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
  outOfStock: {
    opacity: 0.8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.border,
  },
  imageDisabled: {
    opacity: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
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
  priceContainer: {
    marginBottom: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
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
  stockEmpty: {
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
  },
  textDisabled: {
    color: theme.colors.textSecondary,
  },
});
