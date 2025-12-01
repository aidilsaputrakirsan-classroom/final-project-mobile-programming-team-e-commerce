# Rencana Pembagian Tugas — BahanKu

## Tim

- **Pangeran (PBS)** — Tech Lead, Backend Integration Specialist, Reviewer Utama
- **Adam** — Frontend UI/UX Developer, Form & Interaction Specialist

**Repositori:** `aidilsaputrakirsan-classroom/final-project-mobile-programming-team-e-commerce`  
**Branch Utama:** `main`  
**Branch Development:** `feature/products-core`  
**Workflow:** Feature branch → Pull Request → Review oleh PBS → Merge

---

## Prinsip Pembagian Tugas

### Pangeran (PBS) — Fokus Area:
- Integrasi Supabase (Auth, Database, Storage)
- State Management (Zustand stores)
- Business Logic (Hooks: useAuth, useProducts, useOrders, useRecipes)
- Backend-related services (supabase.client, image upload)
- Data models & types
- Review semua PR dari Adam
- Testing untuk flow backend (auth, checkout, orders)

### Adam — Fokus Area:
- UI Components (ProductCard, RecipeCard, EmptyState, QuantityStepper, dll)
- Screens/Pages (Auth screens, Product screens, Admin screens, Recipes screens)
- Form handling & validation (react-hook-form + zod)
- Theme & styling consistency
- User interactions & navigation
- Testing untuk flow UI (navigasi, form submission)

### Shared Tasks:
- Dokumentasi (README, API docs)
- Final testing & bug fixing
- Code quality (lint, typecheck)

---

## Status Saat Ini (Branch: feature/products-core)

Berdasarkan Development Checklist yang telah diupdate:

### ✅ Telah Selesai:
1. **Setup Proyek** (Phase 1) — Pangeran
2. **Konfigurasi Dasar** (Phase 2) — Pangeran & Adam
3. **Autentikasi** (Phase 3) — Pangeran & Adam
4. **Produk (List & Detail)** (Phase 4) — Pangeran & Adam
5. **Keranjang & Checkout Dasar** (Phase 5) — Cart store + UI checkout selesai
6. **Pesanan Customer/Admin** (Phase 6) — useOrders hook, halaman orders & admin orders

### 🔄 Sedang Dikerjakan:
- QA lint/typecheck + validasi end-to-end checkout → orders (Shared)
- Test build di Expo Go untuk iOS & Android (Pangeran)

### ⏳ Belum Dikerjakan:
- Phase 7: Admin Produk (UI + form + image picker)
- Phase 8: Resep & Favorit
- Phase 9: Profil & Pengaturan lanjutan (dark mode, edit profil)
- Phase 10: Testing dan Polishing akhir

---

## Sprint Plan

### Sprint 1 (Estimasi: 3-4 hari) — Keranjang & Checkout
**Status:** ✅ Selesai — Cart store, UI, dan flow checkout → Supabase sudah terhubung; tinggal regression test lint/typecheck.
**Target:** User dapat menambahkan produk ke keranjang dan melakukan checkout

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Backend: Cart Store** | | | | |
| Buat Zustand store `cart.store.ts` dengan fungsi addItem, updateQuantity, removeItem, clearCart, getTotal | **Pangeran** | 2 jam | Phase 4 selesai | `feature/cart-store` |
| Implementasi persist cart ke AsyncStorage (Zustand middleware) | **Pangeran** | 1 jam | cart.store.ts | `feature/cart-store` |
| Test cart store (add, update, remove, clear, persist) | **Pangeran** | 1 jam | cart.store.ts | `feature/cart-store` |
| **Frontend: Cart UI** | | | | |
| Buat component `QuantityStepper.tsx` (props: value, min, max, onChange) | **Adam** | 1.5 jam | - | `feature/cart-ui` |
| Buat halaman `app/(tabs)/cart.tsx` (list cart items, total, tombol checkout) | **Adam** | 3 jam | cart.store.ts, QuantityStepper | `feature/cart-ui` |
| Integrasi cart store ke halaman `app/product/[id].tsx` (tombol "Tambah ke Keranjang") | **Adam** | 1 jam | cart.store.ts | `feature/cart-ui` |
| Test UI cart (add, update, remove, EmptyState) | **Adam** | 1 jam | cart.tsx | `feature/cart-ui` |

