import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Komponen skeleton untuk ProductCard
export function ProductCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonLoader height={150} borderRadius={0} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="50%" height={20} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// Komponen skeleton untuk OrderCard
export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height={18} />
          <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
        <SkeletonLoader width={60} height={20} />
      </View>
      <View style={styles.orderRow}>
        <SkeletonLoader width="30%" height={14} />
        <SkeletonLoader width="25%" height={16} />
      </View>
      <View style={styles.orderRow}>
        <SkeletonLoader width="20%" height={14} />
        <SkeletonLoader width="10%" height={16} />
      </View>
      <View style={styles.orderActions}>
        <SkeletonLoader width={80} height={36} borderRadius={theme.borderRadius.md} />
        <SkeletonLoader width={100} height={36} borderRadius={theme.borderRadius.md} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});
