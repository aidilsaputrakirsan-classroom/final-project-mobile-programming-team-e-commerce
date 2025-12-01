import { Package, MapPin } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { formatCurrency } from '@/libs/currency';
import { formatOrderId } from '@/libs/orderId';
import { theme } from '@/theme';
import { OrderStatus, OrderSummary } from '@/types/order';

interface OrderCardProps {
  order: OrderSummary;
}

const statusLabel: Record<OrderStatus, string> = {
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

const statusColor: Record<OrderStatus, string> = {
  diproses: '#F59E0B',
  dikirim: '#3B82F6',
  selesai: '#10B981',
  dibatalkan: '#EF4444',
};

const statusBgColor: Record<OrderStatus, string> = {
  diproses: '#FEF3C7',
  dikirim: '#DBEAFE',
  selesai: '#D1FAE5',
  dibatalkan: '#FEE2E2',
};

const formatDate = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

export function OrderCard({ order }: OrderCardProps) {
  const badgeColor = statusColor[order.status] || theme.colors.primary;
  const badgeBgColor = statusBgColor[order.status] || theme.colors.border;
  const itemCount = order.items?.length || 0;
  const mainItem = order.items?.[0];
  const extraCount = itemCount > 1 ? itemCount - 1 : 0;

  return (
    <View style={styles.card}>
      {/* Header dengan Order ID dan status */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderIdText}>#{formatOrderId(order.order_id)}</Text>
          <Text style={styles.dateSeparator}>•</Text>
          <Text style={styles.dateText}>{formatDate(order.order_date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badgeBgColor }]}>
          <Text style={[styles.statusText, { color: badgeColor }]}>
            {statusLabel[order.status]}
          </Text>
        </View>
      </View>

      {/* Item preview dengan gambar */}
      <View style={styles.itemPreview}>
        {mainItem?.image_url ? (
          <Image
            source={{ uri: mainItem.image_url }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Package size={24} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {mainItem?.product_name || 'Pesanan'}
          </Text>
          <View style={styles.itemMeta}>
            <Package size={14} color={theme.colors.textSecondary} />
            <Text style={styles.itemMetaText}>
              {itemCount} item{extraCount > 0 ? ` (+${extraCount} lainnya)` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Alamat pengiriman */}
      {order.shipping_address ? (
        <View style={styles.addressRow}>
          <MapPin size={14} color={theme.colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {order.shipping_address}
          </Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* Footer dengan total */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total_price)}</Text>
        </View>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>Lihat Detail</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  orderIdText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  dateSeparator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  dateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  itemPreview: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  itemMetaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  addressText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  ctaButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  ctaText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
