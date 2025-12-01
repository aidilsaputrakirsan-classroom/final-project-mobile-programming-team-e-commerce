# Implementation Plan — BahanKu

Dokumen ini merinci langkah-langkah implementasi untuk membangun aplikasi BahanKu. Setiap langkah dilengkapi dengan sub-tugas, dependency, dan referensi requirement.

---

## Phase 1: Setup dan Konfigurasi Dasar

- [x] **1. Inisialisasi Proyek Expo dengan TypeScript**
  - Buat proyek Expo baru dengan template TypeScript di folder `BahankuApp`
  - Konfigurasikan `app.json` (nama app, slug, scheme, bundle identifier)
  - Setup folder `app/` untuk Expo Router dan `src/` untuk source code
  - _Status: Telah Dibuat_
  - _Requirements: Setup teknis_

- [x] **2. Konfigurasi ESLint dan Prettier**
  - Install dependencies: `@react-native-community/eslint-config`, `prettier`, `eslint-config-prettier`
  - Buat `.eslintrc.js` dengan rules TypeScript, React, dan React Native
  - Buat `.prettierrc` dengan konfigurasi (semi, singleQuote, trailing comma)
  - Tambahkan scripts `lint`, `lint:fix`, `format`, `format:fix` di `package.json`
  - _Status: Telah Dibuat_
  - _Requirements: Kualitas kode_

