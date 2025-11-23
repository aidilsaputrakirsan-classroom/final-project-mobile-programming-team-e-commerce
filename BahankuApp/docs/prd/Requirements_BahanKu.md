# Requirements Document — BahanKu

## Introduction

**BahanKu** adalah aplikasi mobile e-commerce berbasis React Native (Expo) yang memungkinkan pengguna membeli bahan dapur secara online dari single-seller. Aplikasi ini dibangun dengan fokus pada pengalaman pengguna yang intuitif, performa tinggi, dan integrasi penuh dengan Supabase sebagai backend (PostgreSQL, Auth, Storage).

**Target Platform:**
- Android (desain utama)
- iOS (kompatibel via Expo Go)

**Persona Utama:**
1. **Customer** — Pengguna yang ingin membeli bahan dapur dan mencari inspirasi resep
2. **Admin (Superadmin)** — Pengelola yang mengatur produk, kategori, dan status pesanan

**Nilai Bisnis:**
- Menyediakan solusi belanja bahan dapur yang cepat dan terpercaya
- Memberikan inspirasi resep yang terintegrasi dengan produk yang dijual
- Mengurangi kompleksitas backend dengan memanfaatkan Supabase sebagai BaaS (Backend-as-a-Service)

**Asumsi dan Batasan:**
- Aplikasi hanya mendukung satu penjual (single-seller)
- Pembayaran menggunakan metode COD (Cash on Delivery) atau transfer manual (fase awal)
- Data produk, pesanan, dan resep tersimpan di Supabase PostgreSQL
- Gambar produk dan resep disimpan di Supabase Storage
- Offline-first untuk cart dan produk terakhir (disimpan di AsyncStorage)

---

## Glossary

- **Customer**: Pengguna aplikasi yang dapat membeli produk dan menyimpan resep favorit
- **Admin/Superadmin**: Pengguna dengan role khusus yang dapat mengelola produk, kategori, dan pesanan
- **Cart (Keranjang)**: Koleksi produk yang dipilih pengguna sebelum checkout
- **Order (Pesanan)**: Transaksi pembelian yang telah dikonfirmasi pengguna
- **Order Item**: Detail produk dalam satu pesanan (product_id, quantity, subtotal)
- **Recipe (Resep)**: Panduan memasak yang terhubung dengan produk yang dijual
- **Favorite Recipe**: Resep yang disimpan pengguna untuk akses cepat
- **Category (Kategori)**: Klasifikasi produk (mis. Sayuran, Daging, Bumbu)
- **Stock**: Jumlah produk yang tersedia untuk dijual
- **Status Pesanan**: State pesanan (diproses, dikirim, selesai, dibatalkan)
- **Supabase Auth**: Sistem autentikasi Supabase (email/password + OAuth Google)
- **AsyncStorage**: Penyimpanan lokal React Native untuk cache dan persist state

---

## Requirements

### Requirement 1: User Authentication

**User Story:** Sebagai customer, saya ingin dapat mendaftar dan login ke aplikasi, sehingga saya dapat menyimpan data pesanan dan preferensi saya.

#### Acceptance Criteria

1. **GIVEN** pengguna berada di halaman register  
   **WHEN** pengguna mengisi email, password (min 6 karakter), dan nama lengkap lalu submit  
   **THEN** sistem membuat akun baru via Supabase Auth dan redirect ke halaman home

2. **GIVEN** pengguna sudah terdaftar  
   **WHEN** pengguna login dengan email dan password yang benar  
   **THEN** sistem menyimpan session ke AsyncStorage dan redirect ke halaman home

3. **GIVEN** pengguna memilih "Login dengan Google"  
   **WHEN** autentikasi Google berhasil  
   **THEN** sistem membuat/login akun pengguna dan redirect ke halaman home

4. **GIVEN** pengguna sudah login sebelumnya  
   **WHEN** aplikasi dibuka kembali  
   **THEN** sistem otomatis restore session dari AsyncStorage tanpa perlu login ulang

5. **GIVEN** pengguna menekan tombol logout  
   **WHEN** konfirmasi logout diterima  
   **THEN** sistem menghapus session dari AsyncStorage dan Supabase, lalu redirect ke halaman login

---

### Requirement 2: Product Listing and Search

**User Story:** Sebagai customer, saya ingin melihat daftar produk yang tersedia, sehingga saya dapat memilih produk yang ingin dibeli.

#### Acceptance Criteria

1. **GIVEN** pengguna berada di halaman home  
   **WHEN** data produk berhasil dimuat dari Supabase  
   **THEN** sistem menampilkan grid/list produk dengan gambar, nama, harga, dan stok

2. **GIVEN** pengguna mengetik keyword di search bar  
   **WHEN** input berubah (debounced 300ms)  
   **THEN** sistem memfilter produk berdasarkan nama atau deskripsi yang cocok

