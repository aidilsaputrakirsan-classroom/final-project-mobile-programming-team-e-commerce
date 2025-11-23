# BahanKu Mobile App

Aplikasi mobile e-commerce bahan dapur berbasis **Expo (React Native + TypeScript)** dengan backend **Supabase**. Fitur utama:

- Autentikasi pengguna (email/password via Supabase Auth)
- Katalog produk lengkap dengan filter kategori & pencarian
- Detail produk beserta stok, deskripsi, dan gambar
- Keranjang belanja (Zustand + AsyncStorage) yang persist antar restart
- Checkout ke Supabase (orders + order_items)
- Riwayat pesanan pelanggan

Folder penting:

```
BahankuApp/
├── app/             → Expo Router (auth, tabs, product detail, dll.)
├── src/
│   ├── components/  → UI reusable (cart, orders, home sections)
│   ├── hooks/       → useAuth, useProducts, useOrders
│   ├── services/    → supabase client, image helper
│   ├── store/       → Zustand store (cart, auth)
│   └── types/       → TypeScript types (auth, product, order)
└── docs/            → PRD, task assignment, catatan Codex ↔ Copilot
```

---

## Persiapan Lingkungan

1. **Node.js & npm**  
   Install Node.js versi terbaru (disertai npm).  
   Cek versi:

   ```powershell
   node -v
   npm -v
   ```

2. **Expo CLI**  
   Tidak wajib global. Gunakan `npx expo` pada setiap perintah.

3. **Environment Variables**  
   Salin `.env.example` ke `.env` lalu isi:

   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

---

## Instalasi Dependencies

> **Penting:** Semua perintah PowerShell harus dijalankan dari root repo.  
> Selalu pastikan berada di folder `BahankuApp` sebelum `npm install`.

```powershell
# 1. Pindah ke folder proyek frontend
cd BahankuApp

# 2. Install dependencies
npm install
```

---

## Menjalankan Aplikasi

```powershell
# Pastikan masih di folder BahankuApp
cd BahankuApp

# Bersihkan cache Metro lalu jalankan Expo
npx expo start -c
```

### Menjalankan di Device Fisik

1. Scan QR code menggunakan **Expo Go** (Android) atau Camera App (iOS).
2. Jika mengalami masalah session di iOS, lihat catatan troubleshooting pada `chatgpt_ios_issues.md` (reset Expo Go, bersihkan cache, dsb.).


