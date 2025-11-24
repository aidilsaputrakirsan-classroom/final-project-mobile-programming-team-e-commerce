import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

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

  const isAdmin = user?.role === 'admin';

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
            renderItem={renderOrder}
            contentContainerStyle={
              orders.length === 0 ? styles.emptyContent : styles.listContent
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada pesanan"
                message="Pesanan baru akan muncul otomatis di sini."
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