3. **GIVEN** pengguna memilih kategori tertentu dari dropdown/chip  
   **WHEN** kategori dipilih  
   **THEN** sistem hanya menampilkan produk dari kategori tersebut

4. **GIVEN** tidak ada produk yang sesuai filter  
   **WHEN** hasil kosong  
   **THEN** sistem menampilkan EmptyState component dengan pesan "Produk tidak ditemukan"

5. **GIVEN** produk memiliki stok 0  
   **WHEN** produk ditampilkan  
   **THEN** sistem menampilkan badge "Habis" dan disable tombol "Tambah ke Keranjang"

---

### Requirement 3: Product Detail

**User Story:** Sebagai customer, saya ingin melihat detail lengkap produk, sehingga saya dapat memutuskan apakah produk sesuai kebutuhan saya.

#### Acceptance Criteria

1. **GIVEN** pengguna menekan card produk di halaman home  
   **WHEN** navigasi ke `/product/[id]` berhasil  
   **THEN** sistem menampilkan gambar besar, nama, harga, deskripsi lengkap, kategori, dan stok

2. **GIVEN** pengguna berada di halaman detail produk  
   **WHEN** pengguna menekan tombol "+" atau "-" pada quantity stepper  
   **THEN** sistem mengubah jumlah produk (min 1, max stok tersedia)

3. **GIVEN** pengguna menekan tombol "Tambah ke Keranjang"  
   **WHEN** quantity valid (>0 dan ≤ stok)  
   **THEN** sistem menambahkan produk ke cart store (Zustand) dan menampilkan toast success

4. **GIVEN** pengguna sudah menambahkan produk yang sama ke cart  
   **WHEN** produk ditambahkan lagi  
   **THEN** sistem menambahkan quantity (bukan membuat item baru di cart)

---

### Requirement 4: Shopping Cart Management

**User Story:** Sebagai customer, saya ingin mengelola produk di keranjang, sehingga saya dapat menyesuaikan pesanan sebelum checkout.

#### Acceptance Criteria

1. **GIVEN** pengguna membuka halaman cart (`/cart`)  
   **WHEN** cart memiliki item  
   **THEN** sistem menampilkan daftar item dengan nama, harga, quantity, subtotal, dan tombol hapus

2. **GIVEN** pengguna mengubah quantity di halaman cart  
   **WHEN** quantity valid (1 ≤ qty ≤ stok)  
   **THEN** sistem update cart store dan recalculate total harga

3. **GIVEN** pengguna menekan tombol hapus item  
   **WHEN** konfirmasi diterima  
   **THEN** sistem menghapus item dari cart dan update total

4. **GIVEN** cart kosong  
   **WHEN** pengguna membuka halaman cart  
   **THEN** sistem menampilkan EmptyState dengan pesan "Keranjang kosong" dan tombol "Belanja Sekarang"

5. **GIVEN** pengguna menutup aplikasi  
   **WHEN** aplikasi dibuka kembali  
   **THEN** cart tetap ada (persist via AsyncStorage melalui Zustand middleware)

---

### Requirement 5: Checkout and Order Creation

**User Story:** Sebagai customer, saya ingin melakukan checkout, sehingga pesanan saya tercatat dan diproses oleh admin.

#### Acceptance Criteria

1. **GIVEN** pengguna menekan tombol "Checkout" di halaman cart  
   **WHEN** cart tidak kosong dan pengguna sudah login  
   **THEN** sistem menampilkan konfirmasi dengan total harga dan alamat pengiriman (dari profil atau input)

2. **GIVEN** pengguna konfirmasi checkout  
   **WHEN** tombol "Buat Pesanan" ditekan  
   **THEN** sistem membuat record di tabel `orders` dan `order_items` di Supabase dengan status "diproses"

3. **GIVEN** pesanan berhasil dibuat  
   **WHEN** data tersimpan di database  
   **THEN** sistem clear cart, menampilkan toast success, dan redirect ke halaman `/orders`

4. **GIVEN** produk di cart stoknya tidak cukup saat checkout  
   **WHEN** sistem melakukan validasi stok  
   **THEN** sistem menampilkan error dan mencegah pembuatan pesanan

---

### Requirement 6: Order History and Status

**User Story:** Sebagai customer, saya ingin melihat riwayat pesanan saya, sehingga saya dapat melacak status pengiriman.

#### Acceptance Criteria

1. **GIVEN** pengguna membuka halaman `/orders`  
   **WHEN** data pesanan dimuat dari Supabase  
   **THEN** sistem menampilkan list pesanan dengan tanggal, total harga, dan status (diproses, dikirim, selesai)

2. **GIVEN** pengguna menekan pesanan tertentu  
   **WHEN** navigasi ke detail pesanan berhasil  
   **THEN** sistem menampilkan daftar produk dalam pesanan (nama, qty, subtotal) dan status pengiriman

