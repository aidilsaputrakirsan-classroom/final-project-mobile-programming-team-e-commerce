import { Product } from './product';

// Tipe data resep
export interface Recipe {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    steps?: string; // Langkah-langkah memasak dalam format teks atau JSON string
    cooking_time?: number; // Waktu memasak dalam menit
    servings?: number; // Jumlah porsi
    difficulty?: 'mudah' | 'sedang' | 'sulit';
    created_at?: string;
    updated_at?: string;
}

// Relasi resep dengan produk (bahan)
export interface RecipeProduct {
    id: string;
    recipe_id: string;
    product_id: string;
    quantity?: string; // Contoh: "2 buah", "500 gram"
    notes?: string; // Catatan tambahan, contoh: "potong dadu"
    product?: Product; // Data produk (joined)
    created_at?: string;
}

// Resep favorit user
export interface FavoriteRecipe {
    id: string;
    user_id: string;
    recipe_id: string;
    recipe?: Recipe; // Data resep (joined)
    created_at?: string;
}

// Resep dengan detail lengkap (termasuk bahan-bahan)
export interface RecipeDetail extends Recipe {
    recipe_products?: RecipeProduct[];
}

// Input untuk membuat resep baru (admin)
export interface CreateRecipeInput {
    title: string;
    description?: string;
    image_url?: string;
    steps?: string;
    cooking_time?: number;
    servings?: number;
    difficulty?: 'mudah' | 'sedang' | 'sulit';
}

// Input untuk update resep (admin)
export interface UpdateRecipeInput {
    title?: string;
    description?: string;
    image_url?: string;
    steps?: string;
    cooking_time?: number;
    servings?: number;
    difficulty?: 'mudah' | 'sedang' | 'sulit';
}

// Response toggle favorite
export interface ToggleFavoriteResult {
    isFavorite: boolean;
    message: string;
}