**Definition of Done:**
- [ ] Cart store berfungsi dan persist ke AsyncStorage
- [ ] Halaman cart menampilkan list item dengan benar
- [ ] User dapat update quantity dan hapus item
- [ ] EmptyState muncul saat cart kosong
- [ ] Tombol checkout ada dan bisa diklik (belum implementasi logic)

---

### Sprint 2 (Estimasi: 4-5 hari) — Pesanan & Order Management
**Status:** ⚠️ Partial — Halaman orders & admin orders + RPC create_order aktif, tapi belum ada guard admin & belum dites penuh lint/typecheck.
**Target:** User dapat checkout dan melihat riwayat pesanan, Admin dapat update status pesanan

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Backend: Orders Hook** | | | | |
| Buat hook `useOrders.ts` dengan fungsi: createOrder, getMyOrders, getOrderById, updateOrderStatus | **Pangeran** | 3 jam | cart.store.ts | `feature/orders-backend` |
| Implementasi logic createOrder (insert ke tabel orders & order_items, validasi stok) | **Pangeran** | 2 jam | useOrders | `feature/orders-backend` |
| Implementasi logic getMyOrders (fetch orders by user_id) | **Pangeran** | 1 jam | useOrders | `feature/orders-backend` |
| Implementasi logic updateOrderStatus (admin only) | **Pangeran** | 1 jam | useOrders | `feature/orders-backend` |
| Test useOrders hook (create, list, update status) | **Pangeran** | 1.5 jam | useOrders | `feature/orders-backend` |
| **Frontend: Checkout Logic** | | | | |
| Implementasi tombol "Checkout" di `app/(tabs)/cart.tsx` (call createOrder, clear cart, redirect) | **Adam** | 2 jam | useOrders, cart.store | `feature/checkout` |
| Tambahkan validasi stok sebelum checkout | **Adam** | 1 jam | useOrders | `feature/checkout` |
| Tambahkan toast/alert success/error setelah checkout | **Adam** | 1 jam | - | `feature/checkout` |
| **Frontend: Orders UI (Customer)** | | | | |
| Buat halaman `app/(tabs)/orders.tsx` (list orders dengan status, tanggal, total) | **Pangeran** | 2.5 jam | useOrders | `feature/orders-ui` |
| Buat halaman detail order `app/order/[id].tsx` atau modal (list order items, status timeline) | **Pangeran** | 2 jam | useOrders | `feature/orders-ui` |
| Test UI orders (list, detail, EmptyState) | **Pangeran** | 1 jam | orders.tsx | `feature/orders-ui` |
| **Frontend: Admin Orders** | | | | |
| Buat halaman `app/admin/orders.tsx` (list all orders, tombol ubah status) | **Pangeran** | 2.5 jam | useOrders | `feature/admin-orders` |
| Implementasi modal/dropdown untuk ubah status pesanan | **Pangeran** | 1.5 jam | admin/orders.tsx | `feature/admin-orders` |
| Test admin orders (list, update status, validasi) | **Pangeran** | 1 jam | admin/orders.tsx | `feature/admin-orders` |

**Definition of Done:**
- [ ] Checkout berfungsi dan membuat order di Supabase
- [ ] Cart ter-clear setelah checkout berhasil
- [ ] User dapat melihat riwayat pesanan
- [ ] User dapat melihat detail pesanan (produk, qty, status)
- [ ] Admin dapat melihat semua pesanan
- [ ] Admin dapat mengubah status pesanan (diproses → dikirim → selesai)

---

