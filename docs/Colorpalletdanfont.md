# Panduan Warna, Font, dan Spacing — BahanKu

Dokumen ini berisi standar desain UI untuk aplikasi BahanKu, meliputi warna, font, dan spacing yang wajib digunakan di seluruh halaman.

---

## 1. Warna Utama

| Nama         | Hex        | Keterangan                |
|--------------|------------|---------------------------|
| Hitam        | #212121    | Teks utama                |
| Abu Menengah | #757575    | Teks sekunder, subjudul   |
| Abu Netral   | #BDBDBD    | Ikon, empty state         |
| Abu Muda     | #F5F5F5    | Background input          |
| Hijau Aksen  | #7DB95A    | Tombol, kategori aktif    |
| Hijau Mint   | #F1F8E9    | Kartu produk              |
| Putih        | #FFFFFF    | Background utama/kartu    |
| Oranye       | #FFA726    | Stok terbatas             |
| Merah        | #EF5350    | Ikon hapus                |

---

## 2. Font Utama

- **Roboto**
  - Regular: `Roboto-Regular`
  - SemiBold: `Roboto-Medium`
  - Bold: `Roboto-Bold`

---

## 3. Spacing (Jarak/Padding/Margin)

Gunakan skala spacing berikut untuk seluruh komponen dan layout:

| Nama | Nilai (px) | Penggunaan                |
|------|------------|--------------------------|
| xs   | 4          | Jarak sangat kecil       |
| sm   | 8          | Jarak kecil              |
| md   | 16         | Jarak standar            |
| lg   | 24         | Jarak besar              |
| xl   | 32         | Jarak sangat besar       |

---

## 4. Implementasi di Halaman

### Halaman Utama (Home) — `(tabs)/home.tsx`
- **Header**
  - Judul: Font Bold, warna #212121, spacing bawah md (16px)
  - Sub-Judul: Font Regular, warna #757575, spacing bawah md
- **Search Bar**
  - Latar belakang: #F5F5F5, padding horizontal md
  - Placeholder: Font Regular, warna #757575
- **Filter Kategori**
  - Aktif: Latar belakang #7DB95A, teks #FFFFFF, padding sm
  - Non-aktif: Teks #757575, padding sm
  - Spacing antar kategori: sm
- **Grid Produk**
  - Kartu: Latar belakang #F1F8E9, border radius sm (8px), padding md
  - Nama Produk: Font SemiBold, warna #212121
  - Harga: Font Bold, warna #212121
  - Label Stok: Font Regular, warna #757575 / #FFA726
  - Tombol Tambah: Latar belakang #7DB95A, ikon #FFFFFF, ukuran tombol sm

### Halaman Keranjang — `(tabs)/cart.tsx`
- **Header**: Font Bold, warna #212121, spacing bawah md
- **Daftar Item**
  - Latar belakang: #FFFFFF, padding md
  - Nama Produk: Font SemiBold, warna #212121
  - Varian: Font Regular, warna #757575
  - Quantity Stepper: Tombol #7DB95A, spacing antar tombol xs
  - Ikon Hapus: Warna #EF5350
- **Ringkasan (Footer)**
  - Card: Padding md, border radius sm
  - Teks "Total": Font Regular, warna #757575
  - Nominal harga: Font Bold, warna #212121
  - Tombol CTA: Latar belakang #7DB95A, teks SemiBold #FFFFFF, padding lg
- **Empty State**
  - Ikon: #BDBDBD
  - Teks: Font Regular, warna #757575, spacing atas lg

### Halaman Detail Produk — `product/[id].tsx`
- **Nama Produk**: Font Bold, warna #212121, spacing bawah sm
- **Harga**: Font Bold, warna #212121, spacing bawah sm
- **Deskripsi**: Font Regular, warna #757575, spacing bawah md
- **Quantity Stepper**: Tombol #7DB95A, spacing antar tombol xs
- **Tombol CTA (Footer)**: Latar belakang #7DB95A, teks SemiBold #FFFFFF, padding lg

### Halaman Inspirasi Resep — `recipes/index.tsx`
- **Header**: Font Bold, warna #212121, spacing bawah md
- **Kartu Resep**
  - Latar belakang: #FFFFFF, drop shadow, border radius sm, padding md
  - Judul Resep: Font SemiBold, warna #212121
  - Ikon Favorit: #BDBDBD (belum favorit), #7DB95A (favorit)

---

## Catatan

- Semua warna, font, dan spacing di atas wajib digunakan sesuai kebutuhan di setiap halaman untuk menjaga konsistensi UI.

