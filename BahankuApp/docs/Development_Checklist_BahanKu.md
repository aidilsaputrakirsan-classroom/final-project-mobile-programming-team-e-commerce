# BahanKu — Development Checklist

Catatan: File ini digunakan untuk melacak progres pengembangan aplikasi BahanKu.  
Setiap bagian berisi daftar langkah detail yang harus diselesaikan.  
Status: [Belum Dibuat] | [Sedang Dikerjakan] | [Telah Dibuat]  
Penanggung jawab: (Pangeran) | (Adam)

---

## 1. Setup Proyek

- [Telah Dibuat] Inisialisasi proyek Expo dengan TypeScript di folder `BahankuApp` (Pangeran)
- [Telah Dibuat] Konfigurasi ESLint dan Prettier (Pangeran)
- [Telah Dibuat] Setup environment Supabase (URL dan anon key) (Pangeran)
- [Telah Dibuat] Buat struktur folder utama (app, src, dll) (Pangeran)
- [Telah Dibuat] Konfigurasi alias path "@" di tsconfig.json (Pangeran)
- [Telah Dibuat] Setup .env dan tambahkan ke gitignore (Pangeran)
- [Telah Dibuat] Tes build awal dengan Expo Go di Android dan iOS (Pangeran)

---

## 2. Konfigurasi Dasar

- [Telah Dibuat] Buat file supabase.client.ts (Pangeran)
- [Telah Dibuat] Tambahkan konfigurasi auth Supabase (persist session AsyncStorage) (Pangeran)
- [Telah Dibuat] Siapkan tema global (warna, font, spacing) (Adam)
- [Telah Dibuat] Tambahkan util formatCurrency() di libs/currency.ts (Shared)
- [Telah Dibuat] Buat komponen EmptyState dan ProductCard (Adam)

---

## 3. Autentikasi

- [Telah Dibuat] Buat hook useAuth (login, register, logout, Google Sign-In) (Pangeran)
- [Telah Dibuat] Halaman login.tsx (Adam)
- [Telah Dibuat] Halaman register.tsx (Adam)
- [Telah Dibuat] Persist sesi login ke AsyncStorage (Pangeran)
- [Telah Dibuat] Router guard untuk halaman (auth) (Pangeran)

---

## 4. Produk

- [Telah Dibuat] Hook useProducts (list, getById, create, update, delete) (Pangeran)
- [Telah Dibuat] Halaman home.tsx (list produk, search, filter kategori) (Adam)
- [Telah Dibuat] Halaman detail produk [id].tsx (Adam)
- [Telah Dibuat] Integrasi Supabase Storage untuk gambar produk (Adam)

---

## 5. Keranjang (Cart)

- [Telah Dibuat] Buat Zustand store cart.store.ts (Pangeran)
- [Telah Dibuat] Tambah fungsi addItem, updateQty, removeItem, clear, total (Pangeran)
- [Telah Dibuat] Persist cart ke AsyncStorage (Pangeran)
- [Telah Dibuat] Halaman cart.tsx (list item dan total harga) (Adam)
- [Telah Dibuat] Tombol Checkout + modal alamat (Adam)

---

## 6. Pesanan

- [Telah Dibuat] Hook useOrders (createOrder, listMyOrders, updateStatus) (Pangeran) — fungsi create/list/detail/status sudah tersedia, lint & QA belum dijalankan
- [Telah Dibuat] Insert order & order_items ke Supabase (Pangeran) — integrasi RPC `fn_create_order` + view `v_order_details`
- [Telah Dibuat] Halaman orders.tsx (riwayat pesanan user) (Pangeran) — list + detail sudah terhubung
- [Telah Dibuat] Halaman admin/orders.tsx (ubah status pesanan) (Pangeran) — perlu guard admin + validasi lanjutan

---

## 7. Admin Produk

- [Telah Dibuat] Halaman admin/products.tsx (list + search + hapus produk + menu aksi) (Adam)
- [Telah Dibuat] Halaman admin/product-form.tsx (tambah & edit produk dengan validasi Zod) (Adam)
- [Telah Dibuat] Upload gambar ke Storage via image.ts (React Native compatible dengan expo-file-system/legacy) (Adam)
- [Telah Dibuat] UI statistik modern (compact layout, subtle tint border, icon reinforcement) (Adam)
- [Telah Dibuat] Input URL gambar alternative di form produk (Adam)

---

## 8. Resep & Favorit

- [Telah Dibuat] Hook useRecipes (list resep, getById, search) (Pangeran)
- [Telah Dibuat] Hook toggleFavorite, getMyFavorites, checkIsFavorite (Pangeran)
- [Telah Dibuat] Komponen RecipeCard dengan tombol favorit (Adam)
- [Telah Dibuat] Halaman recipes/index.tsx (list resep dengan search) (Adam)
- [Telah Dibuat] Halaman recipes/[id].tsx (detail resep + bahan + langkah) (Adam)
- [Telah Dibuat] Halaman favorites/index.tsx (list resep favorit) (Pangeran)
- [Telah Dibuat] Navigasi dari halaman profile ke resep dan favorit (Adam)
- [Telah Dibuat] QuickActions di home page mengarah ke halaman resep (Adam)
- [Telah Dibuat] Type definitions untuk Recipe, RecipeProduct, FavoriteRecipe (Pangeran)

---

## 9. Pengaturan & Profil

- [Telah Dibuat] Halaman profile.tsx (tampil nama, email, tombol logout, menu "Kelola Produk" untuk admin) (Adam)
- [Belum Dibuat] Tambahkan toggle dark mode di ui.store.ts (Pangeran)

---

## 10. Testing dan Polishing

- [Belum Dibuat] Periksa semua navigasi antar halaman (Adam)
- [Belum Dibuat] Uji login, register, dan logout (Pangeran)
- [Belum Dibuat] Uji checkout dan status pesanan (Pangeran)
- [Belum Dibuat] Uji CRUD produk (admin) (Adam)
- [Belum Dibuat] Uji resep dan favorit (Adam)
- [Belum Dibuat] Lint dan typecheck final (Shared)
- [Belum Dibuat] Buat dokumentasi README final (Shared)
