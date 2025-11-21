import { supabase } from './supabase.client';

const BUCKET_NAME = 'products';

export interface UploadImageResult {
  url: string;
  path: string;
}

// Upload gambar ke Supabase Storage
export async function uploadProductImage(
  uri: string,
  productId: string,
): Promise<UploadImageResult | null> {
  try {
    // Konversi URI ke blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate nama file unik
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload ke storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Dapatkan public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Hapus gambar dari Supabase Storage
export async function deleteProductImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Dapatkan public URL dari path
export function getProductImageUrl(path: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return publicUrl;
}

// Setup bucket (hanya perlu dijalankan sekali)
export async function setupProductsBucket(): Promise<boolean> {
  try {
    // Cek apakah bucket sudah ada
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      // Buat bucket baru
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error setting up bucket:', error);
    return false;
  }
}
