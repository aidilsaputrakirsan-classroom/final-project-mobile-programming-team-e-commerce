import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Percent } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { theme, useAppTheme } from '@/theme';
import { Product } from '@/types/product';

export default function DiscountsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { products, isLoading, fetchProducts } = useProducts();

  const discountedProducts = useMemo(() => {
    return products.filter((product) => (product.discount_percent || 0) > 0);
  }, [products]);

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        id={item.id}
        name={item.name}
        price={item.price}
        image_url={item.image_url}
        stock={item.stock}
        discountPercent={item.discount_percent}
        discountedPrice={item.discounted_price}
        onPress={() => handleProductPress(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Spesial Diskon',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading && products.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={discountedProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchProducts()}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Belum ada diskon"
              message="Nantikan promo menarik dari kami segera!"
              icon={<Percent size={48} color={theme.colors.textSecondary} />}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});
