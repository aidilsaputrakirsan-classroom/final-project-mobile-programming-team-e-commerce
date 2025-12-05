import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { theme } from '@/theme';

// Zod schema untuk validasi form resep
const recipeSchema = z.object({
  title: z
    .string()
    .min(3, 'Judul resep minimal 3 karakter')
    .max(100, 'Judul resep maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  steps: z.string().min(10, 'Langkah-langkah minimal 10 karakter'),
  cooking_time: z
    .string()
    .min(1, 'Waktu memasak wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Waktu memasak harus berupa angka positif',
    }),
  servings: z
    .string()
    .min(1, 'Jumlah porsi wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Jumlah porsi harus berupa angka positif',
    }),
  difficulty: z.enum(['mudah', 'sedang', 'sulit']),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const DIFFICULTY_OPTIONS = [
  { value: 'mudah', label: 'Mudah', color: '#10B981' },
  { value: 'sedang', label: 'Sedang', color: '#F59E0B' },
  { value: 'sulit', label: 'Sulit', color: '#EF4444' },
] as const;

export default function RecipeFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { getRecipeById, createRecipe, updateRecipe } = useRecipes();

  const isEditMode = !!id;
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [fetchingRecipe, setFetchingRecipe] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      steps: '',
      cooking_time: '',
      servings: '1',
      difficulty: 'sedang',
    },
  });

  const watchDifficulty = watch('difficulty');

  // Fetch recipe data untuk edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRecipe = async () => {
        setFetchingRecipe(true);
        try {
          const recipe = await getRecipeById(id);
          if (recipe) {
            setValue('title', recipe.title);
            setValue('description', recipe.description || '');
            setValue('steps', recipe.steps || '');
            setValue('cooking_time', recipe.cooking_time?.toString() || '');
            setValue('servings', recipe.servings?.toString() || '1');
            setValue('difficulty', (recipe.difficulty as 'mudah' | 'sedang' | 'sulit') || 'sedang');
            if (recipe.image_url) {
              setImageUrl(recipe.image_url);
            }
          }
        } catch {
          Alert.alert('Error', 'Gagal memuat data resep');
          router.back();
        } finally {
          setFetchingRecipe(false);
        }
      };

      fetchRecipe();
    }
  }, [id, isEditMode, getRecipeById, setValue, router]);

  const onSubmit = async (data: RecipeFormData) => {
    setLoading(true);

    try {
      const recipeData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        steps: data.steps.trim(),
        cooking_time: Number(data.cooking_time),
        servings: Number(data.servings),
        difficulty: data.difficulty,
        image_url: imageUrl || undefined,
      };

      let result;
      if (isEditMode && id) {
        result = await updateRecipe(id, recipeData);
      } else {
        result = await createRecipe(recipeData);
      }

      if (result) {
        Alert.alert(
          'Berhasil',
          isEditMode ? 'Resep berhasil diperbarui' : 'Resep berhasil ditambahkan',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan resep');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan resep');
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah user adalah admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Resep' : 'Tambah Resep'}
          </Text>
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

  // Loading saat fetch recipe data
  if (fetchingRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Resep</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat data resep...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Resep' : 'Tambah Resep'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Image URL Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>URL Gambar</Text>
            <View style={styles.imageUrlContainer}>
              {imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUrl('')}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>Belum ada gambar</Text>
                </View>
              )}
              <TextInput
                style={styles.imageUrlInput}
                placeholder="https://example.com/gambar.jpg"
                placeholderTextColor={theme.colors.textSecondary}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Judul Resep *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deskripsi</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Deskripsi singkat tentang resep"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </View>

          {/* Cooking Time & Servings */}
          <View style={styles.rowInputs}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Waktu Memasak (menit) *</Text>
              <Controller
                control={control}
                name="cooking_time"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.cooking_time && styles.inputError]}
                    placeholder="30"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.cooking_time && (
                <Text style={styles.errorText}>{errors.cooking_time.message}</Text>
              )}
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Jumlah Porsi *</Text>
              <Controller
                control={control}
                name="servings"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.servings && styles.inputError]}
                    placeholder="4"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.servings && (
                <Text style={styles.errorText}>{errors.servings.message}</Text>
              )}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tingkat Kesulitan *</Text>
            <Controller
              control={control}
              name="difficulty"
              render={({ field: { onChange, value } }) => (
                <View style={styles.difficultyContainer}>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.difficultyOption,
                        value === option.value && {
                          backgroundColor: `${option.color}20`,
                          borderColor: option.color,
                        },
                      ]}
                      onPress={() => onChange(option.value)}
                    >
                      <Text
                        style={[
                          styles.difficultyOptionText,
                          value === option.value && { color: option.color },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Steps */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Langkah-langkah *</Text>
            <Controller
              control={control}
              name="steps"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.stepsTextArea, errors.steps && styles.inputError]}
                  placeholder="1. Siapkan bahan-bahan&#10;2. Panaskan minyak&#10;3. Tumis bumbu&#10;..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.steps && (
              <Text style={styles.errorText}>{errors.steps.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Resep'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    minHeight: 80,
  },
  stepsTextArea: {
    minHeight: 160,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  imageUrlContainer: {
    gap: theme.spacing.sm,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  imageUrlInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
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
