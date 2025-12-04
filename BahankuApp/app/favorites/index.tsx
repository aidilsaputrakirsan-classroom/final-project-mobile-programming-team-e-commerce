import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Heart, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuthStore } from '@/store/auth.store';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { Recipe } from '@/types/recipe';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { favorites, isLoading, error, fetchMyFavorites, toggleFavorite } = useRecipes();

  const [refreshing, setRefreshing] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<Recipe[]>([]);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Load favorit saat fokus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadFavorites();
      }
    }, [user?.id]),
  );

  const loadFavorites = async () => {
    if (!user?.id) return;
    const data = await fetchMyFavorites(user.id);
    setLocalFavorites(data);
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Toggle favorit (hapus dari favorit)
  const handleToggleFavorite = async (recipeId: string) => {
    if (!user?.id) return;

    const result = await toggleFavorite(user.id, recipeId);

    // Jika dihapus dari favorit, update local state
    if (!result.isFavorite) {
      setLocalFavorites((prev) => prev.filter((r) => r.id !== recipeId));
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
        isFavorite={true}
        onPress={() => handlePressRecipe(item)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        showFavoriteButton={true}
      />
    </View>
  );

  // Loading state
  if (isLoading && localFavorites.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat resep favorit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header dengan back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resep Favorit</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Favorites List */}
        {localFavorites.length === 0 && !isLoading ? (
          <EmptyState
            title="Belum Ada Resep Favorit"
            message="Simpan resep yang kamu sukai dengan menekan ikon hati di halaman resep"
            icon={<Heart size={64} color={theme.colors.textSecondary} />}
            actionLabel="Jelajahi Resep"
            onAction={() => router.push('/recipes')}
          />
        ) : (
          <FlatList
            data={localFavorites}
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
            ListHeaderComponent={
              <View style={styles.headerInfo}>
                <Text style={styles.headerText}>
                  {localFavorites.length} resep favorit
                </Text>
              </View>
            }
          />
        )}
      </View>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
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
  headerInfo: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  headerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
