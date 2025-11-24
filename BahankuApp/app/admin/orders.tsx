import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { OrderStatus, OrderSummary } from '@/types/order';

const statusOptions: OrderStatus[] = ['diproses', 'dikirim', 'selesai', 'dibatalkan'];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrders();

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'semua'>('semua');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'tertinggi'>('terbaru');

  const isAdmin = user?.role === 'admin';

  const statusFilters: Array<{ value: OrderStatus | 'semua'; label: string }> = [
    { value: 'semua', label: 'Semua' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'dikirim', label: 'Dikirim' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  // Filter, search, dan sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (selectedStatus !== 'semua') {
      result = result.filter((order) => order.status === selectedStatus);
    }

    // Search by order ID, customer name, or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_id.toLowerCase().includes(query) ||
          order.customer_name?.toLowerCase().includes(query) ||
          order.customer_email?.toLowerCase().includes(query),
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'terbaru') {
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      } else if (sortBy === 'terlama') {
        return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
      } else {
        // tertinggi
        return b.total_price - a.total_price;
      }
    });

    return result;
  }, [orders, selectedStatus, searchQuery, sortBy]);

  const loadOrders = useCallback(async () => {
    if (!isAdmin) return;
    await fetchAllOrders();
  }, [fetchAllOrders, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = async () => {
    if (!isAdmin) return;
    try {
      setRefreshing(true);
      await fetchAllOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const openStatusModal = (order: OrderSummary) => {
    setSelectedOrder(order);
    setStatusError(null);
    setStatusModalVisible(true);
  };

  const handleStatusSelect = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      setStatusError(null);
      await updateOrderStatus(selectedOrder.order_id, status);
      await fetchAllOrders();
      setStatusModalVisible(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengubah status pesanan';
      setStatusError(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderOrder = ({ item }: { item: OrderSummary }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderTitle}>{item.customer_name || item.customer_email}</Text>
          <Text style={styles.orderSubtitle}>{new Date(item.order_date).toLocaleString('id-ID')}</Text>
        </View>
        <Text style={styles.statusLabel}>{item.status}</Text>
      </View>

      <View style={styles.orderRow}>
        <Text style={styles.orderRowLabel}>Total</Text>
        <Text style={styles.orderRowValue}>{formatCurrency(item.total_price)}</Text>
      </View>
      <View style={styles.orderRow}>
        <Text style={styles.orderRowLabel}>Item</Text>
        <Text style={styles.orderRowValue}>{item.items?.length || 0}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push(`/order/${item.order_id}`)}
        >
          <Text style={styles.linkButtonText}>Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => openStatusModal(item)}>
          <Text style={styles.primaryButtonText}>Ubah Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterChips = () => (
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
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.accessText}>Halaman ini khusus admin.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Kelola Pesanan</Text>
            <Text style={styles.headerSubtitle}>Update status dan lihat detail pesanan</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama customer atau email..."
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
            data={filteredAndSortedOrders}
            keyExtractor={(item) => item.order_id}
            renderItem={renderOrder}
            contentContainerStyle={
              filteredAndSortedOrders.length === 0 ? styles.emptyContent : styles.listContent
            }
            ListEmptyComponent={
              <EmptyState
                title={searchQuery || selectedStatus !== 'semua' ? 'Tidak ditemukan' : 'Belum ada pesanan'}
                message={
                  searchQuery || selectedStatus !== 'semua'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Pesanan baru akan muncul otomatis di sini.'
                }
              />
            }
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

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Status Pesanan</Text>
            <Text style={styles.modalDescription}>
              {selectedOrder ? selectedOrder.customer_name || selectedOrder.order_id : ''}
            </Text>

            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalButton}
                disabled={updatingStatus}
                onPress={() => handleStatusSelect(status)}
              >
                <Text style={styles.modalButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}

            {statusError ? <Text style={styles.errorText}>{statusError}</Text> : null}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStatusModalVisible(false)}
              disabled={updatingStatus}
            >
              <Text style={styles.secondaryButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
  filterChipsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
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
  orderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  orderSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statusLabel: {
    textTransform: 'capitalize',
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderRowLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  orderRowValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  linkButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkButtonText: {
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  modalDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  modalButtonText: {
    textTransform: 'capitalize',
    color: theme.colors.text,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
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
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  accessText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
});
