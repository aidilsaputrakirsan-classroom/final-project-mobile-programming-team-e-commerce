import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase.client';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from '@/types/product';

interface UseProductsOptions {
  autoFetch?: boolean;
  initialFilters?: ProductFilters;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { autoFetch = true, initialFilters } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil semua produk dengan filter
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter berdasarkan search
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Filter berdasarkan kategori
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      // Filter berdasarkan harga minimum
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      // Filter berdasarkan harga maksimum
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Filter hanya produk yang ada stoknya
      if (filters?.inStock) {
        query = query.gt('stock', 0);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal mengambil data produk';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ambil produk berdasarkan ID
  const getProductById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data as Product;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal mengambil detail produk';
      setError(errorMessage);
      console.error('Error fetching product:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buat produk baru (admin only)
  const createProduct = useCallback(async (input: CreateProductInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('products')
        .insert([input])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh list produk
      await fetchProducts();

      return data as Product;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal membuat produk';
      setError(errorMessage);
      console.error('Error creating product:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts]);

  // Update produk (admin only)
  const updateProduct = useCallback(
    async (id: string, input: UpdateProductInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('products')
          .update(input)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Refresh list produk
        await fetchProducts();

        return data as Product;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Gagal mengupdate produk';
        setError(errorMessage);
        console.error('Error updating product:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProducts]
  );

  // Hapus produk (admin only)
  const deleteProduct = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        // Refresh list produk
        await fetchProducts();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Gagal menghapus produk';
        setError(errorMessage);
        console.error('Error deleting product:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProducts]
  );

  // Load produk saat component mount
  useEffect(() => {
    if (!autoFetch) {
      return;
    }
    fetchProducts(initialFilters);
  }, [autoFetch, fetchProducts, initialFilters]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