- [x] **3. Setup Environment Supabase**
  - Install `@supabase/supabase-js`, `react-native-url-polyfill`, `@react-native-async-storage/async-storage`
  - Buat file `.env` dengan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`
  - Tambahkan `.env` ke `.gitignore`
  - Buat `.env.example` sebagai template
  - _Status: Telah Dibuat_
  - _Requirements: Integrasi backend_

- [x] **4. Konfigurasi Struktur Folder**
  - Buat folder utama: `src/components`, `src/hooks`, `src/store`, `src/services`, `src/libs`, `src/theme`, `src/types`
  - Buat folder routing: `app/(auth)`, `app/(tabs)`, `app/product`, `app/recipes`, `app/admin`, `app/favorites`
  - _Status: Telah Dibuat (folder ada tapi masih kosong)_
  - _Requirements: Arsitektur_

- [x] **5. Konfigurasi Path Alias**
  - Tambahkan `baseUrl: "."` dan `paths: { "@/*": ["src/*"] }` di `tsconfig.json`
  - Test import dengan `import X from '@/components/X'`
  - _Status: Telah Dibuat_
  - _Requirements: Developer experience_

- [ ] **6. Test Build Awal di Expo Go**
  - Jalankan `npm start` dan test di Android via Expo Go
  - Jalankan `npm start` dan test di iOS via Expo Go (jika ada perangkat)
  - Pastikan hot reload berfungsi
  - _Status: Sedang Dikerjakan_
  - _Requirements: Verifikasi setup_

---

## Phase 2: Integrasi Supabase dan Theme

- [x] **7. Buat Supabase Client**
  - File: `src/services/supabase.client.ts`
  - Export `supabase` object dengan config URL dan anon key
  - Tambahkan AsyncStorage untuk persist auth session
  - Code:

    ```typescript
    import { createClient } from '@supabase/supabase-js';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import 'react-native-url-polyfill/auto';

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    ```

  - _Requirements: 1 (Authentication)_

- [x] **8. Buat Theme Global**
  - File: `src/theme/index.ts`
  - Export object dengan `colors`, `spacing`, `typography`, `borderRadius`
  - Contoh struktur:
    ```typescript
    export const theme = {
      colors: {
        primary: '#10B981', // green-500
        secondary: '#3B82F6', // blue-500
        background: '#FFFFFF',
        backgroundDark: '#1F2937',
        text: '#111827',
        textSecondary: '#6B7280',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        border: '#E5E7EB',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      typography: {
        h1: { fontSize: 28, fontWeight: '700' },
        h2: { fontSize: 24, fontWeight: '600' },
        body: { fontSize: 16, fontWeight: '400' },
        caption: { fontSize: 14, fontWeight: '400' },
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        full: 9999,
      },
    };
    ```
  - _Requirements: 13 (UI/UX Consistency)_

- [ ] **9. Buat Database Types**
  - File: `src/types/db.ts`
  - Define TypeScript interfaces untuk tabel database:

    ```typescript
    export interface User {
      id: string;
      email: string;
      name: string;
      role: 'customer' | 'admin';
      created_at: string;
    }

    export interface Category {
      id: string;
      name: string;
    }

    export interface Product {
      id: string;
      category_id: string;
      name: string;
      description: string;
      price: number;
      stock: number;
      image_url: string | null;
      created_at: string;
    }

    export interface Order {
      id: string;
      user_id: string;
      total_price: number;
      status: 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';
      created_at: string;
    }

    export interface OrderItem {
      id: string;
      order_id: string;
      product_id: string;
      quantity: number;
      subtotal: number;
    }

    export interface Recipe {
      id: string;
      title: string;
      description: string;
      image_url: string | null;
      steps: string;
      created_at: string;
    }

    export interface RecipeProduct {
      id: string;
      recipe_id: string;
      product_id: string;
    }

    export interface FavoriteRecipe {
      id: string;
      user_id: string;
      recipe_id: string;
      created_at: string;
    }
    ```

  - _Requirements: Semua fitur database_

- [ ] **10. Buat Utility: formatCurrency**
  - File: `src/libs/currency.ts`
  - Fungsi untuk format angka ke format Rupiah:
    ```typescript
    export const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };
    ```
  - _Requirements: 2, 3, 4 (Product display)_

---

## Phase 3: Autentikasi

- [ ] **11. Buat Hook useAuth**
  - File: `src/hooks/useAuth.ts`
  - Export fungsi: `login`, `register`, `loginWithGoogle`, `logout`, `getCurrentUser`
  - Handle session persist dengan AsyncStorage
  - Code skeleton:

    ```typescript
    import { useState, useEffect } from 'react';
    import { supabase } from '@/services/supabase.client';
    import type { User } from '@supabase/supabase-js';

    export const useAuth = () => {
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        // Listen to auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      }, []);

      const register = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Insert user metadata ke tabel users
        if (data.user) {
          await supabase
            .from('users')
            .insert({ id: data.user.id, email, name, role: 'customer' });
        }
        return data;
      };

      const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      };

      const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      };

      return { user, loading, register, login, logout };
    };
    ```

  - _Requirements: 1 (Authentication)_

- [ ] **12. Buat Halaman Login**
  - File: `app/(auth)/login.tsx`
  - Form dengan email dan password (validasi Zod)
  - Tombol "Login dengan Google"
  - Link ke halaman register
  - Handle loading state dan error message
  - Props:
    ```typescript
    // Form schema
    const loginSchema = z.object({
      email: z.string().email('Email tidak valid'),
      password: z.string().min(6, 'Password minimal 6 karakter'),
    });
    ```
  - _Requirements: 1.2, 1.3, 14 (Validation)_

- [ ] **13. Buat Halaman Register**
  - File: `app/(auth)/register.tsx`
  - Form dengan name, email, password, confirm password (validasi Zod)
  - Link ke halaman login
  - Handle loading state dan error message
  - Props:
    ```typescript
    // Form schema
    const registerSchema = z
      .object({
        name: z.string().min(3, 'Nama minimal 3 karakter'),
        email: z.string().email('Email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Password tidak cocok',
        path: ['confirmPassword'],
      });
    ```
  - _Requirements: 1.1, 14 (Validation)_

- [ ] **14. Implementasi Router Guard**
  - File: `app/_layout.tsx`
  - Check session saat app load
  - Redirect ke `/login` jika belum login dan mengakses protected route
  - Redirect ke `/home` jika sudah login dan mengakses `/login` atau `/register`
  - _Requirements: 1.4 (Session persistence)_

---

## Phase 4: Produk (Listing, Detail, Search, Filter)

- [ ] **15. Buat Hook useProducts**
  - File: `src/hooks/useProducts.ts`
  - Export fungsi: `getProducts`, `getProductById`, `searchProducts`, `filterByCategory`, `createProduct`, `updateProduct`, `deleteProduct`
  - Code skeleton:

    ```typescript
    import { useState } from 'react';
    import { supabase } from '@/services/supabase.client';
    import type { Product } from '@/types/db';

    export const useProducts = () => {
      const [products, setProducts] = useState<Product[]>([]);
      const [loading, setLoading] = useState(false);

      const getProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setLoading(false);
        return data;
      };

      const getProductById = async (id: string) => {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      };

      const searchProducts = async (query: string) => {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

        if (error) throw error;
        return data;
      };

      const filterByCategory = async (categoryId: string) => {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('category_id', categoryId);

        if (error) throw error;
        return data;
      };

      // Admin functions
      const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
        const { data, error } = await supabase
          .from('products')
          .insert(product)
          .select()
          .single();
        if (error) throw error;
        return data;
      };

      const updateProduct = async (id: string, updates: Partial<Product>) => {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      };

      const deleteProduct = async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      };

      return {
        products,
        loading,
        getProducts,
        getProductById,
        searchProducts,
        filterByCategory,
        createProduct,
        updateProduct,
        deleteProduct,
      };
    };
    ```

  - _Requirements: 2, 3, 7 (Products)_

- [ ] **16. Buat Component ProductCard**
  - File: `src/components/ProductCard.tsx`
  - Props:
    ```typescript
    interface ProductCardProps {
      product: Product;
      onPress: () => void;
    }
    ```
  - Tampilkan gambar, nama, harga (formatCurrency), badge stok
  - _Requirements: 2.1, 2.5 (Product display)_

- [ ] **17. Buat Component EmptyState**
  - File: `src/components/EmptyState.tsx`
  - Props:
    ```typescript
    interface EmptyStateProps {
      title: string;
      description?: string;
      icon?: React.ReactNode;
      action?: { label: string; onPress: () => void };
    }
    ```
  - _Requirements: 2.4, 4.4 (Empty states)_

- [ ] **18. Buat Halaman Home**
  - File: `app/(tabs)/index.tsx` atau `app/(tabs)/home.tsx`
  - Fetch products dengan `useProducts`
  - Search bar dengan debounce (300ms)
  - Filter kategori (chip/dropdown)
  - Render ProductCard dalam FlatList
  - Handle loading skeleton dan EmptyState
  - _Requirements: 2 (Product listing), 15 (Performance)_

- [ ] **19. Buat Component QuantityStepper**
  - File: `src/components/QuantityStepper.tsx`
  - Props:
    ```typescript
    interface QuantityStepperProps {
      value: number;
      min: number;
      max: number;
      onChange: (newValue: number) => void;
    }
    ```
  - Tombol "-" dan "+" dengan validasi min/max
  - _Requirements: 3.2 (Quantity control)_

- [ ] **20. Buat Halaman Detail Produk**
  - File: `app/product/[id].tsx`
  - Fetch product by ID dengan `useProducts().getProductById`
  - Tampilkan gambar besar, nama, harga, deskripsi, kategori, stok
  - Quantity stepper
  - Tombol "Tambah ke Keranjang" (gunakan cart store)
  - Handle loading dan error
  - _Requirements: 3 (Product detail)_

---

## Phase 5: Keranjang (Cart)

- [ ] **21. Buat Zustand Cart Store**
  - File: `src/store/cart.store.ts`
  - State:

    ```typescript
    interface CartItem {
      product: Product;
      quantity: number;
    }

    interface CartState {
      items: CartItem[];
      addItem: (product: Product, quantity: number) => void;
      updateQuantity: (productId: string, quantity: number) => void;
      removeItem: (productId: string) => void;
      clearCart: () => void;
      getTotal: () => number;
    }
    ```

  - Persist state ke AsyncStorage dengan `persist` middleware:

    ```typescript
    import { create } from 'zustand';
    import { persist, createJSONStorage } from 'zustand/middleware';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    export const useCartStore = create<CartState>()(
      persist(
        (set, get) => ({
          items: [],
          addItem: (product, quantity) => {
            const existingItem = get().items.find(
              (item) => item.product.id === product.id,
            );
            if (existingItem) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item,
                ),
              }));
            } else {
              set((state) => ({ items: [...state.items, { product, quantity }] }));
            }
          },
          updateQuantity: (productId, quantity) => {
            set((state) => ({
              items: state.items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item,
              ),
            }));
          },
          removeItem: (productId) => {
            set((state) => ({
              items: state.items.filter((item) => item.product.id !== productId),
            }));
          },
          clearCart: () => set({ items: [] }),
          getTotal: () => {
            return get().items.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0,
            );
          },
        }),
        {
          name: 'cart-storage',
          storage: createJSONStorage(() => AsyncStorage),
        },
      ),
    );
    ```

  - _Requirements: 4 (Cart management), 12 (Offline support)_

- [ ] **22. Buat Halaman Cart**
  - File: `app/(tabs)/cart.tsx`
  - Fetch cart items dari `useCartStore`
  - Render list item dengan nama, harga, quantity stepper, subtotal, tombol hapus
  - Tampilkan total harga di bottom
  - Tombol "Checkout"
  - Handle EmptyState jika cart kosong
  - _Requirements: 4 (Cart management)_

- [ ] **23. Integrasi Cart di Detail Produk**
  - Update `app/product/[id].tsx`
  - Import `useCartStore` dan panggil `addItem` saat tombol "Tambah ke Keranjang" ditekan
  - Tampilkan toast success setelah berhasil
  - _Requirements: 3.3, 3.4 (Add to cart)_

---

## Phase 6: Pesanan (Orders)

- [ ] **24. Buat Hook useOrders**
  - File: `src/hooks/useOrders.ts`
  - Export fungsi: `createOrder`, `getMyOrders`, `getOrderById`, `updateOrderStatus` (admin only)
  - Code skeleton:

    ```typescript
    import { useState } from 'react';
    import { supabase } from '@/services/supabase.client';
    import type { Order, OrderItem } from '@/types/db';

    export const useOrders = () => {
      const [orders, setOrders] = useState<Order[]>([]);
      const [loading, setLoading] = useState(false);

      const createOrder = async (
        userId: string,
        items: { product_id: string; quantity: number; subtotal: number }[],
        totalPrice: number,
      ) => {
        setLoading(true);
        // Insert order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({ user_id: userId, total_price: totalPrice, status: 'diproses' })
          .select()
          .single();

        if (orderError) throw orderError;

        // Insert order items
        const orderItems = items.map((item) => ({ ...item, order_id: order.id }));
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        setLoading(false);
        return order;
      };

      const getMyOrders = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
        setLoading(false);
        return data;
      };

      const getOrderById = async (orderId: string) => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products(name, price, image_url))')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        return data;
      };

      const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)
          .select()
          .single();

        if (error) throw error;
        return data;
      };

      return {
        orders,
        loading,
        createOrder,
        getMyOrders,
        getOrderById,
        updateOrderStatus,
      };
    };
    ```

  - _Requirements: 5, 6, 8 (Orders)_

- [ ] **25. Implementasi Checkout Logic**
  - Update `app/(tabs)/cart.tsx`
  - Tambahkan tombol "Checkout" yang memanggil `useOrders().createOrder`
  - Validasi stok produk sebelum membuat pesanan
  - Clear cart setelah pesanan berhasil dibuat
  - Redirect ke `/orders` setelah checkout
  - _Requirements: 5 (Checkout)_

- [ ] **26. Buat Halaman Orders (Customer)**
  - File: `app/(tabs)/orders.tsx`
  - Fetch orders dengan `useOrders().getMyOrders`
  - Render list pesanan dengan tanggal, total, status
  - Navigasi ke detail pesanan saat card ditekan
  - Handle EmptyState
  - _Requirements: 6 (Order history)_

- [ ] **27. Buat Halaman Detail Order**
  - File: `app/order/[id].tsx` atau detail dalam modal
  - Fetch order detail dengan `useOrders().getOrderById`
  - Tampilkan daftar produk dalam pesanan (nama, qty, subtotal)
  - Tampilkan status dan timeline pengiriman
  - _Requirements: 6.2 (Order detail)_

---

## Phase 7: Admin (CRUD Produk dan Pesanan)

- [ ] **28. Buat Service Upload Gambar**
  - File: `src/services/image.ts`
  - Fungsi `uploadImage` untuk upload ke Supabase Storage bucket `products`:

    ```typescript
    import { supabase } from './supabase.client';
    import * as FileSystem from 'expo-file-system';

    export const uploadImage = async (
      uri: string,
      folder: string = 'products',
    ): Promise<string> => {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${folder}/${fileName}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Blob
      const arrayBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(data.path);

      return publicUrl;
    };
    ```

  - _Requirements: 7.2, 7.3 (Image upload)_

- [ ] **29. Buat Halaman Admin Products**
  - File: `app/admin/products.tsx`
  - Fetch products dengan `useProducts().getProducts`
  - Render list dengan tombol "Edit" dan "Hapus"
  - Tombol "Tambah Produk" yang navigasi ke `/admin/product-form`
  - Handle delete dengan konfirmasi
  - _Requirements: 7.1, 7.4 (Admin CRUD)_

- [ ] **30. Buat Halaman Admin Product Form**
  - File: `app/admin/product-form.tsx`
  - Form untuk create/edit produk dengan field: name, description, price, stock, category, image
  - Validasi Zod:
    ```typescript
    const productSchema = z.object({
      name: z.string().min(3, 'Nama minimal 3 karakter'),
      description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
      price: z.number().positive('Harga harus positif'),
      stock: z.number().int().nonnegative('Stok tidak boleh negatif'),
      category_id: z.string().uuid('Pilih kategori'),
      image_url: z.string().url().nullable(),
    });
    ```
  - Image picker dengan `expo-image-picker`
  - Upload gambar dengan `uploadImage` sebelum save
  - Call `createProduct` atau `updateProduct` dari `useProducts`
  - _Requirements: 7.2, 7.3, 7.5 (Admin form)_

- [ ] **31. Buat Halaman Admin Orders**
  - File: `app/admin/orders.tsx`
  - Fetch all orders (tidak filter by user)
  - Render list dengan info customer, total, status
  - Tombol "Ubah Status" yang membuka modal/dropdown
  - Call `updateOrderStatus` dari `useOrders`
  - _Requirements: 8 (Admin order management)_

---

## Phase 8: Resep dan Favorit

- [ ] **32. Buat Hook useRecipes**
  - File: `src/hooks/useRecipes.ts`
  - Export fungsi: `getRecipes`, `getRecipeById`, `getRecipeProducts`, `toggleFavorite`, `getMyFavorites`
  - Code skeleton:

    ```typescript
    import { useState } from 'react';
    import { supabase } from '@/services/supabase.client';
    import type { Recipe, FavoriteRecipe } from '@/types/db';

    export const useRecipes = () => {
      const [recipes, setRecipes] = useState<Recipe[]>([]);
      const [loading, setLoading] = useState(false);

      const getRecipes = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
        setLoading(false);
        return data;
      };

      const getRecipeById = async (id: string) => {
        const { data, error } = await supabase
          .from('recipes')
          .select('*, recipe_products(*, products(*))')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      };

      const toggleFavorite = async (userId: string, recipeId: string) => {
        // Check if already favorited
        const { data: existing } = await supabase
          .from('favorite_recipes')
          .select('id')
          .eq('user_id', userId)
          .eq('recipe_id', recipeId)
          .single();

        if (existing) {
          // Remove favorite
          const { error } = await supabase
            .from('favorite_recipes')
            .delete()
            .eq('id', existing.id);

          if (error) throw error;
          return { isFavorite: false };
        } else {
          // Add favorite
          const { error } = await supabase
            .from('favorite_recipes')
            .insert({ user_id: userId, recipe_id: recipeId });

          if (error) throw error;
          return { isFavorite: true };
        }
      };

      const getMyFavorites = async (userId: string) => {
        const { data, error } = await supabase
          .from('favorite_recipes')
          .select('*, recipes(*)')
          .eq('user_id', userId);

        if (error) throw error;
        return data?.map((fav) => fav.recipes) || [];
      };

      return {
        recipes,
        loading,
        getRecipes,
        getRecipeById,
        toggleFavorite,
        getMyFavorites,
      };
    };
    ```

  - _Requirements: 9, 10 (Recipes and favorites)_

- [ ] **33. Buat Component RecipeCard**
  - File: `src/components/RecipeCard.tsx`
  - Props:
    ```typescript
    interface RecipeCardProps {
      recipe: Recipe;
      isFavorite?: boolean;
      onPress: () => void;
      onToggleFavorite?: () => void;
    }
    ```
  - Tampilkan gambar, judul, deskripsi singkat, icon favorite (heart)
  - _Requirements: 9.1 (Recipe display)_

- [ ] **34. Buat Halaman Recipes**
  - File: `app/recipes/index.tsx`
  - Fetch recipes dengan `useRecipes().getRecipes`
  - Render RecipeCard dalam grid/list
  - Handle loading dan EmptyState
  - _Requirements: 9 (Recipe listing)_

- [ ] **35. Buat Halaman Detail Recipe**
  - File: `app/recipes/[id].tsx`
  - Fetch recipe detail dengan `useRecipes().getRecipeById`
  - Tampilkan gambar, judul, langkah-langkah, daftar bahan (linked ke produk)
  - Tombol favorite (toggle)
  - _Requirements: 9.2, 9.3, 10.1, 10.2 (Recipe detail and favorite)_

- [ ] **36. Buat Halaman Favorites**
  - File: `app/favorites/index.tsx`
  - Fetch favorite recipes dengan `useRecipes().getMyFavorites`
  - Render RecipeCard dalam grid/list
  - Handle EmptyState
  - _Requirements: 10.3, 10.4 (Favorites)_

---

## Phase 9: Profil dan Pengaturan

- [ ] **37. Buat UI Store (Dark Mode)**
  - File: `src/store/ui.store.ts`
  - State:
    ```typescript
    interface UIState {
      isDarkMode: boolean;
      toggleDarkMode: () => void;
    }
    ```
  - Persist ke AsyncStorage dengan `persist` middleware
  - _Requirements: 11.3 (Dark mode)_

- [ ] **38. Buat Halaman Profile**
  - File: `app/(tabs)/profile.tsx`
  - Fetch user data dari `useAuth().user`
  - Tampilkan nama, email, foto profil (jika ada)
  - Tombol "Edit Profil" (navigasi ke form edit atau modal)
  - Toggle dark mode
  - Tombol "Logout"
  - _Requirements: 11 (Profile and settings)_

- [ ] **39. Implementasi Edit Profil**
  - Form untuk edit nama dan upload foto profil
  - Update data di tabel `users`
  - _Requirements: 11.2 (Edit profile)_

---

## Phase 10: Testing dan Polishing

- [ ] **40. Uji Navigasi Antar Halaman**
  - Test semua link dan button navigasi
  - Pastikan back button berfungsi
  - Test deep linking (jika ada)
  - _Requirements: 13 (UX consistency)_

- [ ] **41. Uji Autentikasi Lengkap**
  - Test register, login, Google Sign-In, logout
  - Test session persistence setelah app restart
  - Test router guard untuk protected routes
  - _Requirements: 1 (Authentication)_

- [ ] **42. Uji Checkout dan Order Flow**
  - Test add to cart, update quantity, remove item
  - Test checkout dengan berbagai skenario (stok habis, empty cart)
  - Test create order dan update status
  - _Requirements: 4, 5, 6 (Cart and orders)_

- [ ] **43. Uji CRUD Produk (Admin)**
  - Test create, edit, delete produk
  - Test upload gambar
  - Test validasi form
  - _Requirements: 7 (Admin product management)_

- [ ] **44. Uji Resep dan Favorit**
  - Test view recipes, detail recipe
  - Test toggle favorite, view favorites
  - _Requirements: 9, 10 (Recipes and favorites)_

- [ ] **45. Lint dan Typecheck Final**
  - Jalankan `npm run lint` dan fix semua warning
  - Jalankan `tsc --noEmit` untuk typecheck
  - Pastikan tidak ada type errors
  - _Requirements: Kualitas kode_

- [ ] **46. Optimasi Performa**
  - Test performa dengan banyak produk (100+)
  - Implementasi pagination atau infinite scroll jika perlu
  - Compress gambar sebelum upload (max 1MB)
  - _Requirements: 15 (Performance)_

- [ ] **47. Buat Dokumentasi README**
  - Setup instructions (install dependencies, configure .env)
  - How to run (expo start, android, ios)
  - Struktur folder
  - Tech stack
  - Features overview
  - Screenshots (optional)
  - _Requirements: Developer onboarding_

---
