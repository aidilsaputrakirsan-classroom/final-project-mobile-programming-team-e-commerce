import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

  const categories = [
    { label: 'Semua', value: 'all' },
    { label: 'Sayur', value: 'sayur' },
    { label: 'Daging', value: 'daging' },
    { label: 'Bumbu', value: 'bumbu' },
    { label: 'Buah', value: 'buah' },
  ];

  const filteredProducts = React.useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(
      (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [products, selectedCategory]);

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
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
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
