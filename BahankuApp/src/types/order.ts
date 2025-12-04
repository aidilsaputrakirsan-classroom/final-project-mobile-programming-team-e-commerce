export type OrderStatus = 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

export interface OrderItemDetail {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image_url?: string | null;
}

export interface OrderSummary {
  order_id: string;
  user_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  total_price: number;
  status: OrderStatus;
  shipping_address?: string | null;
  order_date: string;
  updated_at?: string | null;
  items: OrderItemDetail[];
}

export interface ValidateStockResult {
  product_id: string;
  product_name: string;
  requested_qty: number;
  available_stock: number;
  is_available: boolean;
}

export interface CreateOrderResult {
  order_id: string;
  success: boolean;
  message: string;
}

export interface CreateOrderParams {
  userId: string;
  cartItems: { product_id: string; quantity: number }[];
  shippingAddress?: string;
}
