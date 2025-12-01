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
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { Product } from '@/types/product';

export default function AdminProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, error, fetchProducts, deleteProduct } = useProducts();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const menuPosition = useRef({ x: 0, y: 0 });

  const isAdmin = user?.role === 'admin';

  // Filter produk berdasarkan search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

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
  };

  const openMenu = (product: Product, event: { nativeEvent: { pageX: number; pageY: number } }) => {
    menuPosition.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    setSelectedProduct(product);
    setMenuVisible(true);
  };

  const handleEditFromMenu = () => {
    if (selectedProduct) {
      setMenuVisible(false);
      router.push(`/admin/product-form?id=${selectedProduct.id}`);
    }
  };

  const handleDeleteFromMenu = () => {
    if (selectedProduct) {
      handleDeleteProduct(selectedProduct);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isDeleting = deletingId === item.id;

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
          onPress={(event) => openMenu(item, event)}
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
  };

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
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Hapus Produk</Text>
            </TouchableOpacity>
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
});
