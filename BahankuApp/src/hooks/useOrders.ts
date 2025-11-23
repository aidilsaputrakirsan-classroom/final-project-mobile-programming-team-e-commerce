import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/services/supabase.client';
import { useAuth } from '@/hooks/useAuth';
import {
  CreateOrderParams,
  CreateOrderResult,
  OrderSummary,
  ValidateStockResult,
} from '@/types/order';

interface UseOrdersReturn {
  orders: OrderSummary[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId?: string) => Promise<void>;
  createOrder: (params: CreateOrderParams) => Promise<CreateOrderResult>;
  validateStock: (items: CreateOrderParams['cartItems']) => Promise<ValidateStockResult[]>;
  getOrderById: (orderId: string) => Promise<OrderSummary | null>;
}

const normalizeOrders = (data?: OrderSummary[] | null): OrderSummary[] => {
  if (!data) {
    return [];
  }

  return data.map((order) => ({
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
  }));
};

export const useOrders = (): UseOrdersReturn => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (targetUserId?: string) => {
      const userId = targetUserId || user?.id;
      if (!userId) {
        setOrders([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('v_order_details')
          .select('*')
          .eq('user_id', userId)
          .order('order_date', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setOrders(normalizeOrders(data as OrderSummary[] | null));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Gagal mengambil data pesanan';
        setError(message);
        console.error('Error fetch orders:', err);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const validateStock = useCallback(
    async (items: CreateOrderParams['cartItems']) => {
      const { data, error: validateError } = await supabase.rpc('fn_validate_stock', {
        cart_items: items,
      });

      if (validateError) {
        throw validateError;
      }

      return (data || []) as ValidateStockResult[];
    },
    [],
  );

  const createOrder = useCallback(
    async ({ userId, cartItems, shippingAddress }: CreateOrderParams) => {
      if (!userId) {
        throw new Error('User tidak ditemukan, silakan login ulang.');
      }
      if (!cartItems.length) {
        throw new Error('Keranjang kosong.');
      }

      setLoading(true);
      setError(null);

      try {
        const stockResult = await validateStock(cartItems);
        const unavailable = stockResult.find((item) => !item.is_available);

        if (unavailable) {
          throw new Error(
            `${unavailable.product_name} stok tersisa ${unavailable.available_stock}. Silakan sesuaikan jumlah.`,
          );
        }

        const { data, error: rpcError } = await supabase.rpc('fn_create_order', {
          p_user_id: userId,
          p_cart_items: cartItems,
          p_shipping_address: shippingAddress ?? null,
        });

        if (rpcError) {
          throw rpcError;
        }

        const payload = (Array.isArray(data) ? data[0] : data) as CreateOrderResult | undefined;

        if (!payload || !payload.success) {
          throw new Error(payload?.message || 'Checkout gagal diproses');
        }

        await fetchOrders(userId);
        return payload;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Checkout gagal diproses';
        setError(message);
        console.error('Error create order:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders, validateStock],
  );

  const getOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: detailError } = await supabase
        .from('v_order_details')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (detailError) {
        throw detailError;
      }

      const normalized = normalizeOrders(data ? [data as OrderSummary] : []);
      return normalized[0] || null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil detail pesanan';
      setError(message);
      console.error('Error get order detail:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    } else {
      setOrders([]);
    }
  }, [fetchOrders, user?.id]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    validateStock,
    getOrderById,
  };
};
