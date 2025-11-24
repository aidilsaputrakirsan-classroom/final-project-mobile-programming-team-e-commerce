import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ListRenderItem,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Square, CheckSquare, MinusSquare } from 'lucide-react-native';

import { CartItemRow } from '@/components/cart';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/libs/currency';
import { CartItem, useCartStore } from '@/store/cart.store';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleSelection = useCartStore((state) => state.toggleSelection);
  const selectAll = useCartStore((state) => state.selectAll);
  const unselectAll = useCartStore((state) => state.unselectAll);
  const getSelectedTotal = useCartStore((state) => state.getSelectedTotal);
  const getSelectedItemCount = useCartStore((state) => state.getSelectedItemCount);
  const getSelectedItemsCount = useCartStore((state) => state.getSelectedItemsCount);
  const getSelectedItems = useCartStore((state) => state.getSelectedItems);
  const { createOrder, loading: orderLoading } = useOrders();

  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const selectedItems = useMemo(() => getSelectedItems(), [items]);
  const selectedTotal = useMemo(() => getSelectedTotal(), [items]);
  const selectedCount = useMemo(() => getSelectedItemCount(), [items]);
  const selectedItemsCount = useMemo(() => getSelectedItemsCount(), [items]);
  const totalItemsCount = items.length;
  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => item.selected),
    [items],
  );
  const someSelected = useMemo(
    () => items.some((item) => item.selected),
    [items],
  );

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Hapus Produk',
      `Yakin ingin menghapus ${item.product.name} dari keranjang?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeItem(item.product.id),
        },
      ],
    );
  };

  const openCheckoutModal = () => {
    if (!user) {
      Alert.alert('Butuh Login', 'Silakan login terlebih dahulu untuk checkout.');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Pilih Produk', 'Pilih minimal satu produk untuk checkout.');
      return;
    }

    setCheckoutVisible(true);
  };

  const closeCheckoutModal = () => {
    if (submitting) {
      return;
    }
    setCheckoutVisible(false);
    setAddressError(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Butuh Login', 'Silakan login terlebih dahulu untuk checkout.');
      return;
    }

    if (!shippingAddress.trim()) {
      setAddressError('Alamat pengiriman wajib diisi');
      return;
    }

    const cartPayload = selectedItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    try {
      setSubmitting(true);
      await createOrder({
        userId: user.id,
        cartItems: cartPayload,
        shippingAddress: shippingAddress.trim(),
      });

      // Hapus hanya item yang sudah di-checkout dari cart
      selectedItems.forEach((item) => removeItem(item.product.id));
      
      setCheckoutVisible(false);
      setShippingAddress('');
      setAddressError(null);

      Alert.alert('Pesanan Berhasil', 'Pesanan Anda sudah dibuat.', [
        {
          text: 'Lihat Pesanan',
          onPress: () => router.push('/(tabs)/orders'),
        },
        { text: 'Tutup', style: 'cancel' },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Checkout gagal diproses.';
      Alert.alert('Checkout Gagal', message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem: ListRenderItem<CartItem> = ({ item }) => (
    <CartItemRow
      item={item}
      // onQuantityChange={(quantity) => updateQuantity(item.product.id, quantity)}
      onQuantityChange={(quantity: number) => updateQuantity(item.product.id, quantity)}
      onRemove={() => handleRemoveItem(item)}
      onToggleSelect={() => toggleSelection(item.product.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <EmptyState
        title="Keranjang kosong"
        message="Belum ada produk dalam keranjang. Yuk mulai belanja bahan segar!"
      />
      <TouchableOpacity
        onPress={() => router.push('/')}
        style={styles.emptyActionButton}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyActionText}>Belanja Sekarang</Text>
      </TouchableOpacity>
    </View>
  );

  const handleToggleSelectAll = () => {
    if (allSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  const renderSelectAllHeader = () => {
    if (items.length === 0) return null;

    return (
      <View style={styles.selectAllContainer}>
        <TouchableOpacity
          onPress={handleToggleSelectAll}
          style={styles.selectAllButton}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allSelected }}
          accessibilityLabel="Pilih semua produk"
        >
          {allSelected ? (
            <CheckSquare size={24} color={theme.colors.primary} />
          ) : someSelected ? (
            <MinusSquare size={24} color={theme.colors.primary} />
          ) : (
            <Square size={24} color={theme.colors.textSecondary} />
          )}
          <Text style={styles.selectAllText}>Pilih Semua</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keranjang</Text>
          {items.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {selectedItemsCount} item dipilih dari {totalItemsCount} item
            </Text>
          )}
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.product.id}
          renderItem={renderItem}
          ListHeaderComponent={renderSelectAllHeader}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.summaryContainer}>
          <View>
            <Text style={styles.summaryLabel}>Total Pembayaran</Text>
            <Text style={styles.summaryValue}>{formatCurrency(selectedTotal)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (selectedItems.length === 0 || orderLoading || submitting) &&
                styles.checkoutButtonDisabled,
            ]}
            onPress={openCheckoutModal}
            disabled={selectedItems.length === 0 || orderLoading || submitting}
            activeOpacity={0.8}
          >
            {orderLoading || submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutText}>Checkout</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={checkoutVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCheckoutModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Konfirmasi Checkout</Text>
              <Text style={styles.modalSubtitle}>
                Total {formatCurrency(selectedTotal)} untuk {selectedCount} item
              </Text>

              <Text style={styles.inputLabel}>Alamat Pengiriman</Text>
              <TextInput
                style={[
                  styles.textInput,
                  addressError && styles.textInputError,
                ]}
                placeholder="Masukkan alamat lengkap"
                placeholderTextColor={theme.colors.textSecondary}
                value={shippingAddress}
                onChangeText={(text) => {
                  setShippingAddress(text);
                  if (addressError) {
                    setAddressError(null);
                  }
                }}
                multiline
                numberOfLines={4}
              />
              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={closeCheckoutModal}
                  disabled={submitting}
                >
                  <Text style={styles.modalButtonSecondaryText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonPrimary,
                    submitting && styles.checkoutButtonDisabled,
                  ]}
                  onPress={handleCheckout}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonPrimaryText}>Buat Pesanan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2.4,
    gap: theme.spacing.md,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: theme.spacing.sm,
  },
  selectAllContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectAllText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  emptyStateContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyActionButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  summaryContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
    color: theme.colors.text,
  },
  textInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButtonSecondary: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonSecondaryText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  modalButtonPrimary: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});