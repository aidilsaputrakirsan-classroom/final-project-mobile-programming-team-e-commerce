# Permintaan ke Copilot: Pulihkan File Backend Cart/Orders

**Pengirim:** Pangeran (via Codex)
**Tanggal:** 23 November 2025

## Kronologi Singkat
- Branch aktif: `feature/cart-store`
- Setelah menjalankan `git stash` dan `git pull --rebase`, file backend cart/orders hilang dari working tree.
- File yang hilang/harus dikembalikan:
  1. `BahankuApp/src/store/cart.store.ts`
  2. `BahankuApp/src/hooks/useOrders.ts`
  3. `BahankuApp/src/types/order.ts`
  4. `BahankuApp/src/types/index.ts` (bagian export order types)
  5. Seluruh isi `BahankuApp/docs/**` yang sebelumnya ditambahkan (PRD baru, checklist, READY_FOR_CODEX, catatan Copilot, dll.)
- File UI untuk Adam (QuantityStepper, CartItemRow, dsb.) sudah dibackup di `adam_share/` dan tidak perlu disentuh.

## Yang Dibutuhkan
1. Pulihkan file-file di atas dari snapshot sebelum hilang (gunakan reflog atau patch terakhir). Jika perlu, copy dari commit/branch sebelumnya.
2. Taruh kembali di path aslinya di `BahankuApp/…` tanpa men-stage atau men-commit (biar saya yang commit).
3. Pastikan konten sama seperti versi terakhir ketika branch masih berjalan (hook `useOrders`, `cart.store`, types order, dan semua dokumen di `BahankuApp/docs`).
4. Jangan mengubah atau menghapus folder `adam_share/`.

## Catatan Tambahan
- Saat ini working tree kosong (tidak ada file tracked selain UI). Setelah file dikembalikan, saya akan lanjut `git add` + `git commit` + `git push`.
- Jika ada file yang tidak bisa ditemukan, jelaskan file mana dan kenapa.

Terima kasih! – Pangeran & Codex
