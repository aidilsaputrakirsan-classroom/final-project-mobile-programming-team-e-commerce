import { readAsStringAsync } from 'expo-file-system/legacy';

import { supabase } from './supabase.client';

const BUCKET_NAME = 'products';

export interface UploadImageResult {
  url: string;
  path: string;
}

// Fungsi decode base64 ke ArrayBuffer (native implementation)
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Upload gambar ke Supabase Storage (React Native compatible)
export async function uploadProductImage(
  uri: string,
  productId: string,
): Promise<UploadImageResult | null> {
  try {
    // Baca file sebagai base64 (cara yang bekerja di React Native)
    const base64 = await readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Generate nama file unik
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Tentukan content type
    const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

    // Konversi base64 ke ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(base64);

    // Upload ke storage menggunakan ArrayBuffer
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType,
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