3. **GIVEN** tidak ada pesanan  
   **WHEN** pengguna membuka halaman orders  
   **THEN** sistem menampilkan EmptyState "Belum ada pesanan"

4. **GIVEN** admin mengubah status pesanan di admin panel  
   **WHEN** customer membuka halaman orders  
   **THEN** sistem menampilkan status terbaru dari Supabase

---

### Requirement 7: Admin Product Management (CRUD)

**User Story:** Sebagai admin, saya ingin mengelola produk (create, read, update, delete), sehingga katalog produk selalu up-to-date.

#### Acceptance Criteria

1. **GIVEN** admin login dengan role "admin"  
   **WHEN** membuka halaman `/admin/products`  
   **THEN** sistem menampilkan list produk dengan tombol "Edit" dan "Hapus"

2. **GIVEN** admin menekan tombol "Tambah Produk"  
   **WHEN** form diisi lengkap (nama, kategori, harga, stok, deskripsi, gambar)  
   **THEN** sistem upload gambar ke Supabase Storage, simpan URL ke tabel `products`, dan redirect ke list produk

3. **GIVEN** admin menekan tombol "Edit" pada produk  
   **WHEN** form edit muncul dan admin mengubah data  
   **THEN** sistem update record di tabel `products` (termasuk gambar jika diganti)

4. **GIVEN** admin menekan tombol "Hapus" pada produk  
   **WHEN** konfirmasi diterima  
   **THEN** sistem menghapus produk dari database dan gambar dari Storage (jika tidak digunakan produk lain)

5. **GIVEN** form produk disubmit dengan data invalid  
   **WHEN** validasi Zod gagal  
   **THEN** sistem menampilkan error message di field yang relevan

---

### Requirement 8: Admin Order Management

**User Story:** Sebagai admin, saya ingin mengubah status pesanan, sehingga customer dapat melacak progres pengiriman.

#### Acceptance Criteria

1. **GIVEN** admin membuka halaman `/admin/orders`  
   **WHEN** data pesanan dimuat  
   **THEN** sistem menampilkan list pesanan dengan info customer, tanggal, total, dan status

2. **GIVEN** admin menekan tombol "Ubah Status" pada pesanan  
   **WHEN** admin memilih status baru (diproses → dikirim → selesai)  
   **THEN** sistem update status di tabel `orders` dan tampilkan toast success

3. **GIVEN** admin menekan pesanan tertentu  
   **WHEN** detail pesanan muncul  
   **THEN** sistem menampilkan daftar produk dalam pesanan dan alamat pengiriman customer

4. **GIVEN** pesanan memiliki status "dibatalkan"  
   **WHEN** admin mencoba mengubah status  
   **THEN** sistem mencegah perubahan status dan menampilkan peringatan

---

### Requirement 9: Recipe Listing and Detail

**User Story:** Sebagai customer, saya ingin melihat resep masakan, sehingga saya mendapat inspirasi dan dapat membeli bahan yang diperlukan.

#### Acceptance Criteria

1. **GIVEN** pengguna membuka halaman `/recipes`  
   **WHEN** data resep dimuat dari Supabase  
   **THEN** sistem menampilkan grid/list resep dengan gambar, judul, dan deskripsi singkat

2. **GIVEN** pengguna menekan card resep  
   **WHEN** navigasi ke `/recipes/[id]` berhasil  
   **THEN** sistem menampilkan gambar besar, judul, langkah-langkah, dan daftar bahan (linked ke produk)

3. **GIVEN** resep memiliki produk terkait  
   **WHEN** pengguna menekan nama bahan  
   **THEN** sistem navigasi ke detail produk terkait

4. **GIVEN** tidak ada resep di database  
   **WHEN** pengguna membuka halaman recipes  
   **THEN** sistem menampilkan EmptyState "Resep akan segera hadir"

---

### Requirement 10: Favorite Recipes

**User Story:** Sebagai customer, saya ingin menyimpan resep favorit, sehingga saya dapat mengaksesnya dengan cepat.

#### Acceptance Criteria

1. **GIVEN** pengguna berada di halaman detail resep  
   **WHEN** pengguna menekan tombol "Simpan ke Favorit" (icon heart)  
   **THEN** sistem menyimpan record di tabel `favorite_recipes` dan ubah icon menjadi filled

2. **GIVEN** resep sudah ada di favorit  
   **WHEN** pengguna menekan tombol favorit lagi  
   **THEN** sistem menghapus record dari `favorite_recipes` dan ubah icon menjadi outline

3. **GIVEN** pengguna membuka halaman `/favorites`  
   **WHEN** data favorit dimuat  
   **THEN** sistem menampilkan grid/list resep favorit dengan info sama seperti halaman recipes

