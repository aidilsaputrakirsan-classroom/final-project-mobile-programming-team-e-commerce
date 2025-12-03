import { useState, useCallback } from 'react';

import { supabase } from '@/services/supabase.client';
import {
    Recipe,
    RecipeDetail,
    FavoriteRecipe,
    ToggleFavoriteResult,
} from '@/types/recipe';

interface UseRecipesOptions {
    autoFetch?: boolean;
}

export function useRecipes(options: UseRecipesOptions = {}) {
    const { autoFetch = false } = options;
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [favorites, setFavorites] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ambil semua resep
    const fetchRecipes = useCallback(async (search?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('recipes')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter berdasarkan search
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setRecipes(data || []);
            return data || [];
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Gagal mengambil data resep';
            setError(errorMessage);
            console.error('Error fetching recipes:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Ambil resep berdasarkan ID dengan detail bahan-bahan
    const getRecipeById = useCallback(async (id: string): Promise<RecipeDetail | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('recipes')
                .select(
                    `
          *,
          recipe_products (
            id,
            quantity,
            notes,
            product_id,
            products (
              id,
              name,
              price,
              stock,
              image_url
            )
          )
        `,
                )
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            if (!data) {
                return null;
            }

            // Transform data untuk mencocokkan tipe RecipeDetail
            const recipeDetail: RecipeDetail = {
                ...data,
                recipe_products:
                    data.recipe_products?.map(
                        (rp: {
                            id: string;
                            quantity?: string;
                            notes?: string;
                            product_id: string;
                            products?: Record<string, unknown>;
                        }) => ({
                            id: rp.id,
                            recipe_id: id,
                            product_id: rp.product_id,
                            quantity: rp.quantity,
                            notes: rp.notes,
                            product: rp.products,
                        }),
                    ) || [],
            };

            return recipeDetail;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Gagal mengambil detail resep';
            setError(errorMessage);
            console.error('Error fetching recipe:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cek apakah resep sudah difavoritkan oleh user
    const checkIsFavorite = useCallback(
        async (userId: string, recipeId: string): Promise<boolean> => {
            try {
                const { data, error } = await supabase
                    .from('favorite_recipes')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('recipe_id', recipeId)
                    .maybeSingle();

                if (error) throw error;
                return !!data;
            } catch (err) {
                console.error('Error checking favorite:', err);
                return false;
            }
        },
        [],
    );

    // Toggle favorit (tambah atau hapus dari favorit)
    const toggleFavorite = useCallback(
        async (userId: string, recipeId: string): Promise<ToggleFavoriteResult> => {
            setError(null);

            try {
                // Cek apakah sudah difavoritkan
                const { data: existing, error: checkError } = await supabase
                    .from('favorite_recipes')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('recipe_id', recipeId)
                    .maybeSingle();

                if (checkError) throw checkError;

                if (existing) {
                    // Hapus dari favorit
                    const { error: deleteError } = await supabase
                        .from('favorite_recipes')
                        .delete()
                        .eq('id', existing.id);

                    if (deleteError) throw deleteError;

                    return {
                        isFavorite: false,
                        message: 'Resep dihapus dari favorit',
                    };
                } else {
                    // Tambah ke favorit
                    const { error: insertError } = await supabase.from('favorite_recipes').insert({
                        user_id: userId,
                        recipe_id: recipeId,
                    });

                    if (insertError) throw insertError;

                    return {
                        isFavorite: true,
                        message: 'Resep ditambahkan ke favorit',
                    };
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Gagal mengubah status favorit';
                setError(errorMessage);
                console.error('Error toggling favorite:', err);
                return {
                    isFavorite: false,
                    message: errorMessage,
                };
            }
        },
        [],
    );

    // Ambil semua resep favorit user
    const fetchMyFavorites = useCallback(async (userId: string): Promise<Recipe[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('favorite_recipes')
                .select(
                    `
          id,
          recipe_id,
          created_at,
          recipes (*)
        `,
                )
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Extract recipes dari hasil join - handle berbagai tipe respons Supabase
            const favoriteRecipes: Recipe[] = [];
            if (data) {
                for (const fav of data) {
                    // Supabase bisa mengembalikan recipes sebagai object atau array
                    const recipeData = fav.recipes;
                    if (
                        recipeData &&
                        typeof recipeData === 'object' &&
                        !Array.isArray(recipeData)
                    ) {
                        favoriteRecipes.push(recipeData as Recipe);
                    } else if (Array.isArray(recipeData) && recipeData.length > 0) {
                        favoriteRecipes.push(recipeData[0] as Recipe);
                    }
                }
            }

            setFavorites(favoriteRecipes);
            return favoriteRecipes;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Gagal mengambil resep favorit';
            setError(errorMessage);
            console.error('Error fetching favorites:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Ambil semua ID resep favorit untuk cek status favorit di list
    const getFavoriteIds = useCallback(async (userId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('favorite_recipes')
                .select('recipe_id')
                .eq('user_id', userId);

            if (error) throw error;

            return data?.map((fav) => fav.recipe_id) || [];
        } catch (err) {
            console.error('Error fetching favorite IDs:', err);
            return [];
        }
    }, []);

    return {
        recipes,
        favorites,
        isLoading,
        error,
        fetchRecipes,
        getRecipeById,
        checkIsFavorite,
        toggleFavorite,
        fetchMyFavorites,
        getFavoriteIds,
    };
}
