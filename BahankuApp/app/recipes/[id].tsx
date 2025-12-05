import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Heart,
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { RecipeDetail, RecipeProduct } from '@/types/recipe';
import { formatCurrency } from '@/libs/currency';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { getRecipeById, checkIsFavorite, toggleFavorite, isLoading, error } =
    useRecipes();
  const addToCart = useCartStore((state) => state.addItem);

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  // Load recipe detail
  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    const data = await getRecipeById(id);
    setRecipe(data);

    // Cek status favorit
    if (user?.id && data) {
      const favStatus = await checkIsFavorite(user.id, data.id);
      setIsFavorite(favStatus);
    }
  };

  // Toggle favorit
  const handleToggleFavorite = async () => {
    if (!user?.id) {
      router.push('/(auth)/login');
      return;
    }

    if (!recipe) return;

    setTogglingFavorite(true);
    const result = await toggleFavorite(user.id, recipe.id);
    setIsFavorite(result.isFavorite);
    setTogglingFavorite(false);

    Alert.alert('Favorit', result.message);
  };

  // Navigasi ke detail produk
  const handlePressProduct = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Tambah bahan ke keranjang
  const handleAddIngredientToCart = (ingredient: RecipeProduct) => {
    if (!ingredient.product) return;

    const product = ingredient.product;
    if (product.stock <= 0) {
      Alert.alert('Stok Habis', 'Produk ini sedang tidak tersedia');
      return;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
      },
      1,
    );

    Alert.alert('Berhasil', `${product.name} ditambahkan ke keranjang`);
  };

  // Parse steps (bisa berupa JSON atau plain text)
  const parseSteps = (steps?: string): string[] => {
    if (!steps) return [];

    try {
      // Coba parse sebagai JSON array
      const parsed = JSON.parse(steps);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [steps];
    } catch {
      // Jika bukan JSON, split berdasarkan newline atau nomor
      return steps
        .split(/\n|\r\n/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0);
    }
  };

  // Map difficulty ke label bahasa Indonesia
  const difficultyLabel: Record<string, string> = {
    mudah: 'Mudah',
    sedang: 'Sedang',
    sulit: 'Sulit',
  };

  // Map difficulty ke warna
  const difficultyColor: Record<string, string> = {
    mudah: theme.colors.success,
    sedang: theme.colors.warning,
    sulit: theme.colors.error,
  };

  // Loading state
  if (isLoading && !recipe) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <View style={styles.centerContainer}>
        <ChefHat size={64} color={theme.colors.textSecondary} />
        <Text style={styles.errorTitle}>Resep Tidak Ditemukan</Text>
        <Text style={styles.errorMessage}>
          {error || 'Resep yang kamu cari tidak tersedia'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps = parseSteps(recipe.steps);

  return (
    <>
      <Stack.Screen
        options={{
          title: recipe.title,
          headerRight: () =>
            user ? (
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={togglingFavorite}
                style={styles.headerFavoriteButton}
              >
                {togglingFavorite ? (
                  <ActivityIndicator size="small" color={theme.colors.error} />
                ) : (
                  <Heart
                    size={24}
                    color={isFavorite ? theme.colors.error : theme.colors.text}
                    fill={isFavorite ? theme.colors.error : 'transparent'}
                  />
                )}
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Image
          source={{
            uri: recipe.image_url || 'https://via.placeholder.com/400x300?text=Resep',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Recipe Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{recipe.title}</Text>

          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {recipe.cooking_time && (
              <View style={styles.metaItem}>
                <Clock size={18} color={theme.colors.primary} />
                <Text style={styles.metaText}>{recipe.cooking_time} menit</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.metaItem}>
                <Users size={18} color={theme.colors.primary} />
                <Text style={styles.metaText}>{recipe.servings} porsi</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      difficultyColor[recipe.difficulty] || theme.colors.primary,
                  },
                ]}
              >
                <Text style={styles.difficultyText}>
                  {difficultyLabel[recipe.difficulty] || recipe.difficulty}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ingredients / Bahan-bahan */}
        {recipe.recipe_products && recipe.recipe_products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bahan-bahan</Text>
            <View style={styles.ingredientsList}>
              {recipe.recipe_products.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <TouchableOpacity
                    style={styles.ingredientInfo}
                    onPress={() =>
                      ingredient.product_id && handlePressProduct(ingredient.product_id)
                    }
                  >
                    {ingredient.product?.image_url && (
                      <Image
                        source={{ uri: ingredient.product.image_url }}
                        style={styles.ingredientImage}
                      />
                    )}
                    <View style={styles.ingredientDetails}>
                      <Text style={styles.ingredientName}>
                        {ingredient.product?.name || 'Produk tidak tersedia'}
                      </Text>
                      <Text style={styles.ingredientQuantity}>
                        {ingredient.quantity}
                        {ingredient.notes ? ` - ${ingredient.notes}` : ''}
                      </Text>
                      {ingredient.product && (
                        <Text style={styles.ingredientPrice}>
                          {formatCurrency(ingredient.product.price)}
                        </Text>
                      )}
                    </View>
                    <ArrowRight size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Tombol tambah ke keranjang */}
                  {ingredient.product && ingredient.product.stock > 0 && (
                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={() => handleAddIngredientToCart(ingredient)}
                    >
                      <ShoppingCart size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps / Langkah-langkah */}
        {steps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Langkah-langkah</Text>
            <View style={styles.stepsList}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
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
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  errorMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  backButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  headerFavoriteButton: {
    padding: theme.spacing.sm,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.border,
  },
  infoSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ingredientsList: {
    gap: theme.spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  ingredientQuantity: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  ingredientPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsList: {
    gap: theme.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
});
