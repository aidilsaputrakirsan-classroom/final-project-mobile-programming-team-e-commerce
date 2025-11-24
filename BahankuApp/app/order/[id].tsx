import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { OrderItemDetail, OrderSummary } from '@/types/order';

const statusLabel: Record<OrderSummary['status'], string> = {
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return '-';

  try {
    return new Date(isoDate).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const orderIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const orderId = typeof orderIdParam === 'string' ? orderIdParam : '';

  const { getOrderById, loading } = useOrders();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setDetailError('ID pesanan tidak valid');
      setOrder(null);
      return;
    }

    try {
      setDetailError(null);
      const detail = await getOrderById(orderId);
      if (!detail) {
        setDetailError('Pesanan tidak ditemukan');
      }
      setOrder(detail);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal memuat detail pesanan';
      setDetailError(message);
    }
  }, [getOrderById, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrder();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = (item: OrderItemDetail) => (
    <View key={item.product_id} style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product_name}</Text>
        <Text style={styles.itemMeta}>
          {item.quantity} x {formatCurrency(item.price)}
        </Text>
      </View>
      <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Detail Pesanan</Text>
          <Text style={styles.subtitle}>#{orderId || '-'}</Text>
        </View>

        {loading && !order ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
          </View>
        ) : null}

        {detailError ? <Text style={styles.errorText}>{detailError}</Text> : null}

        {order ? (
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Status</Text>
                <Text style={styles.statusBadge}>{statusLabel[order.status]}</Text>
              </View>
              <Text style={styles.sectionValue}>{formatDate(order.order_date)}</Text>
              <Text style={styles.sectionValue}>Total {formatCurrency(order.total_price)}</Text>
            </View>

            {order.shipping_address ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
                <Text style={styles.sectionValue}>{order.shipping_address}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daftar Produk</Text>
              <View style={styles.itemsContainer}>
                {order.items?.length
                  ? order.items.map((item) => renderItem(item))
                  : (
                      <Text style={styles.emptyItemsText}>Tidak ada produk</Text>
                    )}
              </View>
            </View>
          </View>
        ) : null}

        {!order && !loading && !detailError ? (
          <EmptyState
            title="Pesanan belum tersedia"
            message="Coba segarkan halaman ini atau kembali ke daftar pesanan."
          />
        ) : null}
      </ScrollView>
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
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  centerContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  itemsContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  itemMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  itemSubtotal: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyItemsText: {
    textAlign: 'center',
    padding: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
});