### Sprint 3 (Estimasi: 4-5 hari) — Admin CRUD Produk
**Target:** Admin dapat mengelola produk (create, edit, delete) dengan upload gambar

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Backend: Image Upload Service** | | | | |
| Buat service `image.ts` (uploadImage function ke Supabase Storage) | **Adam** | 2 jam | supabase.client.ts | `feature/image-upload` |
| Implementasi compress/resize gambar sebelum upload (max 1MB) | **Adam** | 1.5 jam | image.ts | `feature/image-upload` |
| Test upload gambar ke Storage dan get public URL | **Adam** | 1 jam | image.ts | `feature/image-upload` |
| **Frontend: Admin Products UI** | | | | |
| Buat halaman `app/admin/products.tsx` (list produk dengan tombol Edit dan Hapus) | **Adam** | 2.5 jam | useProducts | `feature/admin-products` |
| Implementasi delete product dengan konfirmasi dialog | **Adam** | 1.5 jam | useProducts | `feature/admin-products` |
| **Frontend: Admin Product Form** | | | | |
| Buat halaman `app/admin/product-form.tsx` (form create/edit produk) | **Adam** | 3 jam | useProducts, image.ts | `feature/admin-product-form` |
| Setup form validation dengan Zod (name, description, price, stock, category, image) | **Adam** | 1.5 jam | product-form.tsx | `feature/admin-product-form` |
| Implementasi image picker (expo-image-picker) | **Adam** | 1.5 jam | product-form.tsx | `feature/admin-product-form` |
| Integrasi upload gambar saat submit form | **Adam** | 1.5 jam | image.ts, product-form.tsx | `feature/admin-product-form` |
| Implementasi edit mode (prefill form dengan data produk existing) | **Adam** | 1 jam | product-form.tsx | `feature/admin-product-form` |
| Test CRUD produk (create, edit, delete, upload gambar) | **Adam** | 2 jam | admin/products.tsx, admin/product-form.tsx | `feature/admin-product-form` |

**Definition of Done:**
- [ ] Admin dapat melihat list produk di admin panel
- [ ] Admin dapat menambah produk baru dengan upload gambar
- [ ] Admin dapat edit produk existing (termasuk ganti gambar)
- [ ] Admin dapat hapus produk dengan konfirmasi
- [ ] Form validasi berfungsi dengan baik (Zod)
- [ ] Gambar ter-compress dan ter-upload ke Supabase Storage

---

### Sprint 4 (Estimasi: 4-5 hari) — Resep & Favorit
**Target:** User dapat melihat resep, menyimpan resep favorit

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Backend: Recipes Hook** | | | | |
| Buat hook `useRecipes.ts` dengan fungsi: getRecipes, getRecipeById, toggleFavorite, getMyFavorites | **Pangeran** | 3 jam | supabase.client.ts | `feature/recipes-backend` |
| Implementasi logic getRecipes (fetch all recipes) | **Pangeran** | 1 jam | useRecipes | `feature/recipes-backend` |
| Implementasi logic getRecipeById (fetch recipe dengan produk terkait) | **Pangeran** | 1.5 jam | useRecipes | `feature/recipes-backend` |
| Implementasi logic toggleFavorite (add/remove dari favorite_recipes) | **Pangeran** | 1.5 jam | useRecipes | `feature/recipes-backend` |
| Implementasi logic getMyFavorites (fetch resep favorit user) | **Pangeran** | 1 jam | useRecipes | `feature/recipes-backend` |
| Test useRecipes hook (get, toggle favorite) | **Pangeran** | 1 jam | useRecipes | `feature/recipes-backend` |
| **Frontend: Recipes Components** | | | | |
| Buat component `RecipeCard.tsx` (props: recipe, isFavorite, onPress, onToggleFavorite) | **Adam** | 1.5 jam | - | `feature/recipes-ui` |
| **Frontend: Recipes Pages** | | | | |
| Buat halaman `app/recipes/index.tsx` (list resep dalam grid/list) | **Adam** | 2.5 jam | useRecipes, RecipeCard | `feature/recipes-ui` |
| Buat halaman `app/recipes/[id].tsx` (detail resep dengan gambar, langkah, bahan terkait produk) | **Adam** | 3 jam | useRecipes | `feature/recipes-ui` |
| Implementasi tombol favorite (toggle) di halaman detail resep | **Adam** | 1.5 jam | useRecipes | `feature/recipes-ui` |
| Implementasi navigasi dari bahan resep ke detail produk | **Adam** | 1 jam | recipes/[id].tsx | `feature/recipes-ui` |
| Test UI recipes (list, detail, favorite toggle) | **Adam** | 1 jam | recipes/ | `feature/recipes-ui` |
| **Frontend: Favorites Page** | | | | |
| Buat halaman `app/favorites/index.tsx` (list resep favorit) | **Pangeran** | 2 jam | useRecipes, RecipeCard | `feature/favorites` |
| Test UI favorites (list, EmptyState, navigasi ke detail) | **Pangeran** | 1 jam | favorites/index.tsx | `feature/favorites` |

