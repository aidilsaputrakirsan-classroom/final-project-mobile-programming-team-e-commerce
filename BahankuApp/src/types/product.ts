export interface Product {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  category?: string; // Category name for display
  discount_percent?: number;
  discounted_price?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  image_url?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: string;
  image_url?: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
