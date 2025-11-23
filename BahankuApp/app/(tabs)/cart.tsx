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
  const { createOrder, loading: orderLoading } = useOrders();

  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
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

    if (items.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dulu.');
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

    const cartPayload = items.map((item) => ({
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

      clearCart();
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
      onQuantityChange={(quantity) => updateQuantity(item.product.id, quantity)}
      onRemove={() => handleRemoveItem(item)}
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keranjang</Text>
          {items.length > 0 && (
            <Text style={styles.headerSubtitle}>{itemCount} item</Text>
          )}
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.product.id}
          renderItem={renderItem}
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
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (items.length === 0 || orderLoading || submitting) &&
                styles.checkoutButtonDisabled,
            ]}
            onPress={openCheckoutModal}
            disabled={items.length === 0 || orderLoading || submitting}
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
                Total {formatCurrency(totalAmount)} untuk {itemCount} item
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
