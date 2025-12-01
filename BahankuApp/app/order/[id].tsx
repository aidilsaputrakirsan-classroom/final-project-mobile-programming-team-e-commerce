import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  HelpCircle,
  RotateCcw,
} from 'lucide-react-native';
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

import { EmptyState } from '@/components/EmptyState';
import { StatusTimeline } from '@/components/orders';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/libs/currency';
import { formatOrderId } from '@/libs/orderId';
import { theme } from '@/theme';
import { OrderItemDetail, OrderSummary } from '@/types/order';

// Status badge colors
const statusColors: Record<OrderSummary['status'], { bg: string; text: string }> = {
  diproses: { bg: '#FEF3C7', text: '#D97706' },
  dikirim: { bg: '#DBEAFE', text: '#2563EB' },
  selesai: { bg: '#D1FAE5', text: '#059669' },
  dibatalkan: { bg: '#FEE2E2', text: '#DC2626' },
};

const statusLabel: Record<OrderSummary['status'], string> = {
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

const _formatDate = (isoDate?: string) => {
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

const formatShortDate = (isoDate?: string) => {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
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
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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
      const message = err instanceof Error ? err.message : 'Gagal memuat detail pesanan';
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

  const handleCopyOrderId = () => {
    if (orderId) {
      Clipboard.setString(orderId);
      Alert.alert('Berhasil', 'No. Pesanan disalin ke clipboard');
    }
  };

  const handleContactAdmin = () => {
    Alert.alert('Hubungi Admin', 'Pilih metode untuk menghubungi admin', [
      {
        text: 'WhatsApp',
        onPress: () => {
          const whatsappUrl = 'https://wa.me/6281234567890';
          Linking.openURL(whatsappUrl);
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Segera Hadir', `Fitur ${feature} akan segera tersedia.`);
  };

  // Render product item
  const renderItem = (item: OrderItemDetail, isLast: boolean) => (
    <View
      key={item.product_id}
      style={[styles.productItem, !isLast && styles.productItemBorder]}
    >
      <View style={styles.productImageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Package size={20} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product_name}
        </Text>
        <Text style={styles.productQty}>x{item.quantity}</Text>
      </View>
      <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
    </View>
  );

  // Calculate subtotal
  const subtotalProduk = order?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rincian Pesanan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
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
              {/* Status Banner */}
              <View
                style={[
                  styles.statusBanner,
                  { backgroundColor: statusColors[order.status].bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusBannerText,
                    { color: statusColors[order.status].text },
                  ]}
                >
                  Pesanan {statusLabel[order.status]}
                </Text>
              </View>

              {/* Status Timeline */}
              <StatusTimeline currentStatus={order.status} />

              {/* Alamat Pengiriman */}
              {order.shipping_address ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
                  <View style={styles.addressRow}>
                    <MapPin
                      size={16}
                      color={theme.colors.textSecondary}
                      style={styles.addressIcon}
                    />
                    <Text style={styles.addressText}>{order.shipping_address}</Text>
                  </View>
                </View>
              ) : null}

              {/* Daftar Produk */}
              <View style={styles.card}>
                <View style={styles.productHeader}>
                  <Text style={styles.sectionTitle}>Daftar Produk</Text>
                </View>
                {order.items?.length ? (
                  order.items.map((item, index) =>
                    renderItem(item, index === order.items.length - 1),
                  )
                ) : (
                  <Text style={styles.emptyText}>Tidak ada produk</Text>
                )}

                {/* Total Pesanan - Collapsible */}
                <TouchableOpacity
                  style={styles.totalRow}
                  onPress={() => setShowPaymentDetails(!showPaymentDetails)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.totalLabel}>Total Pesanan:</Text>
                  <View style={styles.totalValueRow}>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.total_price)}
                    </Text>
                    {showPaymentDetails ? (
                      <ChevronUp size={18} color={theme.colors.textSecondary} />
                    ) : (
                      <ChevronDown size={18} color={theme.colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Payment Details Dropdown */}
                {showPaymentDetails ? (
                  <View style={styles.paymentDetails}>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Subtotal Produk</Text>
                      <Text style={styles.paymentValue}>
                        {formatCurrency(subtotalProduk)}
                      </Text>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Ongkos Kirim</Text>
                      <Text style={styles.paymentValue}>{formatCurrency(0)}</Text>
                    </View>
                    <View style={styles.paymentDivider} />
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentTotalLabel}>Total Pembayaran</Text>
                      <Text style={styles.paymentTotalValue}>
                        {formatCurrency(order.total_price)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Butuh Bantuan Section */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Butuh Bantuan?</Text>

                <TouchableOpacity
                  style={styles.helpItem}
                  onPress={() => handleComingSoon('Ajukan Pengembalian')}
                >
                  <RotateCcw size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.helpItemText}>Ajukan Pengembalian</Text>
                  <ChevronDown
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.helpChevron}
                  />
                </TouchableOpacity>

                <View style={styles.helpDivider} />

                <TouchableOpacity style={styles.helpItem} onPress={handleContactAdmin}>
                  <MessageCircle size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.helpItemText}>Hubungi Admin</Text>
                  <ChevronDown
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.helpChevron}
                  />
                </TouchableOpacity>

                <View style={styles.helpDivider} />

                <TouchableOpacity
                  style={styles.helpItem}
                  onPress={() => handleComingSoon('Pusat Bantuan')}
                >
                  <HelpCircle size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.helpItemText}>Pusat Bantuan</Text>
                  <ChevronDown
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.helpChevron}
                  />
                </TouchableOpacity>
              </View>

              {/* Order Info - Collapsible */}
              <View style={styles.card}>
                <View style={styles.orderInfoHeader}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderIdLabel}>No. Pesanan</Text>
                    <Text style={styles.orderIdValue}>{formatOrderId(orderId)}</Text>
                    <TouchableOpacity
                      onPress={handleCopyOrderId}
                      style={styles.copyButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.copyButtonText}>Salin</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setShowOrderDetails(!showOrderDetails)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewMoreText}>
                    {showOrderDetails ? 'Lihat Lebih Sedikit' : 'Lihat Semua'}
                  </Text>
                  {showOrderDetails ? (
                    <ChevronUp size={16} color={theme.colors.textSecondary} />
                  ) : (
                    <ChevronDown size={16} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {showOrderDetails ? (
                  <View style={styles.orderDetailsExpanded}>
                    <View style={styles.orderDetailRow}>
                      <Text style={styles.orderDetailLabel}>ID Lengkap</Text>
                      <Text style={styles.orderDetailValue} selectable>
                        {orderId}
                      </Text>
                    </View>
                    <View style={styles.orderDetailRow}>
                      <Text style={styles.orderDetailLabel}>Waktu Pemesanan</Text>
                      <Text style={styles.orderDetailValue}>
                        {formatShortDate(order.order_date)}
                      </Text>
                    </View>
                    {order.updated_at ? (
                      <View style={styles.orderDetailRow}>
                        <Text style={styles.orderDetailLabel}>Terakhir Diperbarui</Text>
                        <Text style={styles.orderDetailValue}>
                          {formatShortDate(order.updated_at)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
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

        {/* Bottom Action Buttons */}
        {order ? (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCopyOrderId}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Salin No. Pesanan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContactAdmin}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Hubungi Admin</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xl,
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

  // Status Banner
  statusBanner: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statusBannerText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginTop: 2,
    marginRight: theme.spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },

  // Products
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productImageContainer: {
    marginRight: theme.spacing.md,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  productQty: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  productPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },

  // Total Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  totalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },

  // Payment Details
  paymentDetails: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  paymentLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paymentValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  paymentTotalLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  paymentTotalValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },

  // Help Section
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  helpItemText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  helpChevron: {
    transform: [{ rotate: '-90deg' }],
  },
  helpDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 36,
  },

  // Order Info
  orderInfoHeader: {
    marginBottom: theme.spacing.sm,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  orderIdValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  copyButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
  },
  copyButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },
  viewMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  viewMoreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  orderDetailsExpanded: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  orderDetailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  orderDetailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  // Empty
  emptyText: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
