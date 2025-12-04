import { useRouter } from 'expo-router';
import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BrandHeader,
  SearchBar,
  CategoryFilter,
  PromoBanner,
  QuickActions,
  ProductGridSection,
  RecommendationsSection,
  FilterModal,
  FilterOptions,
} from '@/components/home';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { theme } from '@/theme';
import { Product } from '@/types/product';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, error, fetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'newest',
  });

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        products
          .map((product) => product.category?.trim())
          .filter((category): category is string => !!category),
      ),
    );

    return [
      { label: 'Semua', value: 'all' },
      ...unique.map((name) => ({
        label: name,
        value: name.toLowerCase(),
      })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter berdasarkan kategori (dari chip atau filter modal)
    const categoryToUse = activeFilters.category !== 'all' ? activeFilters.category : selectedCategory;
    if (categoryToUse !== 'all') {
      result = result.filter(
        (product) => product.category?.toLowerCase() === categoryToUse.toLowerCase(),
      );
    }

    // Filter berdasarkan harga minimum
    if (activeFilters.minPrice) {
      const minPrice = Number(activeFilters.minPrice);
      result = result.filter((product) => product.price >= minPrice);
    }

    // Filter berdasarkan harga maksimum
    if (activeFilters.maxPrice) {
      const maxPrice = Number(activeFilters.maxPrice);
      result = result.filter((product) => product.price <= maxPrice);
    }

    // Filter berdasarkan stok
    if (activeFilters.inStock) {
      result = result.filter((product) => product.stock > 0);
    }

    // Sort
    switch (activeFilters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
    }

    return result;
  }, [products, selectedCategory, activeFilters]);

  const handleSearch = async () => {
    await fetchProducts({ search: searchQuery });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleApplyFilters = useCallback((filters: FilterOptions) => {
    setActiveFilters(filters);
    // Sync category with CategoryFilter chip
    if (filters.category !== 'all') {
      setSelectedCategory(filters.category);
    }
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    // Sync with filter modal
    setActiveFilters((prev) => ({ ...prev, category }));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader userName={user?.email} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          onFilterPress={handleFilterPress}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        <PromoBanner />

        <QuickActions />

        <ProductGridSection
          isLoading={isLoading}
          error={error}
          products={filteredProducts}
          onProductPress={handleProductPress}
          onRetry={handleRefresh}
        />

        <RecommendationsSection products={products} onProductPress={handleProductPress} />
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        categories={categories}
        initialFilters={activeFilters}
      />
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
    backgroundColor: '#FFFFFF',
  },
});