**Definition of Done:**
- [ ] User dapat melihat list resep
- [ ] User dapat melihat detail resep dengan langkah dan bahan
- [ ] User dapat toggle favorite di halaman detail resep
- [ ] User dapat melihat list resep favorit
- [ ] Navigasi dari bahan resep ke detail produk berfungsi
- [ ] EmptyState muncul di halaman recipes dan favorites jika kosong

---

### Sprint 5 (Estimasi: 2-3 hari) — Profil & Pengaturan
**Target:** User dapat melihat profil, edit profil, toggle dark mode, logout

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Backend: UI Store** | | | | |
| Buat Zustand store `ui.store.ts` (state: isDarkMode, toggleDarkMode) | **Pangeran** | 1 jam | - | `feature/ui-store` |
| Implementasi persist dark mode ke AsyncStorage | **Pangeran** | 0.5 jam | ui.store.ts | `feature/ui-store` |
| Test UI store (toggle, persist) | **Pangeran** | 0.5 jam | ui.store.ts | `feature/ui-store` |
| **Frontend: Profile Page** | | | | |
| Buat halaman `app/(tabs)/profile.tsx` (tampil nama, email, foto profil, tombol logout) | **Adam** | 2 jam | useAuth | `feature/profile` |
| Tambahkan toggle dark mode di halaman profile/settings | **Adam** | 1 jam | ui.store.ts | `feature/profile` |
| Implementasi tombol "Edit Profil" (navigasi ke form atau modal) | **Adam** | 1.5 jam | profile.tsx | `feature/profile` |
| **Frontend: Edit Profile** | | | | |
| Buat form edit profil (nama, foto profil) dengan validasi Zod | **Adam** | 2 jam | useAuth, image.ts | `feature/edit-profile` |
| Implementasi upload foto profil dengan image picker | **Adam** | 1.5 jam | image.ts | `feature/edit-profile` |
| Integrasi update user data ke tabel users di Supabase | **Adam** | 1 jam | edit-profile form | `feature/edit-profile` |
| Test profile (view, edit, logout, dark mode toggle) | **Adam** | 1 jam | profile.tsx | `feature/edit-profile` |
| **Integration: Apply Dark Mode** | | | | |
| Terapkan dark mode theme ke semua halaman (conditional styling) | **Adam** | 2.5 jam | ui.store.ts, theme/index.ts | `feature/dark-mode-integration` |
| Test dark mode di semua halaman | **Adam** | 1 jam | - | `feature/dark-mode-integration` |

**Definition of Done:**
- [ ] User dapat melihat profil (nama, email, foto)
- [ ] User dapat edit nama dan upload foto profil
- [ ] User dapat toggle dark mode dan preferensi tersimpan
- [ ] Dark mode diterapkan ke semua halaman
- [ ] User dapat logout dari halaman profile

---

### Sprint 6 (Estimasi: 3-4 hari) — Testing, Bug Fixing, Polishing
**Target:** Aplikasi stabil, bebas bug, siap untuk demo/production

