# BahanKu — Copilot System Instruction (Final)

## Konteks Proyek

- Nama aplikasi: BahanKu — e-commerce bahan dapur (single-seller).
- Teknologi utama: React Native, TypeScript, Expo Router, dan Supabase (digunakan untuk autentikasi, database Postgres, dan penyimpanan gambar).
- Fokus utama adalah frontend yang berfungsi nyata, termasuk fitur autentikasi, katalog produk, keranjang belanja, proses checkout, resep, dan halaman admin.
- Platform utama: Android, dengan kompatibilitas untuk iOS.
- Semua komentar kode dan dokumentasi ditulis dalam Bahasa Indonesia.

## Gaya Koding & Konvensi

- Gunakan TypeScript dengan strict mode.
- Hindari penggunaan `any` kecuali memang benar-benar diperlukan.
- Kode harus modular, fungsi kecil, dan mudah dibaca.
- Untuk state global, gunakan Zustand yang disimpan dengan AsyncStorage.
- Gunakan `react-hook-form` dan `zod` untuk kebutuhan form dan validasi.
- Gunakan ikon dari lucide-react-native atau react-native-vector-icons.
- Styling menggunakan StyleSheet atau inline style, tetapi tetap konsisten lewat konfigurasi di `src/theme`.
- Gunakan pendekatan async/await, dan tangani error dengan try/catch.
- Hindari penggunaan emoji secara berlebihan.

## Struktur Folder Utama

```
app/
  (auth)/
  (tabs)/
  product/
  admin/
  recipes/
  favorites/
src/
  components/
  hooks/
  store/
  services/
  libs/
  theme/
  types/
```

## Pola Kode & Modul

- File Supabase client ada di `src/services/supabase.client.ts`.
- Hook utama yang digunakan meliputi: `useAuth`, `useProducts`, `useOrders`, dan `useRecipes`.
- Untuk manajemen state, gunakan store seperti `cart.store.ts` dan `ui.store.ts`.
- Upload gambar dilakukan lewat modul `services/image.ts`.
- Format harga menggunakan helper `libs/currency.ts`.
- Validasi form menggunakan skema dari `zod`.
- Navigasi dan routing dikelola dengan Expo Router.

## Praktik Terbaik

- Semua form wajib divalidasi menggunakan zod.
- Tampilkan komponen `EmptyState` jika data kosong.
- Setiap halaman harus punya indikator loading dan error handling.
- Simpan sesi login user di AsyncStorage.
- Semua teks yang tampil di UI ditulis dalam Bahasa Indonesia.
- Hindari logika kompleks di UI, pindahkan ke dalam hooks.
- Gunakan fungsi `formatCurrency()` untuk menampilkan harga.
- Terapkan tema global dari `theme/index.ts`.
- Gunakan alias `@/` untuk import dari folder `src`.

## Git & Panduan Pull Request

- Penamaan branch mengikuti format: `feature/<fitur>` atau `fix/<bug>`.
- Format commit: gunakan awalan seperti `feat:`, `fix:`, `chore:`, `refactor:`.
- Pesan commit ditulis dalam Bahasa Indonesia dan singkat.
- Setiap pull request harus menyertakan deskripsi singkat dan langkah uji manual.
- Reviewer utama untuk setiap PR adalah Pangeran (PBS).

## Dependensi Utama

- expo
- react-native
- expo-router
- zustand
- @react-native-async-storage/async-storage
- @supabase/supabase-js
- react-hook-form
- zod
- react-native-vector-icons

## Tracking Pekerjaan

- Sebelum mulai mengerjakan kode, Copilot wajib membaca file bernama "Development Checklist" di root proyek. File tersebut digunakan untuk melacak setiap langkah pekerjaan dan statusnya.
- Contoh:
  Jika sebelumnya: [Belum Dibuat] Buat hook useAuth  
   Setelah selesai, ubah menjadi: [Telah Dibuat] Buat hook useAuth
  Jika bagian masih dikerjakan, gunakan status: [Sedang Dikerjakan]

## Output Ideal dari Copilot

- Kode TypeScript yang bisa langsung dijalankan dan modular.
- Tidak mengandung emoji.
- Komentar bersifat teknis, bukan naratif.
- Jika ada bagian yang belum jelas, tambahkan komentar seperti:

```ts
// TODO: klarifikasi bagian ini (Bahasa Indonesia)
```

## Command Terminal untuk PowerShell Windows

- User menggunakan PowerShell Windows sebagai shell default
- SELALU pastikan user berada di folder `BahankuApp` sebelum menjalankan command instalasi atau build
- JANGAN langsung jalankan command instalasi tanpa navigasi ke folder yang benar
- Format command PowerShell:
  - Untuk pindah direktori: `cd BahankuApp` (BUKAN `cd BahankuApp &&`)
  - Untuk multiple command: gunakan `;` (BUKAN `&&`)
  - Contoh: `cd BahankuApp; npm install`

### Template Command yang Benar

```powershell
# BENAR - Untuk PowerShell Windows
cd BahankuApp
npm install

# ATAU dengan semicolon
cd BahankuApp; npm install

# SALAH - Jangan gunakan && di PowerShell
cd BahankuApp && npm install  # ❌ SALAH
```

### Instruksi Navigasi Folder

Sebelum memberikan command instalasi atau build:
1. Pastikan working directory saat ini dengan menyebutkan: "Pastikan Anda berada di folder `BahankuApp`"
2. Berikan instruksi navigasi eksplisit jika perlu
3. Format command harus sesuai PowerShell Windows

Contoh instruksi yang benar:
```
Jalankan command berikut di PowerShell:

# 1. Pindah ke folder BahankuApp (jika belum)
cd BahankuApp

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start aplikasi
npx expo start -c
```

### Cek Dependency Sebelum Install

Sebelum menyarankan `npm install`, SELALU cek dulu apakah dependency sudah lengkap:

```powershell
# Cek dependency yang terinstall
npm ls --depth=0

# Atau simulasi install tanpa benar-benar install
npm install --dry-run
```

Jika output clean tanpa error "missing" atau "UNMET DEPENDENCY", berarti tidak perlu install lagi.

Gaya penulisan harus natural dan mudah dibaca seperti dokumentasi proyek GitHub, tanpa emoji atau karakter tebal.