4. **GIVEN** tidak ada resep favorit  
   **WHEN** pengguna membuka halaman favorites  
   **THEN** sistem menampilkan EmptyState "Belum ada resep favorit"

---

### Requirement 11: User Profile and Settings

**User Story:** Sebagai customer, saya ingin melihat dan mengubah profil saya, sehingga informasi akun saya selalu akurat.

#### Acceptance Criteria

1. **GIVEN** pengguna membuka halaman `/profile`  
   **WHEN** data user dimuat dari Supabase Auth  
   **THEN** sistem menampilkan nama, email, dan foto profil (jika ada)

2. **GIVEN** pengguna menekan tombol "Edit Profil"  
   **WHEN** form edit muncul dan pengguna mengubah nama  
   **THEN** sistem update data di tabel `users` dan tampilkan toast success

3. **GIVEN** pengguna toggle dark mode di halaman settings  
   **WHEN** toggle berubah  
   **THEN** sistem simpan preferensi ke AsyncStorage dan terapkan tema secara real-time

4. **GIVEN** pengguna menekan tombol "Logout"  
   **WHEN** konfirmasi logout diterima  
   **THEN** sistem hapus session dan redirect ke halaman login

---

### Requirement 12: Offline Support (Optional)

**User Story:** Sebagai customer, saya ingin tetap dapat melihat produk dan cart saat offline, sehingga saya tidak kehilangan data saat koneksi terputus.

#### Acceptance Criteria

1. **GIVEN** pengguna pernah membuka halaman home  
   **WHEN** aplikasi offline  
   **THEN** sistem menampilkan produk terakhir yang di-cache di AsyncStorage

2. **GIVEN** pengguna menambahkan produk ke cart saat offline  
   **WHEN** cart store di-update  
   **THEN** sistem tetap menyimpan cart ke AsyncStorage (sync saat online)

3. **GIVEN** pengguna mencoba checkout saat offline  
   **WHEN** tombol checkout ditekan  
   **THEN** sistem menampilkan error "Tidak ada koneksi internet"

---

### Requirement 13: UI/UX Consistency

**User Story:** Sebagai pengguna, saya ingin aplikasi memiliki tampilan yang konsisten dan responsif, sehingga pengalaman saya menyenangkan.

#### Acceptance Criteria

1. **GIVEN** pengguna menggunakan aplikasi  
   **WHEN** berpindah antar halaman  
   **THEN** warna, font, spacing, dan komponen mengikuti design system global (`src/theme`)

2. **GIVEN** loading data dari server  
   **WHEN** request sedang berlangsung  
   **THEN** sistem menampilkan loading indicator (spinner atau skeleton)

3. **GIVEN** error terjadi saat request  
   **WHEN** error message muncul  
   **THEN** sistem menampilkan toast/alert dengan bahasa Indonesia yang jelas

4. **GIVEN** pengguna menggunakan perangkat dengan ukuran layar berbeda  
   **WHEN** layout di-render  
   **THEN** komponen menyesuaikan dengan baik (responsive untuk Android & iOS)

---

### Requirement 14: Form Validation

**User Story:** Sebagai pengguna, saya ingin mendapat feedback langsung saat mengisi form, sehingga saya dapat memperbaiki kesalahan sebelum submit.

#### Acceptance Criteria

1. **GIVEN** pengguna mengisi form (login, register, product form, dll)  
   **WHEN** input tidak sesuai aturan (mis. email invalid, password < 6 karakter)  
   **THEN** sistem menampilkan error message di bawah field yang salah (validasi via Zod)

2. **GIVEN** pengguna submit form dengan data kosong  
   **WHEN** required field tidak diisi  
   **THEN** sistem mencegah submit dan highlight field yang wajib diisi

3. **GIVEN** validasi berhasil  
   **WHEN** form disubmit  
   **THEN** sistem menampilkan loading state dan disable tombol submit (prevent double submit)

---

### Requirement 15: Performance and Data Limits

**User Story:** Sebagai developer, saya ingin aplikasi tetap performa tinggi, sehingga pengalaman pengguna tidak terganggu oleh lag atau crash.

#### Acceptance Criteria

1. **GIVEN** halaman home memuat 100+ produk  
   **WHEN** data di-render  
   **THEN** sistem menggunakan FlatList dengan virtualization untuk menghindari lag

2. **GIVEN** pengguna mengetik di search bar  
   **WHEN** input berubah cepat  
   **THEN** sistem debounce request (300ms) untuk mengurangi beban server

3. **GIVEN** gambar produk berukuran besar  
   **WHEN** gambar dimuat  
   **THEN** sistem compress/resize gambar sebelum upload ke Supabase Storage (max 1MB)

4. **GIVEN** cart memiliki 50+ item  
   **WHEN** cart di-persist ke AsyncStorage  
   **THEN** sistem menyimpan tanpa delay signifikan (< 100ms)

---