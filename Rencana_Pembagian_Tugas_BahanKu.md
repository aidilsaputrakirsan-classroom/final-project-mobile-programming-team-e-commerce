
# 👥 Rencana & Pembagian Tugas — Proyek BahanKu

## Tim
- **Pangeran (PBS)** — Ketua tim, setup awal proyek, integrasi Supabase, reviewer utama
- **Adam** — Pengembang fitur UI dan logika frontend

Repositori: [GitHub — bahanku](#)  
Workflow: Pull Request, Branch, Merge (review wajib oleh PBS)

---

## Strategi Branching
- **Main Branch:** `main`
- **Fitur Branch:** `feature/<area>-<desc>`  
  Contoh: `feature/auth-google`, `feature/cart-store`
- Sebelum push: `git pull origin main --rebase`
- PBS melakukan review dan merge PR

---

## Sprint Breakdown

### 🧩 Sprint 0 — Setup Proyek
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Inisialisasi Expo + TypeScript | ✅ |  |
| Setup ESLint, Prettier, env Supabase | ✅ |  |
| Struktur folder & routing dasar | ✅ |  |
| Komponen dasar (ProductCard, EmptyState) |  | ✅ |
| Theme global (warna, spacing) |  | ✅ |

---

### 🔐 Sprint 1 — Autentikasi & Home
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Supabase Auth (email & Google) | ✅ |  |
| Hook `useAuth` (login, register, logout) | ✅ |  |
| Halaman `(auth)/login.tsx` dan `register.tsx` | ✅ |  |
| Home page (`home.tsx`) & `useProducts` (fetch & kategori) |  | ✅ |

---

### 🛒 Sprint 2 — Detail Produk & Keranjang
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Store `cart.store.ts` (Zustand + persist) | ✅ |  |
| Integrasi checkout & clear cart | ✅ |  |
| Detail produk `[id].tsx` + stepper qty |  | ✅ |
| Halaman `(tabs)/cart.tsx` (daftar item & total) |  | ✅ |

---

### 📦 Sprint 3 — Pesanan & Admin Produk
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Hook `useOrders` (create, list, update status) | ✅ |  |
| Halaman `(tabs)/orders.tsx` | ✅ |  |
| Admin: `products.tsx`, `product-form.tsx` (CRUD + upload) |  | ✅ |
| Upload gambar ke Storage |  | ✅ |

---

### 🍳 Sprint 4 — Resep & Favorit
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Hook `useRecipes`, tabel `favorite_recipes` | ✅ |  |
| Halaman `favorites/index.tsx` | ✅ |  |
| Halaman `recipes/` dan `recipes/[id].tsx` |  | ✅ |

---

### 🎨 Sprint 5 — Polishing & Final
| Tugas | Pangeran | Adam |
|-------|-----------|------|
| Review PR & merge branch | ✅ |  |
| Dark mode toggle (`ui.store.ts`) | ✅ |  |
| Validasi form & UX fix |  | ✅ |
| Dokumentasi UI & Testing ringan |  | ✅ |

---

## Kepemilikan File
| Area | Pemilik |
|------|----------|
| `src/services`, `src/store`, `useAuth`, `useOrders`, `admin/orders.tsx` | **Pangeran** |
| `src/components`, `useProducts`, `useRecipes`, `app/(tabs)`, `product/[id].tsx`, `admin/products.tsx` | **Adam** |
| `theme`, `types`, `libs`, `ui.store.ts` | **Shared** |

---

## Milestone Deliverables
| Milestone | Target | Status |
|------------|---------|--------|
| **M1:** Auth + Home Page | User bisa login dan lihat produk | ⏳ |
| **M2:** Cart + Checkout | Pesanan masuk ke Supabase | ⏳ |
| **M3:** Admin CRUD Produk & Pesanan | Admin berfungsi penuh | ⏳ |
| **M4:** Resep + Favorit | User bisa simpan resep | ⏳ |
| **M5:** Final Build | Stabil di Android & iOS | ⏳ |

---

## Definition of Done (DoD)
- Kode clean & lulus lint + typecheck
- UI konsisten Android-first
- Tidak ada warning/error runtime
- Semua PR ter-review oleh PBS
- Data nyata Supabase berjalan lancar
