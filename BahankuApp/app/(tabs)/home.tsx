import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import {
  Search,
  ShoppingCart,
  Heart,
  Plus,
  Leaf,
  Apple,
  Beef,
  Fish,
  Package,
  Milk,
} from 'lucide-react-native';
import { useProducts, type Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/libs/currency';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Data Kategori
const CATEGORIES = [
  { id: '1', name: 'Sayuran', icon: Leaf, color: '#4CAF50' },
  { id: '2', name: 'Buah', icon: Apple, color: '#FF5722' },
  { id: '3', name: 'Daging', icon: Beef, color: '#E91E63' },
  { id: '4', name: 'Seafood', icon: Fish, color: '#2196F3' },
  { id: '5', name: 'Kering', icon: Package, color: '#9C27B0' },
  { id: '6', name: 'Susu', icon: Milk, color: '#00BCD4' },
];

// Product Card Component
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isLowStock = product.stock < 10;

  return (
    <TouchableOpacity onPress={onClick} style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Text style={styles.productEmoji}>{product.image}</Text>
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          style={styles.favoriteButton}
        >
          <Heart size={16} color={isFavorite ? '#EF4444' : '#999'} fill={isFavorite ? '#EF4444' : 'none'} />
        </TouchableOpacity>
        {isLowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Stok Terbatas</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.productBottom}>
          <View>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
            <Text style={styles.productStock}>Stok: {product.stock}</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { getProducts, loading, error } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadProducts} style={styles.retryButton}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Selamat Datang!</Text>
              <Text style={styles.headerSubtitle}>Mau belanja apa hari ini?</Text>
            </View>
            <Link href="/cart" asChild>
              <TouchableOpacity style={styles.cartButton}>
                <ShoppingCart size={24} color="#333" />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari bahan makanan..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.name;
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(isSelected ? null : category.name)}
                    style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: isSelected ? '#7FBA3C' : category.color + '20' }]}>
                      <Icon size={24} color={isSelected ? '#fff' : category.color} />
                    </View>
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produk Pilihan</Text>
              <Text style={styles.productCount}>{filteredProducts.length} produk</Text>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text>Memuat produk...</Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => {
                      // TODO: Navigasi ke halaman detail produk
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  categoryItemSelected: {
    backgroundColor: '#ECFDF5',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#059669',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 48,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    height: 36,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  productStock: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#7FBA3C',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7FBA3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
