import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabase.client';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

export function useProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (err) throw err;

      return data as Product[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data produk';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;

      return data as Product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil detail produk';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (err) throw err;

      return data as Product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat produk';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      return data as Product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengupdate produk';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (err) throw err;

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus produk';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