| Task | PIC | Estimasi | Dependencies | Branch |
|------|-----|----------|--------------|--------|
| **Testing: Flow Autentikasi** | | | | |
| Test register, login, Google Sign-In, logout | **Pangeran** | 1.5 jam | Phase 3 | `main` atau `develop` |
| Test session persistence (restart app) | **Pangeran** | 1 jam | Phase 3 | `main` atau `develop` |
| Test router guard (protected routes) | **Pangeran** | 1 jam | Phase 3 | `main` atau `develop` |
| **Testing: Flow Produk & Cart** | | | | |
| Test navigasi dari home → detail produk → add to cart | **Adam** | 1 jam | Phase 4, 5 | `main` atau `develop` |
| Test search dan filter produk | **Adam** | 1 jam | Phase 4 | `main` atau `develop` |
| Test update quantity dan hapus item di cart | **Adam** | 1 jam | Phase 5 | `main` atau `develop` |
| **Testing: Flow Checkout & Orders** | | | | |
| Test checkout (validasi stok, create order, clear cart) | **Pangeran** | 1.5 jam | Sprint 2 | `main` atau `develop` |
| Test view orders dan detail order | **Pangeran** | 1 jam | Sprint 2 | `main` atau `develop` |
| Test admin update status pesanan | **Pangeran** | 1 jam | Sprint 2 | `main` atau `develop` |
| **Testing: Flow Admin CRUD** | | | | |
| Test admin create produk (upload gambar, validasi form) | **Adam** | 1 jam | Sprint 3 | `main` atau `develop` |
| Test admin edit dan delete produk | **Adam** | 1 jam | Sprint 3 | `main` atau `develop` |
| **Testing: Flow Resep & Favorit** | | | | |
| Test view resep, detail resep, toggle favorite | **Adam** | 1 jam | Sprint 4 | `main` atau `develop` |
| Test view favorites dan navigasi ke detail produk dari resep | **Adam** | 1 jam | Sprint 4 | `main` atau `develop` |
| **Testing: Flow Profil & Dark Mode** | | | | |
| Test view profile, edit profile, logout | **Adam** | 1 jam | Sprint 5 | `main` atau `develop` |
| Test dark mode toggle dan persistence | **Adam** | 1 jam | Sprint 5 | `main` atau `develop` |
| **Code Quality** | | | | |
| Jalankan `npm run lint` dan fix semua warning/error | **Shared** | 2 jam | - | `main` atau `develop` |
| Jalankan `tsc --noEmit` untuk typecheck dan fix error | **Shared** | 1.5 jam | - | `main` atau `develop` |
| **Performance Optimization** | | | | |
| Test performa dengan 100+ produk (loading, scroll) | **Pangeran** | 1 jam | - | `main` atau `develop` |
| Implementasi pagination atau infinite scroll jika perlu | **Pangeran** | 2 jam (optional) | - | `feature/pagination` |
| Compress gambar sebelum upload (sudah ada di Sprint 3, verify) | **Adam** | 0.5 jam | image.ts | - |
| **Bug Fixing** | | | | |
| Fix bug berdasarkan testing manual | **Shared** | 3-5 jam | - | `fix/*` |
| Test build di Android (Expo Go atau APK) | **Pangeran** | 1 jam | - | - |
| Test build di iOS (Expo Go) | **Adam** | 1 jam | - | - |
| **Documentation** | | | | |
| Buat/update README.md (setup, features, tech stack, screenshots) | **Shared** | 2 jam | - | `main` |
| Buat dokumentasi API/hooks (optional, jika diperlukan) | **Pangeran** | 1.5 jam (optional) | - | `docs/` |
| Update Development Checklist final status | **Pangeran** | 0.5 jam | - | `main` |

**Definition of Done:**
- [ ] Semua flow utama berfungsi tanpa bug (auth, produk, cart, checkout, orders, admin, resep)
- [ ] Tidak ada warning/error dari lint dan typecheck
- [ ] Aplikasi stabil di Android dan iOS (Expo Go)
- [ ] README lengkap dengan setup instructions dan screenshots
- [ ] Development Checklist semua item [Telah Dibuat]

---

## Kepemilikan Area Kode

| Area | Primary Owner | Secondary/Support |
|------|---------------|-------------------|
| `src/services/` | **Pangeran** | - |
| `src/store/` | **Pangeran** | - |
| `src/hooks/` | **Pangeran** | Adam (useProducts edit mode) |
| `src/components/` | **Adam** | - |
| `src/libs/` | **Shared** | - |
| `src/theme/` | **Adam** | Pangeran (dark mode logic) |
| `src/types/` | **Pangeran** | - |
| `app/(auth)/` | **Adam** | Pangeran (review & testing) |
| `app/(tabs)/` | **Adam** (UI) | Pangeran (orders.tsx) |
| `app/product/` | **Adam** | - |
| `app/admin/` | **Adam** (UI) | Pangeran (orders.tsx) |
| `app/recipes/` | **Adam** | - |
| `app/favorites/` | **Pangeran** | Adam (UI component) |

