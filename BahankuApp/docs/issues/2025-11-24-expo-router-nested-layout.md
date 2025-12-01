# 2025-11-24 — Expo Router Nested Layout Warning

## Gejala

- Expo CLI menampilkan ratusan peringatan `No route named "order"/"admin" exists in nested children...` setiap kali aplikasi dibuka.
- Header default di halaman admin (`admin/orders`) muncul sebagai teks "admin/orders" alih-alih judul yang lebih manusiawi.

## Akar Masalah

- Di `app/_layout.tsx` kita mendaftarkan screen `order` dan `admin`, namun folder `app/order` dan `app/admin` belum memiliki `_layout.tsx`. Tanpa layout group, segment `order`/`admin` tidak dianggap valid oleh Expo Router sehingga muncul warning.
- Karena tidak ada layout khusus, Expo Router menampilkan header bawaan bertuliskan path file (contoh `admin/orders`).

## Solusi

1. Membuat `app/order/_layout.tsx` untuk mendefinisikan Stack khusus order detail (header berjudul "Detail Pesanan" + tombol kembali manual).
2. Membuat `app/admin/_layout.tsx` dan menyembunyikan header default untuk seluruh segment admin.
3. Menghapus link "< Kembali" manual di `app/order/[id].tsx` karena tombol kembali kini disediakan oleh header baru.

## Dampak

- Peringatan `Layout children` hilang karena struktur rute sudah sah.
- Header halaman admin tidak lagi menampilkan path teknis.
- Order detail memiliki header konsisten dengan layout lain.

## File Terkait

- `app/_layout.tsx`
- `app/order/_layout.tsx`
- `app/admin/_layout.tsx`
- `app/order/[id].tsx`

## Catatan

Tidak menjalankan Expo build ulang di commit ini; harap jalankan `npx expo start -c` bila masih melihat cache warning lama.
