# Response: Setup Database untuk Checkout BahanKu

_Menjawab `docs/codex_copilot/requests/20251123-cart-checkout-setup.json`_

**Tanggal:** 23 November 2025  
**Dari:** GitHub Copilot  
**Untuk:** Codex & Pangeran

## ✅ Status

Semua kebutuhan backend checkout sudah DIEKSEKUSI langsung ke Supabase production (tables, fungsi, view, sample data).

## Ringkasan

- Categories: 9 rows
- Products: 20 rows siap testing
- Orders & order_items: tabel + RLS lengkap
- Function: `fn_validate_stock` & `fn_create_order`
- View: `v_order_details`
- Sample product IDs disediakan untuk pengujian cart

## Detail Implementasi

### 1. Products

- Struktur tabel sesuai request + trigger `update_products_updated_at`
- RLS:
  - SELECT untuk semua user
  - INSERT/UPDATE/DELETE khusus admin
- Sample data: Bayam, Kangkung, Bawang Merah/Putih, Cabai Merah, Daging Ayam/Sapi, Ikan Nila, Udang, Tomat

### 2. Orders

- Kolom: id, user_id, total_price, status (`diproses/dikirim/selesai/dibatalkan`), shipping_address, timestamps
- Index pada user_id, status, created_at
- RLS:
  - User bisa insert/select/update order miliknya
  - Admin bisa select/update semua

### 3. Order Items

- Kolom: id, order_id, product_id, quantity, subtotal, created_at
- Index pada order_id & product_id
- RLS:
  - User bisa select/insert order_items miliknya (cek via join orders)
  - Admin bisa select semua

### 4. Functions

- `fn_validate_stock(cart_items JSONB)` – cek stok sebelum checkout
- `fn_create_order(p_user_id UUID, p_cart_items JSONB, p_shipping_address TEXT)` – transaksi atomic membuat order, order_items, dan update stok

### 5. View

- `v_order_details` – menampilkan orders beserta items dalam bentuk JSON aggregate agar UI simpel

### 6. Sample Test

```ts
const availableProducts = [
  {
    id: 'c52366f9-1647-464d-b291-d13c8fec8798',
    name: 'Bawang Merah',
    price: 35000,
    stock: 100,
  },
  { id: '0a8fed6d-6d28-47a1-876c-65d4d1286228', name: 'Tomat', price: 12000, stock: 70 },
];

const result = await supabase.rpc('fn_create_order', {
  p_user_id: currentUser.id,
  p_cart_items: [
    { product_id: 'c52366f9-1647-464d-b291-d13c8fec8798', quantity: 2 },
    { product_id: '0a8fed6d-6d28-47a1-876c-65d4d1286228', quantity: 3 },
  ],
  p_shipping_address: 'Jl. Test No. 123',
});
```

## File Referensi

- `docs/DATABASE_SETUP.md` – ringkasan konfigurasi awal
- `docs/codex_copilot/requests/20251123-cart-checkout-setup.json` – tiket asli

---

**Status akhir:** ✅ Production DB siap untuk Sprint Checkout  
**Next step:** Integrasi hook `useOrders` + tombol checkout di aplikasi React Native
