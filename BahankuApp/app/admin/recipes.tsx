import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  MoreVertical,
  ChefHat,
  Clock,
  Users,
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
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { theme } from '@/theme';
import { Recipe } from '@/types/recipe';

// Difficulty badge component
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const getColor = () => {
    switch (difficulty) {
      case 'mudah':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'sedang':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'sulit':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };
  const colors = getColor();

  return (
    <View style={[styles.difficultyBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.difficultyText, { color: colors.text }]}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Text>
    </View>
  );
};

// Memoized RecipeItem component
interface RecipeItemProps {
  item: Recipe;
  isDeleting: boolean;
  onMenuPress: (recipe: Recipe) => void;
}

const RecipeItem = memo(({ item, isDeleting, onMenuPress }: RecipeItemProps) => {
  return (
    <View style={styles.recipeCard}>
      <Image
        source={{
          uri: item.image_url || 'https://via.placeholder.com/100x100?text=No+Image',
        }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.recipeMetaRow}>
          <View style={styles.recipeMeta}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.recipeMetaText}>{item.cooking_time} menit</Text>
          </View>
          <View style={styles.recipeMeta}>
            <Users size={14} color={theme.colors.textSecondary} />
            <Text style={styles.recipeMetaText}>{item.servings} porsi</Text>
          </View>
        </View>
        <DifficultyBadge difficulty={item.difficulty || 'sedang'} />
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

export default function AdminRecipesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { recipes, isLoading, error, fetchRecipes, deleteRecipe } = useRecipes();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const isAdmin = user?.role === 'admin';

  // Filter resep berdasarkan search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    const query = searchQuery.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query),
    );
  }, [recipes, searchQuery]);

  const loadRecipes = useCallback(async () => {
    if (!isAdmin) return;
    await fetchRecipes();
  }, [fetchRecipes, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const handleRefresh = async () => {
    if (!isAdmin) return;
    try {
      setRefreshing(true);
      await fetchRecipes();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddRecipe = () => {
    router.push('/admin/recipe-form');
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setMenuVisible(false);
    InteractionManager.runAfterInteractions(() => {
      Alert.alert('Hapus Resep', `Apakah Anda yakin ingin menghapus "${recipe.title}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(recipe.id);
              const success = await deleteRecipe(recipe.id);
              if (success) {
                Alert.alert('Berhasil', 'Resep berhasil dihapus');
              } else {
                Alert.alert('Gagal', 'Gagal menghapus resep');
              }
            } catch {
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus resep');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    });
  };

  const openMenu = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setMenuVisible(true);
  }, []);

  const handleEditFromMenu = useCallback(() => {
    if (selectedRecipe) {
      const recipeId = selectedRecipe.id;
      setMenuVisible(false);
      InteractionManager.runAfterInteractions(() => {
        router.push(`/admin/recipe-form?id=${recipeId}`);
      });
    }
  }, [selectedRecipe, router]);

  const handleDeleteFromMenu = useCallback(() => {
    if (selectedRecipe) {
      handleDeleteRecipe(selectedRecipe);
    }
  }, [selectedRecipe]);

  const renderRecipeItem = useCallback(
    ({ item }: { item: Recipe }) => {
      return (
        <RecipeItem
          item={item}
          isDeleting={deletingId === item.id}
          onMenuPress={openMenu}
        />
      );
    },
    [deletingId, openMenu],
  );

  // Cek apakah user adalah admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kelola Resep</Text>
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
        <Text style={styles.headerTitle}>Kelola Resep</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
          <Plus size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari resep..."
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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ChefHat size={18} color={theme.colors.primary} />
          <Text style={styles.statValue}>{recipes.length}</Text>
          <Text style={styles.statLabel}>Total Resep</Text>
        </View>
      </View>

      {/* Recipe List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat resep...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRecipes}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Resep Tidak Ditemukan' : 'Belum Ada Resep'}
          message={
            searchQuery
              ? 'Coba kata kunci lain atau hapus pencarian'
              : 'Tambahkan resep pertama Anda'
          }
          icon={<ChefHat size={64} color={theme.colors.textSecondary} />}
          actionLabel={!searchQuery ? 'Tambah Resep' : undefined}
          onAction={!searchQuery ? handleAddRecipe : undefined}
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipeItem}
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
              <Text style={styles.menuItemText}>Edit Resep</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteFromMenu}>
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Hapus Resep
              </Text>
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
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
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
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  recipeImage: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  difficultyText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
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
