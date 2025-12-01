import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { OrderCard } from '@/components/orders';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { theme } from '@/theme';
import { OrderStatus, OrderSummary } from '@/types/order';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'semua'>('semua');

  const statusFilters: Array<{ value: OrderStatus | 'semua'; label: string }> = [
    { value: 'semua', label: 'Semua' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'dikirim', label: 'Dikirim' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  // Filter dan search dengan useMemo
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (selectedStatus !== 'semua') {
      result = result.filter((order) => order.status === selectedStatus);
    }

    // Search by order ID, customer name, or items
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_id.toLowerCase().includes(query) ||
          order.customer_name?.toLowerCase().includes(query) ||
          order.items?.some((item) => item.product_name.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [orders, selectedStatus, searchQuery]);

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

  const handleOrderPress = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const renderItem = ({ item }: { item: OrderSummary }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleOrderPress(item.order_id)}
      style={styles.cardWrapper}
    >
      <OrderCard order={item} />
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filterChipsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsContainer}
      >
        {statusFilters.map((filter) => {
          const isActive = selectedStatus === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedStatus(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const listContentStyle =
    filteredOrders.length === 0 ? styles.emptyListContent : styles.listContent;

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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pesanan atau produk..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <X size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Chips */}
        {renderFilterChips()}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading && orders.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.order_id}
            renderItem={renderItem}
            contentContainerStyle={listContentStyle}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <EmptyState
                title={searchQuery || selectedStatus !== 'semua' ? 'Tidak ditemukan' : 'Belum ada pesanan'}
                message={
                  searchQuery || selectedStatus !== 'semua'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Pesanan yang Anda buat akan muncul di sini.'
                }
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
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  filterChipsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: theme.spacing.xs,
  },
  filterChipsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
  cardWrapper: {
    borderRadius: theme.borderRadius.lg,
  },
});
