# BahanKu — Copilot Instructions

Kamu adalah AI assistant untuk proyek BahanKu, aplikasi e-commerce bahan dapur berbasis React Native + TypeScript + Expo Router + Supabase.

## Wajib Dibaca Sebelum Coding

Sebelum menulis kode, SELALU baca file ini secara berurutan:

1. `docs/Development_Checklist_BahanKu.md` — cek status task dan update setelah selesai
2. `docs/Task_Assignment_BahanKu.md` — cek PIC, dependencies, dan estimasi
3. `docs/prd/Requirements_BahanKu.md` — pahami requirement dan acceptance criteria
4. `docs/prd/Implementation_Plan_BahanKu.md` — ikuti langkah implementasi yang sudah ditentukan
5. `docs/prd/Design_Document_BahanKu.md` — pahami arsitektur dan pattern

Jangan skip langkah atau membuat struktur berbeda dari yang sudah didefinisikan di PRD.

## Bantuan Dokumentasi Library

Selalu gunakan Context7 saat membutuhkan code generation, setup atau langkah konfigurasi, atau dokumentasi library/API. Ini berarti kamu harus otomatis menggunakan Context7 MCP tools untuk resolve library id dan mendapatkan dokumentasi library tanpa user harus meminta secara eksplisit.

## Prinsip Koding

- Pakai TypeScript strict mode, hindari `any`
- Fungsi maksimal 30 baris, extract logic kompleks ke hooks atau utils
- State global pakai Zustand + persist ke AsyncStorage
- Form pakai react-hook-form + zod untuk validasi
- Import theme dari `src/theme/index.ts`, jangan hardcode warna atau spacing
- Semua text UI dalam Bahasa Indonesia
- Komentar kode teknis dalam Bahasa Indonesia, tidak naratif

## Struktur Folder

```
app/       → Expo Router pages (auth, tabs, product, admin, recipes, favorites)
src/
  components/  → UI components reusable
  hooks/       → Custom hooks (useAuth, useProducts, useOrders, useRecipes)
  store/       → Zustand stores (cart, ui)
  services/    → Supabase client, image upload
  libs/        → Utilities (currency, helpers)
  theme/       → Theme config (colors, spacing, typography)
  types/       → TypeScript types
```

## Pattern yang Harus Diikuti

### Custom Hook

Hook harus return state, loading, error, dan functions. Contoh:

```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => { ... };
  const logout = async () => { ... };

  return { user, loading, login, logout };
};
```

### Component

Component harus TypeScript dengan proper Props interface. Contoh:

```typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{product.name}</Text>
      <Text>{formatCurrency(product.price)}</Text>
    </TouchableOpacity>
  );
};
```

### Store (Zustand)

Store harus pakai persist middleware untuk AsyncStorage. Contoh:

```typescript
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty) => { ... },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## Hal yang Wajib

- Tampilkan EmptyState component jika data kosong
- Tampilkan loading indicator saat fetch data
- Error message dalam Bahasa Indonesia
- Validasi form dengan zod
- Disable button saat submit (prevent double submit)
- Gunakan FlatList untuk list panjang
- Debounce search input 300ms
- Format harga dengan `formatCurrency()` dari `libs/currency.ts`
- Import dengan alias `@/` (contoh: `import { theme } from '@/theme'`)

## Git Convention

Branch: `feature/<nama>` atau `fix/<bug>`
Commit: `feat: deskripsi` atau `fix: deskripsi` (Bahasa Indonesia)
PR harus include: deskripsi, checklist, screenshot UI (jika ada), langkah testing

Reviewer wajib: Pangeran

## Output yang Diharapkan

- Kode TypeScript yang bisa langsung jalan
- Tidak ada emoji di kode
- Komentar teknis bukan naratif
- Jika ada yang tidak jelas, tulis `// TODO: klarifikasi [hal yang tidak jelas]`

## Troubleshooting Umum

Path alias error → cek `tsconfig.json` sudah ada `paths: { "@/*": ["src/*"] }`
Supabase session tidak persist → pastikan auth config pakai `storage: AsyncStorage`
AsyncStorage type error → install `@types/react-native-async-storage__async-storage`

---

## Command Terminal untuk PowerShell Windows

User menggunakan PowerShell Windows sebagai shell default.

### Aturan Navigasi Folder

SELALU pastikan user berada di folder `BahankuApp` sebelum menjalankan command instalasi atau build.

JANGAN langsung jalankan command instalasi tanpa navigasi ke folder yang benar.

**Format Command PowerShell:**

```powershell
# BENAR - Untuk PowerShell
cd BahankuApp
npm install

# ATAU dengan semicolon
cd BahankuApp; npm install

# SALAH - Jangan gunakan && di PowerShell
cd BahankuApp && npm install  # ❌ SALAH
```

### Template Instruksi yang Benar

Sebelum memberikan command instalasi atau build:

1. Pastikan working directory dengan menyebutkan: "Pastikan Anda berada di folder `BahankuApp`"
2. Berikan instruksi navigasi eksplisit jika perlu
3. Format command harus sesuai PowerShell Windows

Contoh instruksi yang benar:

```
Jalankan command berikut di PowerShell:

# 1. Pindah ke folder BahankuApp (jika belum)
cd BahankuApp

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start aplikasi
npx expo start -c
```

### Cek Dependency Sebelum Install

Sebelum menyarankan `npm install`, SELALU cek dulu apakah dependency sudah lengkap:

```powershell
# Cek dependency yang terinstall
npm ls --depth=0

# Atau simulasi install tanpa benar-benar install
npm install --dry-run
```

Jika output clean tanpa error "missing" atau "UNMET DEPENDENCY", berarti tidak perlu install lagi.

---

## Organize UI - Komponen Modular

Saat development berlangsung, pecah UI yang kompleks menjadi komponen-komponen kecil untuk menghindari TSX yang terlalu nested.

Bahkan dalam satu halaman (route), jangan ragu membuat file tambahan yang lebih kecil agar halaman lebih maintainable.

Memecah komponen besar menjadi beberapa file akan sangat membantu ketika user meminta perubahan atau refactor di masa mendatang.

### Panduan Komponen:

- Satu komponen maksimal 200 baris kode
- Jika JSX sudah nested lebih dari 4 level, pertimbangkan ekstrak jadi komponen baru
- Simpan komponen terkait dalam folder yang sama (misal: `components/home/` untuk komponen khusus homepage)
- Gunakan nama file yang deskriptif (misal: `SearchBar.tsx`, `CategoryFilter.tsx`)
- Export komponen dengan named export agar mudah di-import
