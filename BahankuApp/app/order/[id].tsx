import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, MessageCircle, Package } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { StatusTimeline } from '@/components/orders';
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
    <View key={item.product_id} style={styles.itemCard}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Package size={24} color={theme.colors.textSecondary} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product_name}
        </Text>
        <Text style={styles.itemMeta}>
          {item.quantity} x {formatCurrency(item.price)}
        </Text>
      </View>
      <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
    </View>
  );

  const handleCopyOrderId = () => {
    if (orderId) {
      Clipboard.setString(orderId);
      Alert.alert('Berhasil', 'ID pesanan disalin ke clipboard');
    }
  };

  const handleContactAdmin = () => {
    Alert.alert(
      'Hubungi Admin',
      'Pilih metode untuk menghubungi admin',
      [
        {
          text: 'WhatsApp',
          onPress: () => {
            const whatsappUrl = 'https://wa.me/6281234567890';
            Linking.openURL(whatsappUrl);
          },
        },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header dengan back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Detail Pesanan</Text>
            <Text style={styles.subtitle}>#{orderId || '-'}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {loading && !order ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
            </View>
          ) : null}

          {detailError ? <Text style={styles.errorText}>{detailError}</Text> : null}

          {order ? (
            <>
              {/* Status Timeline */}
              <StatusTimeline currentStatus={order.status} />

              {/* Order Info Card */}
              <View style={styles.card}>
                <View style={styles.orderInfoRow}>
                  <Text style={styles.cardLabel}>Tanggal Pesanan</Text>
                  <Text style={styles.cardValue}>{formatDate(order.order_date)}</Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={styles.cardLabel}>ID Pesanan</Text>
                  <View style={styles.copyRow}>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {orderId}
                    </Text>
                    <TouchableOpacity onPress={handleCopyOrderId} style={styles.copyButton}>
                      <Copy size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Alamat Pengiriman */}
              {order.shipping_address ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Alamat Pengiriman</Text>
                  <Text style={styles.addressText}>{order.shipping_address}</Text>
                </View>
              ) : null}

              {/* Daftar Produk */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Daftar Produk ({order.items?.length || 0})</Text>
                <View style={styles.itemsList}>
                  {order.items?.length ? (
                    order.items.map((item) => renderItem(item))
                  ) : (
                    <Text style={styles.emptyItemsText}>Tidak ada produk</Text>
                  )}
                </View>
              </View>

              {/* Ringkasan Pembayaran */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal Produk</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(order.total_price)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(0)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalValue}>{formatCurrency(order.total_price)}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={handleCopyOrderId}
                  activeOpacity={0.7}
                >
                  <Copy size={20} color={theme.colors.primary} />
                  <Text style={styles.actionButtonSecondaryText}>Salin ID Pesanan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={handleContactAdmin}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonPrimaryText}>Hubungi Admin</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {!order && !loading && !detailError ? (
            <EmptyState
              title="Pesanan belum tersedia"
              message="Coba segarkan halaman ini atau kembali ke daftar pesanan."
            />
          ) : null}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  centerContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    padding: theme.spacing.md,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  copyButton: {
    padding: theme.spacing.xs,
  },
  addressText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  itemsList: {
    gap: theme.spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  itemMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  itemSubtotal: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
    alignSelf: 'center',
  },
  emptyItemsText: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  actionButtonSecondaryText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  actionButtonPrimaryText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
