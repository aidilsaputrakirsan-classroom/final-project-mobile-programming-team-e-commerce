import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingCart, Minus, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/libs/currency';
import { theme } from '@/theme';
import { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById } = useProducts({ autoFetch: false });

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product detail
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getProductById(id);
        if (isMounted) {
          if (data) {
            setProduct(data);
          } else {
            setError('Produk tidak ditemukan');
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
        if (isMounted) {
          setError('Gagal memuat produk');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id, getProductById]);

  // Handle quantity
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // TODO: Implementasi keranjang belanja
    alert(`Menambahkan ${quantity}x ${product?.name} ke keranjang`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat detail produk...</Text>
      </View>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Produk tidak ditemukan'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image
          source={{
            uri: product.image_url || 'https://via.placeholder.com/400',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Stok:</Text>
            <Text style={[styles.stockValue, product.stock === 0 && styles.stockEmpty]}>
              {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
            </Text>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Deskripsi</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Jumlah</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity === 1}
                >
                  <Minus
                    size={20}
                    color={
                      quantity === 1 ? theme.colors.textSecondary : theme.colors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === product.stock && styles.quantityButtonDisabled,
                  ]}
                  onPress={increaseQuantity}
                  disabled={quantity === product.stock}
                >
                  <Plus
                    size={20}
                    color={
                      quantity === product.stock
                        ? theme.colors.textSecondary
                        : theme.colors.text
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {product.stock > 0 && (
        <View style={styles.bottomContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(product.price * quantity)}
            </Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.addToCartText}>Tambah ke Keranjang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.surface,
  },
  infoContainer: {
    padding: theme.spacing.lg,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stockLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  stockValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  stockEmpty: {
    color: theme.colors.error,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  quantityContainer: {
    marginBottom: theme.spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  addToCartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
