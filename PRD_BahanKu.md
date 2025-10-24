# 🧾 Product Requirement Document — BahanKu

## 1️⃣ Identitas & Tujuan

- **Nama Aplikasi:** BahanKu
- **Jenis:** Aplikasi e-commerce bahan dapur + inspirasi resep (single-seller)
- **Platform Target:** Android (basis desain utama) & iOS (kompatibel via Expo Go)
- **Tujuan Utama:**
  - Menghadirkan pengalaman belanja bahan dapur yang realistis dan cepat tanpa backend custom.
  - Semua data (produk, resep, pesanan, favorit) terhubung ke **Supabase (PostgreSQL + Storage)**.
  - Fokus utama pada frontend yang berfungsi nyata dan mudah dioperasikan.

---

## 2️⃣ Fitur Utama (MVP)

| Fitur                   | Deskripsi                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Autentikasi (Auth)**  | Login, register via email/password + Google Auth Supabase                                    |
| **Produk**              | Lihat, cari, filter kategori dinamis dari tabel `categories`, dan buka detail                |
| **Keranjang (Cart)**    | Tambah/hapus item, update jumlah, simpan cache lokal (AsyncStorage)                          |
| **Checkout & Pesanan**  | Buat pesanan nyata (`orders`, `order_items`), status berubah: _diproses → dikirim → selesai_ |
| **Admin (Superadmin)**  | CRUD Produk + upload gambar ke Supabase Storage + manajemen pesanan                          |
| **Resep**               | Daftar resep dan bahan yang relevan ke produk                                                |
| **Favorit Resep**       | Simpan resep favorit user di Supabase (tabel `favorite_recipes`)                             |
| **Profil & Pengaturan** | Lihat data pengguna, ubah nama, logout, dark mode toggle                                     |
| **Offline Cache**       | Produk terakhir dan cart disimpan di AsyncStorage untuk akses cepat                          |

---

## 3️⃣ Tech Stack

- **Frontend:** React Native + TypeScript + Expo Router
- **State Management:** Zustand + AsyncStorage
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Form Validation:** react-hook-form + zod
- **UI/Ikon:** react-native-vector-icons atau lucide-react-native
- **Style:** StyleSheet + theme custom (`src/theme`)
- **Lint/Format:** ESLint + Prettier
- **Testing (opsional):** Jest + @testing-library/react-native

---

## 4️⃣ Arsitektur & Flow

### Struktur Folder

```
app/
  (auth)/
    login.tsx
    register.tsx
  (tabs)/
    index.tsx
    home.tsx
    cart.tsx
    orders.tsx
    profile.tsx
  product/
    [id].tsx
  admin/
    index.tsx
    products.tsx
    product-form.tsx
    orders.tsx
  recipes/
    index.tsx
    [id].tsx
  favorites/
    index.tsx

src/
  components/
    ProductCard.tsx
    QuantityStepper.tsx
    EmptyState.tsx
    RecipeCard.tsx
  hooks/
    useAuth.ts
    useProducts.ts
    useOrders.ts
    useRecipes.ts
  store/
    cart.store.ts
    ui.store.ts
  services/
    supabase.client.ts
    image.ts
  libs/
    currency.ts
    helpers.ts
  theme/
    index.ts
  types/
    db.ts
```

---

### Flow Data

- **Auth:** Supabase → AsyncStorage → Zustand → Router guard
- **Produk:** Supabase → cache opsional di AsyncStorage
- **Keranjang:** Zustand + persist (AsyncStorage)
- **Checkout:** Simpan pesanan ke `orders` & `order_items` → clear cart
- **Resep & Favorit:** Supabase (`recipes`, `favorite_recipes`)
- **Offline:** produk & cart terakhir tersimpan untuk akses cepat

---

### Relasi Tabel (Supabase)

```
users(id, name, email, role)
categories(id, name)
products(id, category_id, name, description, price, stock, image_url)
orders(id, user_id, total_price, status, created_at)
order_items(id, order_id, product_id, quantity, subtotal)
recipes(id, title, description, image_url)
recipe_products(id, recipe_id, product_id)
favorite_recipes(id, user_id, recipe_id)
```

---

### Routing Expo Router

- `(auth)`: login, register
- `(tabs)`: home, cart, orders, profile
- `/product/[id]`: detail produk
- `/recipes`: daftar resep
- `/recipes/[id]`: detail resep
- `/favorites`: resep favorit
- `/admin`: produk & pesanan

---

### Error Handling

- Validasi input dengan zod
- Dialog error berbahasa Indonesia
- Loading skeleton + empty state
- Tangani koneksi lambat dengan fallback lokal

---

## 5️⃣ File & Fungsi Penting

| File                 | Fungsi                                          |
| -------------------- | ----------------------------------------------- |
| `supabase.client.ts` | Inisialisasi koneksi Supabase (Auth + Postgres) |
| `useAuth.ts`         | Login, register, Google Sign-In, logout         |
| `useProducts.ts`     | Fetch, filter, CRUD produk                      |
| `useOrders.ts`       | CRUD pesanan                                    |
| `useRecipes.ts`      | Fetch resep dan favorit                         |
| `cart.store.ts`      | State keranjang (add/update/remove/clear/total) |
| `image.ts`           | Upload gambar ke Supabase Storage               |
| `currency.ts`        | Format harga ke Rupiah                          |
| `ui.store.ts`        | State UI (dark mode, loading)                   |

---

## 6️⃣ Target MVP

- Build berjalan di Android & iOS (Expo Go)
- Auth dan persist sesi berfungsi penuh
- CRUD Produk dan Pesanan terhubung ke Supabase
- Keranjang tersimpan lokal
- Realtime tidak diperlukan (fase lanjutan)
