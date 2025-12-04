import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Percent,
  X,
  Calendar,
  Package,
  Clock,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/libs/currency';
import { supabase } from '@/services/supabase.client';
import { theme } from '@/theme';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface Discount {
  id: string;
  product_id: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  product?: Product;
}

export default function AdminDiscountsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Product picker modal
  const [showProductPicker, setShowProductPicker] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchDiscounts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('product_discounts')
        .select(`
          *,
          product:products(id, name, price, image_url)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDiscounts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat diskon';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        fetchDiscounts();
        fetchProducts();
      }
    }, [fetchDiscounts, fetchProducts, isAdmin]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDiscounts();
    setRefreshing(false);
  };

  // Format tanggal ke YYYY-MM-DD
  const formatDateInput = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Parse input tanggal
  const parseDateInput = (input: string): string | null => {
    if (!input) return null;
    // Format: YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(input)) return null;
    const date = new Date(input + 'T00:00:00Z');
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const openAddModal = () => {
    setEditingDiscount(null);
    setSelectedProduct(null);
    setDiscountPercent('');
    // Default tanggal: hari ini sampai 7 hari ke depan
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setSelectedProduct(discount.product || null);
    setDiscountPercent(discount.discount_percent.toString());
    setStartDate(formatDateInput(discount.start_date));
    setEndDate(formatDateInput(discount.end_date));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Pilih produk terlebih dahulu');
      return;
    }

    const percent = parseInt(discountPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      Alert.alert('Error', 'Persentase diskon harus antara 1-100%');
      return;
    }

    const parsedStart = parseDateInput(startDate);
    const parsedEnd = parseDateInput(endDate);

    if (!parsedStart || !parsedEnd) {
      Alert.alert('Error', 'Format tanggal tidak valid (YYYY-MM-DD)');
      return;
    }

    if (new Date(parsedEnd) <= new Date(parsedStart)) {
      Alert.alert('Error', 'Tanggal berakhir harus setelah tanggal mulai');
      return;
    }

    setSaving(true);
    try {
      if (editingDiscount) {
        const { error: updateError } = await supabase
          .from('product_discounts')
          .update({
            product_id: selectedProduct.id,
            discount_percent: percent,
            start_date: parsedStart,
            end_date: parsedEnd,
          })
          .eq('id', editingDiscount.id);

        if (updateError) throw updateError;
        Alert.alert('Berhasil', 'Diskon berhasil diperbarui');
      } else {
        const { error: insertError } = await supabase
          .from('product_discounts')
          .insert({
            product_id: selectedProduct.id,
            discount_percent: percent,
            start_date: parsedStart,
            end_date: parsedEnd,
          });

        if (insertError) throw insertError;
        Alert.alert('Berhasil', 'Diskon berhasil ditambahkan');
      }

      setShowModal(false);
      fetchDiscounts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan diskon';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (discount: Discount) => {
    Alert.alert(
      'Hapus Diskon',
      `Apakah Anda yakin ingin menghapus diskon ${discount.discount_percent}% untuk "${discount.product?.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: deleteError } = await supabase
                .from('product_discounts')
                .delete()
                .eq('id', discount.id);

              if (deleteError) throw deleteError;

              Alert.alert('Berhasil', 'Diskon berhasil dihapus');
              fetchDiscounts();
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus diskon';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
    );
  };

  const toggleActive = async (discount: Discount) => {
    try {
      const { error: updateError } = await supabase
        .from('product_discounts')
        .update({ is_active: !discount.is_active })
        .eq('id', discount.id);

      if (updateError) throw updateError;
      fetchDiscounts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengubah status';
      Alert.alert('Error', errorMessage);
    }
  };

  // Cek status diskon
  const getDiscountStatus = (discount: Discount): { label: string; color: string } => {
    if (!discount.is_active) {
      return { label: 'Nonaktif', color: theme.colors.textSecondary };
    }
    
    const now = new Date();
    const start = new Date(discount.start_date);
    const end = new Date(discount.end_date);

    if (now < start) {
      return { label: 'Belum Mulai', color: theme.colors.warning };
    }
    if (now > end) {
      return { label: 'Berakhir', color: theme.colors.error };
    }
    return { label: 'Aktif', color: theme.colors.success };
  };

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderDiscountItem = ({ item }: { item: Discount }) => {
    const status = getDiscountStatus(item);
    const originalPrice = item.product?.price || 0;
    const discountedPrice = Math.round(originalPrice * (1 - item.discount_percent / 100));

    return (
      <View style={styles.discountCard}>
        <View style={styles.discountHeader}>
          {item.product?.image_url ? (
            <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Package size={24} color={theme.colors.textSecondary} />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.product?.name || 'Produk tidak ditemukan'}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>{formatCurrency(originalPrice)}</Text>
              <Text style={styles.discountedPrice}>{formatCurrency(discountedPrice)}</Text>
            </View>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{item.discount_percent}%</Text>
          </View>
        </View>

        <View style={styles.discountDetails}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>
              {formatDisplayDate(item.start_date)} - {formatDisplayDate(item.end_date)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
            <Clock size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.discountActions}>
          <TouchableOpacity
            style={[styles.toggleButton, !item.is_active && styles.toggleButtonInactive]}
            onPress={() => toggleActive(item)}
          >
            <Text style={[styles.toggleButtonText, !item.is_active && styles.toggleButtonTextInactive]}>
              {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <Edit2 size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
            <Trash2 size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Cek apakah user adalah admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kelola Diskon</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.notAdminContainer}>
          <Text style={styles.notAdminText}>
            Anda tidak memiliki akses ke halaman ini.
          </Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.back()}>
            <Text style={styles.backHomeButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Diskon</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Percent size={18} color={theme.colors.primary} />
          <Text style={styles.statValue}>{discounts.length}</Text>
          <Text style={styles.statLabel}>Total Diskon</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={18} color={theme.colors.success} />
          <Text style={styles.statValue}>
            {discounts.filter((d) => getDiscountStatus(d).label === 'Aktif').length}
          </Text>
          <Text style={styles.statLabel}>Sedang Aktif</Text>
        </View>
      </View>

      {/* Discount List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat diskon...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDiscounts}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : discounts.length === 0 ? (
        <EmptyState
          title="Belum Ada Diskon"
          message="Buat diskon pertama Anda untuk menarik pembeli"
          icon={<Percent size={64} color={theme.colors.textSecondary} />}
          actionLabel="Tambah Diskon"
          onAction={openAddModal}
        />
      ) : (
        <FlatList
          data={discounts}
          keyExtractor={(item) => item.id}
          renderItem={renderDiscountItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDiscount ? 'Edit Diskon' : 'Tambah Diskon'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Product Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Produk *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowProductPicker(true)}
                >
                  {selectedProduct ? (
                    <View style={styles.selectedProductRow}>
                      {selectedProduct.image_url ? (
                        <Image
                          source={{ uri: selectedProduct.image_url }}
                          style={styles.selectedProductImage}
                        />
                      ) : (
                        <View style={[styles.selectedProductImage, styles.productImagePlaceholder]}>
                          <Package size={16} color={theme.colors.textSecondary} />
                        </View>
                      )}
                      <Text style={styles.selectedProductName} numberOfLines={1}>
                        {selectedProduct.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Pilih produk...</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Discount Percent */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Persentase Diskon (%) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 20"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={discountPercent}
                  onChangeText={setDiscountPercent}
                  keyboardType="number-pad"
                />
                {selectedProduct && discountPercent ? (
                  <Text style={styles.previewText}>
                    Harga setelah diskon:{' '}
                    {formatCurrency(
                      Math.round(selectedProduct.price * (1 - parseInt(discountPercent, 10) / 100)),
                    )}
                  </Text>
                ) : null}
              </View>

              {/* Start Date */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tanggal Mulai (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-01-01"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              {/* End Date */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tanggal Berakhir (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-01-07"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Product Picker Modal */}
      <Modal
        visible={showProductPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProductPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowProductPicker(false)}>
          <Pressable
            style={[styles.modalContainer, styles.pickerModal]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Produk</Text>
              <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productPickerItem}
                  onPress={() => {
                    setSelectedProduct(item);
                    setShowProductPicker(false);
                  }}
                >
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.productPickerImage} />
                  ) : (
                    <View style={[styles.productPickerImage, styles.productImagePlaceholder]}>
                      <Package size={20} color={theme.colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.productPickerInfo}>
                    <Text style={styles.productPickerName}>{item.name}</Text>
                    <Text style={styles.productPickerPrice}>{formatCurrency(item.price)}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.pickerSeparator} />}
              contentContainerStyle={styles.pickerListContent}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FB',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 4,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.sm,
  },
  discountCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  productName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  discountBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  discountBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  discountDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  discountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.warning}15`,
    alignItems: 'center',
  },
  toggleButtonInactive: {
    backgroundColor: `${theme.colors.success}15`,
  },
  toggleButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.warning,
  },
  toggleButtonTextInactive: {
    color: theme.colors.success,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  pickerModal: {
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  previewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  pickerPlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  selectedProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectedProductImage: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
  },
  selectedProductName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  saveButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  notAdminContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  notAdminText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  backHomeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  backHomeButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  productPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  productPickerImage: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
  },
  productPickerInfo: {
    flex: 1,
  },
  productPickerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  productPickerPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pickerSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  pickerListContent: {
    paddingBottom: theme.spacing.md,
  },
});