---

## Milestone & Timeline

| Milestone | Target Date | Status | Deliverables |
|-----------|-------------|--------|--------------|
| **M1: Cart & Checkout** | [Tanggal target Sprint 1] | ✅ Selesai (butuh QA akhir) | User dapat add to cart dan checkout |
| **M2: Orders Management** | [Tanggal target Sprint 2] | ⚠️ Partial | User dapat view orders, Admin dapat update status |
| **M3: Admin CRUD Produk** | [Tanggal target Sprint 3] | ⏳ Pending | Admin dapat manage produk dengan upload gambar |
| **M4: Resep & Favorit** | [Tanggal target Sprint 4] | ⏳ Pending | User dapat view resep dan save favorites |
| **M5: Profil & Settings** | [Tanggal target Sprint 5] | ⏳ Pending | User dapat edit profil dan toggle dark mode |
| **M6: Final Build** | [Tanggal target Sprint 6] | ⏳ Pending | Aplikasi stabil dan siap demo/production |

**Total Estimasi Waktu:** 20-26 hari kerja (dengan asumsi 3-5 jam produktif per hari per orang)

---

## Workflow & Communication

### Branching Strategy
1. **Main Branch:** `main` (production-ready)
2. **Development Branch:** `feature/products-core` (integration branch)
3. **Feature Branch:** `feature/<nama-fitur>` (individual task)
4. **Fix Branch:** `fix/<bug-name>` (bug fixes)

### Pull Request Process
1. Developer membuat feature branch dari `feature/products-core`
2. Setelah selesai, push ke GitHub dan buat PR ke `feature/products-core`
3. PR harus menyertakan:
   - Deskripsi singkat perubahan (Bahasa Indonesia)
   - Checklist tugas yang diselesaikan
   - Screenshot/video untuk perubahan UI (jika ada)
   - Langkah manual testing
4. **Pangeran** review semua PR
5. Setelah approved, merge ke `feature/products-core`
6. Setelah satu sprint selesai, merge `feature/products-core` ke `main`

### Daily Check-in (Async)
- Update progress di grup chat atau issue tracker
- Format: "Hari ini selesai: [task X], Besok: [task Y], Blocker: [none/ada blocker Z]"

### Weekly Sync (Optional)
- Review progress sprint
- Diskusi blocker dan solusi
- Planning sprint berikutnya

---

## Definition of Done (DoD)

Setiap task dianggap selesai jika:
- [ ] Kode berfungsi tanpa error runtime
- [ ] Lulus lint (`npm run lint`) tanpa warning
- [ ] Lulus typecheck (`tsc --noEmit`) tanpa error
- [ ] UI konsisten dengan theme global
- [ ] Loading dan error state ditangani dengan baik
- [ ] Form divalidasi dengan Zod (jika ada form)
- [ ] Manual testing selesai
- [ ] PR sudah di-review dan approved oleh Pangeran
- [ ] Development Checklist diupdate (status → [Telah Dibuat])

---

## Kontak & Escalation

- **Blocker teknis (Supabase, Expo, dll):** Escalate ke Pangeran
- **Blocker UI/UX (desain tidak jelas, dll):** Diskusi bersama
- **Bug kritis:** Buat issue di GitHub dengan label `bug` dan `urgent`
- **Pertanyaan umum:** Grup chat atau GitHub Discussions

---

## Notes

- Estimasi waktu bersifat fleksibel, sesuaikan dengan kecepatan masing-masing
- Prioritaskan kualitas kode daripada kecepatan
- Jangan ragu untuk refactor jika ada kode yang tidak clean
- Selalu test manual sebelum push PR
- Komunikasi adalah kunci — jika stuck, langsung tanya!

---

**Last Updated:** 2025-01-21  
**Updated By:** Pangeran (PBS) & Copilot
