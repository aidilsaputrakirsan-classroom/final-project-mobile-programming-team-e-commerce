import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { OrderCard } from '@/components/orders';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { theme } from '@/theme';
import { OrderSummary } from '@/types/order';

export default function OrdersScreen() {
  const { user } = useAuth();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    await fetchOrders(user.id);
  }, [user, fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      await fetchOrders(user.id);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: OrderSummary }) => (
    <OrderCard order={item} />
  );

  const listContentStyle =
    orders.length === 0 ? styles.emptyListContent : styles.listContent;

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pesanan</Text>
          </View>
          <View style={styles.centerContent}>
            <Text style={styles.infoText}>Silakan login untuk melihat pesanan.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pesanan</Text>
          <Text style={styles.headerSubtitle}>Riwayat pesanan Anda</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading && orders.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id}
            renderItem={renderItem}
            contentContainerStyle={listContentStyle}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <EmptyState
                title="Belum ada pesanan"
                message="Pesanan yang Anda buat akan muncul di sini."
              />
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  separator: {
    height: theme.spacing.md,
  },
});
