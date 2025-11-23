import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { formatCurrency } from '@/libs/currency';
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
  diproses: '#f59e0b',
  dikirim: '#3b82f6',
  selesai: '#10b981',
  dibatalkan: '#ef4444',
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
  const itemCount = order.items?.length || 0;
  const mainItemName = order.items?.[0]?.product_name ?? 'Pesanan';
  const extraCount = itemCount > 1 ? itemCount - 1 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.titleContainer}>
          <Text style={styles.orderId}>
            {mainItemName}
            {extraCount > 0 ? ` +${extraCount} item` : ''}
          </Text>
          <Text style={styles.dateText}>{formatDate(order.order_date)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{statusLabel[order.status]}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(order.total_price)}</Text>
      </View>

      <Text style={styles.itemLabel}>{itemCount} item</Text>

      {order.shipping_address ? (
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Alamat Pengiriman</Text>
          <Text style={styles.addressValue}>{order.shipping_address}</Text>
        </View>
      ) : null}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  dateText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  badge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  itemLabel: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  addressContainer: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  addressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  addressValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
