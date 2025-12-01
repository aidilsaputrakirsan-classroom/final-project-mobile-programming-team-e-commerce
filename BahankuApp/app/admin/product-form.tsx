import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X, Link as LinkIcon, Upload } from 'lucide-react-native';
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

import { uploadProductImage } from '@/services/image';
import { supabase } from '@/services/supabase.client';

import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { theme } from '@/theme';

// Zod schema untuk validasi form produk
const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(100, 'Nama produk maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  price: z
    .string()
    .min(1, 'Harga wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Harga harus berupa angka positif',
    }),
  stock: z
    .string()
    .min(1, 'Stok wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Stok harus berupa angka non-negatif',
    }),
  category_id: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

export default function ProductFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { getProductById, createProduct, updateProduct } = useProducts({
    autoFetch: false,
  });

  const isEditMode = !!id;
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product data untuk edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchProduct = async () => {
        setFetchingProduct(true);
        try {
          const product = await getProductById(id);
          if (product) {
            setValue('name', product.name);
            setValue('description', product.description || '');
            setValue('price', product.price.toString());
            setValue('stock', product.stock.toString());
            setValue('category_id', product.category_id || '');
            setSelectedCategoryId(product.category_id || null);
            if (product.image_url) {
              setImageUri(product.image_url);
            }
          }
        } catch {
          Alert.alert('Error', 'Gagal memuat data produk');
          router.back();
        } finally {
          setFetchingProduct(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode, getProductById, setValue, router]);

  // Request permission untuk image picker
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi memerlukan akses ke galeri untuk memilih gambar produk.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi memerlukan akses ke kamera untuk mengambil foto produk.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Pilih Gambar', 'Pilih sumber gambar produk', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Kamera', onPress: takePhoto },
      { text: 'Galeri', onPress: pickImage },
    ]);
  };

  const removeImage = () => {
    setImageUri(null);
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  // Validasi dan set image dari URL
  const handleImageUrl = () => {
    const trimmedUrl = imageUrlInput.trim();
    if (!trimmedUrl) {
      Alert.alert('Error', 'URL gambar tidak boleh kosong');
      return;
    }

    // Validasi format URL
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      Alert.alert('Error', 'URL harus diawali dengan http:// atau https://');
      return;
    }

    // Cek ekstensi gambar (opsional)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = imageExtensions.some((ext) =>
      trimmedUrl.toLowerCase().includes(ext),
    );

    if (!hasValidExtension && !trimmedUrl.includes('unsplash') && !trimmedUrl.includes('placeholder')) {
      Alert.alert(
        'Peringatan',
        'URL mungkin bukan gambar valid. Lanjutkan?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            onPress: () => {
              setImageUri(trimmedUrl);
              setShowUrlInput(false);
            },
          },
        ],
      );
      return;
    }

    setImageUri(trimmedUrl);
    setShowUrlInput(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!isAdmin) {
      Alert.alert('Error', 'Anda tidak memiliki akses untuk melakukan ini');
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload gambar jika ada gambar baru (bukan URL existing)
      if (imageUri && !imageUri.startsWith('http')) {
        setUploadingImage(true);
        const tempId = id || `temp-${Date.now()}`;
        const uploadResult = await uploadProductImage(imageUri, tempId);
        setUploadingImage(false);

        if (uploadResult) {
          imageUrl = uploadResult.url;
        } else {
          Alert.alert(
            'Peringatan',
            'Gagal mengunggah gambar, produk akan disimpan tanpa gambar',
          );
        }
      } else if (imageUri) {
        // Gunakan URL existing
        imageUrl = imageUri;
      }

      const productData = {
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        stock: Number(data.stock),
        category_id: selectedCategoryId || undefined,
        image_url: imageUrl,
      };

      if (isEditMode && id) {
        const result = await updateProduct(id, productData);
        if (result) {
          Alert.alert('Berhasil', 'Produk berhasil diperbarui', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Gagal', 'Gagal memperbarui produk');
        }
      } else {
        const result = await createProduct(productData);
        if (result) {
          Alert.alert('Berhasil', 'Produk berhasil ditambahkan', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Gagal', 'Gagal menambahkan produk');
        }
      }
    } catch {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue('category_id', categoryId);
    setShowCategoryPicker(false);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Cek apakah user adalah admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
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

  if (fetchingProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Produk</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat data produk...</Text>
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
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Picker Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Gambar Produk</Text>
            <Text style={styles.sectionSubtitle}>Upload gambar atau masukkan URL gambar</Text>
            
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <X size={16} color={theme.colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={showImageOptions}
                >
                  <Text style={styles.changeImageText}>Ganti Gambar</Text>
                </TouchableOpacity>
              </View>
            ) : showUrlInput ? (
              <View style={styles.urlInputContainer}>
                <View style={styles.urlInputWrapper}>
                  <LinkIcon size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.urlInput}
                    placeholder="https://example.com/image.jpg"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={imageUrlInput}
                    onChangeText={setImageUrlInput}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
                <View style={styles.urlButtonsRow}>
                  <TouchableOpacity
                    style={styles.urlCancelButton}
                    onPress={() => {
                      setShowUrlInput(false);
                      setImageUrlInput('');
                    }}
                  >
                    <Text style={styles.urlCancelButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.urlConfirmButton} onPress={handleImageUrl}>
                    <Text style={styles.urlConfirmButtonText}>Gunakan URL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.imageOptionsContainer}>
                <TouchableOpacity
                  style={styles.imagePlaceholder}
                  onPress={showImageOptions}
                >
                  <View style={styles.uploadIconContainer}>
                    <Upload size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.imagePlaceholderTitle}>Upload Gambar</Text>
                  <Text style={styles.imagePlaceholderText}>Tap untuk memilih dari galeri atau kamera</Text>
                </TouchableOpacity>
                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity
                  style={styles.urlOptionButton}
                  onPress={() => setShowUrlInput(true)}
                >
                  <LinkIcon size={20} color={theme.colors.primary} />
                  <Text style={styles.urlOptionText}>Masukkan URL Gambar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Nama Produk */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Produk *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Masukkan nama produk"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            {/* Deskripsi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deskripsi</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Masukkan deskripsi produk"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              )}
            </View>

            {/* Harga */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Harga (Rp) *</Text>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.price && styles.inputError]}
                    placeholder="Masukkan harga"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.price && (
                <Text style={styles.errorText}>{errors.price.message}</Text>
              )}
            </View>

            {/* Stok */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stok *</Text>
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.stock && styles.inputError]}
                    placeholder="Masukkan jumlah stok"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.stock && (
                <Text style={styles.errorText}>{errors.stock.message}</Text>
              )}
            </View>

            {/* Kategori */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text
                  style={[
                    styles.categorySelectorText,
                    !selectedCategory && styles.placeholderText,
                  ]}
                >
                  {selectedCategory?.name || 'Pilih kategori'}
                </Text>
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.categoryList}>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setSelectedCategoryId(null);
                      setValue('category_id', '');
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.categoryItemText}>Tanpa Kategori</Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategoryId === category.id && styles.categoryItemSelected,
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          selectedCategoryId === category.id &&
                            styles.categoryItemTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={theme.colors.background} />
                <Text style={styles.submitButtonText}>
                  {uploadingImage ? 'Mengunggah gambar...' : 'Menyimpan...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },
  imageSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  imageOptionsContainer: {
    gap: theme.spacing.md,
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  imagePlaceholderTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  urlOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  urlOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  urlInputContainer: {
    gap: theme.spacing.md,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  urlInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  urlButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  urlCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  urlCancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  urlConfirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  urlConfirmButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 70,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    padding: 6,
    ...theme.shadows.sm,
  },
  changeImageButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  changeImageText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  formSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  categorySelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  categorySelectorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  categoryList: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.primary + '15',
  },
  categoryItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  categoryItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.primary + '60',
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
