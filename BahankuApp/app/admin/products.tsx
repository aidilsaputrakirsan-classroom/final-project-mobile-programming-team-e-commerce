import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  MoreVertical,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { Product } from '@/types/product';

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'stock_asc'
  | 'stock_desc'
  | 'newest'
  | 'oldest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name_asc', label: 'Nama A-Z' },
  { value: 'name_desc', label: 'Nama Z-A' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'stock_asc', label: 'Stok Terendah' },
  { value: 'stock_desc', label: 'Stok Tertinggi' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

// Memoized ProductItem component untuk optimize re-render
interface ProductItemProps {
  item: Product;
  isDeleting: boolean;
  onMenuPress: (product: Product) => void;
}

const ProductItem = memo(({ item, isDeleting, onMenuPress }: ProductItemProps) => {
  return (
    <View style={styles.productCard}>
      <Image
        source={{
          uri: item.image_url || 'https://via.placeholder.com/100x100?text=No+Image',
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {item.category || 'Tanpa Kategori'}
        </Text>
        <View style={styles.stockContainer}>
          <View
            style={[
              styles.stockBadge,
              item.stock > 0 ? styles.stockAvailable : styles.stockEmpty,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                item.stock > 0 ? styles.stockTextAvailable : styles.stockTextEmpty,
              ]}
            >
              Stok {item.stock}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => onMenuPress(item)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
        ) : (
          <MoreVertical size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function AdminProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, error, fetchProducts, deleteProduct } = useProducts();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Filter dan sort produk
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query),
      );
    }

    // Sort berdasarkan opsi yang dipilih
    switch (sortOption) {
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock_desc':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
        );
        break;
    }

    return result;
  }, [products, searchQuery, sortOption]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortOption)?.label || 'Urutkan';

  const loadProducts = useCallback(async () => {
    if (!isAdmin) return;
    await fetchProducts();
  }, [fetchProducts, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const handleRefresh = async () => {
    if (!isAdmin) return;
    try {
      setRefreshing(true);
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddProduct = () => {
    router.push('/admin/product-form');
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/product-form?id=${productId}`);
  };

  const handleDeleteProduct = (product: Product) => {
    setMenuVisible(false);
    // Delay alert untuk memberi waktu modal close animation
    InteractionManager.runAfterInteractions(() => {
      Alert.alert('Hapus Produk', `Apakah Anda yakin ingin menghapus "${product.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(product.id);
              const success = await deleteProduct(product.id);
              if (success) {
                Alert.alert('Berhasil', 'Produk berhasil dihapus');
              } else {
                Alert.alert('Gagal', 'Gagal menghapus produk');
              }
            } catch {
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus produk');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    });
  };

  // Simplified menu handler - tidak perlu event coordinates
  const openMenu = useCallback((product: Product) => {
    setSelectedProduct(product);
    setMenuVisible(true);
  }, []);

  const handleEditFromMenu = useCallback(() => {
    if (selectedProduct) {
      const productId = selectedProduct.id;
      setMenuVisible(false);
      // Delay navigation untuk memberi waktu modal close
      InteractionManager.runAfterInteractions(() => {
        router.push(`/admin/product-form?id=${productId}`);
      });
    }
  }, [selectedProduct, router]);

  const handleDeleteFromMenu = useCallback(() => {
    if (selectedProduct) {
      handleDeleteProduct(selectedProduct);
    }
  }, [selectedProduct]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => {
    return (
      <ProductItem
        item={item}
        isDeleting={deletingId === item.id}
        onMenuPress={openMenu}
      />
    );
  }, [deletingId, openMenu]);

  // Cek apakah user adalah admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kelola Produk</Text>
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
        <Text style={styles.headerTitle}>Kelola Produk</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <ArrowUpDown size={16} color={theme.colors.primary} />
          <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats - Compact Modern Style */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Package size={18} color={theme.colors.textSecondary} />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Produk</Text>
        </View>
        <View style={styles.statItem}>
          <CheckCircle size={18} color={theme.colors.success} />
          <Text style={[styles.statValue, styles.statValueSuccess]}>
            {products.filter((p) => p.stock > 0).length}
          </Text>
          <Text style={styles.statLabel}>Tersedia</Text>
        </View>
        <View style={styles.statItem}>
          <AlertCircle size={18} color={theme.colors.error} />
          <Text style={[styles.statValue, styles.statValueError]}>
            {products.filter((p) => p.stock === 0).length}
          </Text>
          <Text style={styles.statLabel}>Habis</Text>
        </View>
      </View>

      {/* Product List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
          message={
            searchQuery
              ? 'Coba kata kunci lain atau hapus pencarian'
              : 'Tambahkan produk pertama Anda'
          }
          actionLabel={!searchQuery ? 'Tambah Produk' : undefined}
          onAction={!searchQuery ? handleAddProduct : undefined}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
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

      {/* Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditFromMenu}>
              <Text style={styles.menuItemText}>Edit Produk</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteFromMenu}>
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Hapus Produk
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.sortModalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContainer}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Urutkan Berdasarkan</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sortOptionsList}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOptionItem,
                    sortOption === option.value && styles.sortOptionItemActive,
                  ]}
                  onPress={() => {
                    setSortOption(option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortOption === option.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortOption === option.value && (
                    <CheckCircle size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  sortButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
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
  statValueSuccess: {
    color: theme.colors.success,
  },
  statValueError: {
    color: theme.colors.error,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
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
    height: theme.spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  productInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  productPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  productCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  stockContainer: {
    flexDirection: 'row',
  },
  stockBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  stockAvailable: {
    backgroundColor: '#D1FAE5',
  },
  stockEmpty: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  stockTextAvailable: {
    color: '#059669',
  },
  stockTextEmpty: {
    color: '#DC2626',
  },
  menuButton: {
    padding: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    width: 200,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  menuItemTextDanger: {
    color: theme.colors.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
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
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sortModalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '60%',
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sortModalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sortOptionsList: {
    paddingVertical: theme.spacing.sm,
  },
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sortOptionItemActive: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  sortOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  sortOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
