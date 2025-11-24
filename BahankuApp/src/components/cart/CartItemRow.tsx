import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { Trash2 } from 'lucide-react-native';

import { QuantityStepper } from '@/components/QuantityStepper';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { CartItem } from '@/store/cart.store';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onToggleSelect: () => void;
}

export function CartItemRow({ item, onQuantityChange, onRemove, onToggleSelect }: CartItemRowProps) {
  const { product, quantity, selected } = item;
  const subtotal = product.price * quantity;
  const maxQuantity = Math.max(1, product.stock);

  // Tentukan style border berdasarkan status selected
  const dynamicStyle = selected
    ? { borderColor: '#10B981', borderWidth: 2 } // hijau untuk selected
    : {}; // default style untuk unselected

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyle]}
      onPress={onToggleSelect}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={selected ? `${product.name} terpilih, tap untuk batalkan` : `${product.name} tidak terpilih, tap untuk memilih`}
    >
      <Image
        source={{
          uri: product.image_url || 'https://via.placeholder.com/120',
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          </View>

          <View onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              onPress={onRemove}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Hapus ${product.name}`}
            >
              <Trash2 size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View onStartShouldSetResponder={() => true}>
            <QuantityStepper value={quantity} max={maxQuantity} onChange={onQuantityChange} />
          </View>

          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text numberOfLines={1} style={styles.subtotalValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    borderWidth: 0,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  subtotalContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  subtotalLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  subtotalValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    maxWidth: 140,
  },
});