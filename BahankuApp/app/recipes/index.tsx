import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChefHat } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuthStore } from '@/store/auth.store';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { Recipe } from '@/types/recipe';

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { recipes, isLoading, error, fetchRecipes, toggleFavorite, getFavoriteIds } =
    useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Load resep dan favorit saat mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchRecipes();
    if (user?.id) {
      const ids = await getFavoriteIds(user.id);
      setFavoriteIds(ids);
    }
  };

  // Debounce search
  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        fetchRecipes(text.trim() || undefined);
      }, 300);

      setSearchTimeout(timeout);
    },
    [fetchRecipes, searchTimeout],
  );

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Toggle favorit
  const handleToggleFavorite = async (recipeId: string) => {
    if (!user?.id) {
      router.push('/(auth)/login');
      return;
    }

    const result = await toggleFavorite(user.id, recipeId);

    if (result.isFavorite) {
      setFavoriteIds((prev) => [...prev, recipeId]);
    } else {
      setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
    }
  };

  // Navigasi ke detail resep
  const handlePressRecipe = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  // Render item
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.cardWrapper}>
      <RecipeCard
        recipe={item}
        isFavorite={favoriteIds.includes(item.id)}
        onPress={() => handlePressRecipe(item)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        showFavoriteButton={!!user}
      />
    </View>
  );

  // Loading state
  if (isLoading && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari resep..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Recipe List */}
      {recipes.length === 0 && !isLoading ? (
        <EmptyState
          title="Resep Tidak Ditemukan"
          message={
            searchQuery
              ? 'Coba kata kunci lain untuk menemukan resep yang kamu cari'
              : 'Resep akan segera hadir, nantikan ya!'
          }
          icon={<ChefHat size={64} color={theme.colors.textSecondary} />}
        />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}10`,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardWrapper: {
    width: '48%',
  },
});
