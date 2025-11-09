import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { theme } from '@/theme';
import { Product } from '@/types/product';

interface ProductGridSectionProps {
  isLoading: boolean;
  error: string | null;
  products: Product[];
  onProductPress: (product: Product) => void;
  onRetry: () => void;
}

export const ProductGridSection = ({
  isLoading,
  error,
  products,
  onProductPress,
  onRetry,
}: ProductGridSectionProps) => {
  return (
    <View style={styles.section}>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <EmptyState title="Belum Ada Produk" message="Produk akan ditampilkan di sini" />
      ) : (
        <View style={styles.productGrid}>
          {products.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.productItem}>
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                image_url={item.image_url}
                stock={item.stock}
                onPress={() => onProductPress(item)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  productItem: {
    width: '48%',
    marginBottom: theme.spacing.lg,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#E5E7EB',
    marginBottom: theme.spacing.sm,
  },
  skeletonLineShort: {
    width: '60%',
    height: 14,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#E5E7EB',
    marginBottom: theme.spacing.xs,
  },
  skeletonLineLong: {
    width: '80%',
    height: 14,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#E5E7EB',
  },
});

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, index) => index);

const ProductGridSkeleton = () => (
  <View style={styles.productGrid}>
    {SKELETON_ITEMS.map((item) => (
      <View key={`skeleton-${item}`} style={styles.productItem}>
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLineShort} />
          <View style={styles.skeletonLineLong} />
        </View>
      </View>
    ))}
  </View>
);
