# Screenshots Directory

Folder ini berisi screenshot aplikasi BahanKu untuk dokumentasi README.

## Screenshot yang Dibutuhkan

### Customer Flow (12 screenshots)
1. **01-login.png** — Halaman login dengan email/password dan Google Sign-In
2. **02-register.png** — Form registrasi user baru
3. **03-home.png** — Home page dengan promo banner, kategori filter, dan product grid
4. **04-product-detail.png** — Detail produk dengan gambar, deskripsi, harga, stok, dan quantity stepper
5. **05-cart.png** — Keranjang belanja dengan checkbox select all, list items, dan total harga
6. **06-checkout-modal.png** — Modal checkout dengan input alamat dan konfirmasi pesanan
7. **07-orders.png** — Riwayat pesanan customer dengan filter status dan search
8. **08-order-detail.png** — Detail pesanan dengan timeline status, list items, dan payment summary
9. **09-recipes.png** — Grid resep dengan tombol favorit
10. **10-recipe-detail.png** — Detail resep dengan bahan, langkah memasak, dan link ke produk
11. **11-favorites.png** — Daftar resep favorit user
12. **12-profile.png** — Halaman profil dengan menu admin (untuk admin role)

### Admin Flow (6 screenshots)
13. **13-admin-products.png** — Admin list produk dengan search, filter, dan action menu (edit/delete)
14. **14-admin-product-form.png** — Form tambah/edit produk dengan upload image
15. **15-admin-orders.png** — Admin kelola semua pesanan dengan filter dan update status
16. **16-admin-categories.png** — CRUD kategori produk
17. **17-admin-discounts.png** — Manajemen diskon aktif/tidak aktif
18. **18-admin-recipes.png** — Kelola resep (CRUD) dengan bahan dan langkah

## Spesifikasi Screenshot

- **Resolusi:** Minimal 1080x2400 (Full HD+)
- **Device:** Android (prioritas), iOS (opsional)
- **Format:** PNG (lossless)
- **Background:** Light mode (default theme)
- **Content:** Gunakan data sample yang realistic (bukan lorem ipsum)

## Cara Mengambil Screenshot

### Android (Expo Go)
1. Jalankan aplikasi dengan `npx expo start`
2. Scan QR code di Expo Go
3. Navigasi ke halaman yang ingin di-screenshot
4. Tekan **Volume Down + Power Button** bersamaan
5. Screenshot tersimpan di **Gallery** → **Screenshots**

### iOS (Expo Go)
1. Jalankan aplikasi dengan `npx expo start`
2. Scan QR code di Camera app
3. Navigasi ke halaman yang ingin di-screenshot
4. Tekan **Side Button + Volume Up** bersamaan
5. Screenshot tersimpan di **Photos** → **Screenshots**

## Naming Convention

Format: `[nomor]-[nama-halaman].png`

Contoh:
- `01-login.png`
- `13-admin-products.png`

## Tips Untuk Screenshot Berkualitas

- Gunakan data sample yang realistis (produk dengan gambar, bukan placeholder)
- Pastikan tidak ada error atau warning di screen
- Gunakan device dengan resolusi tinggi
- Screenshot dalam kondisi light mode (default)
- Hindari screenshot saat loading state (kecuali untuk dokumentasi skeleton loader)
- Crop screenshot jika ada black bar atau notch yang mengganggu

## Status Screenshot

- [ ] 01-login.png
- [ ] 02-register.png
- [ ] 03-home.png
- [ ] 04-product-detail.png
- [ ] 05-cart.png
- [ ] 06-checkout-modal.png
- [ ] 07-orders.png
- [ ] 08-order-detail.png
- [ ] 09-recipes.png
- [ ] 10-recipe-detail.png
- [ ] 11-favorites.png
- [ ] 12-profile.png
- [ ] 13-admin-products.png
- [ ] 14-admin-product-form.png
- [ ] 15-admin-orders.png
- [ ] 16-admin-categories.png
- [ ] 17-admin-discounts.png
- [ ] 18-admin-recipes.png

---

**Note:** Setelah screenshot diambil, update README utama dengan path screenshot yang benar.
