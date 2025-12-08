# GitHub Actions - Build Android APK

Workflow ini akan otomatis build APK Android setiap kali ada push/PR ke branch `main`, `develop`, atau `feature/ui-polish`.

## Setup Required Secrets

Untuk menjalankan workflow ini, Anda perlu menambahkan secrets berikut di GitHub Repository Settings:

### 1. EXPO_TOKEN

Token untuk autentikasi dengan Expo EAS Build.

**Cara mendapatkan:**
```bash
# Login ke Expo CLI
npx eas login

# Generate personal access token
npx eas token:create
```

**Tambahkan ke GitHub:**
1. Buka repository di GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `EXPO_TOKEN`
5. Value: paste token dari command di atas

### 2. EXPO_PUBLIC_SUPABASE_URL

URL Supabase project Anda.

**Cara mendapatkan:**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project
3. Settings → API
4. Copy **Project URL**

**Tambahkan ke GitHub:**
- Name: `EXPO_PUBLIC_SUPABASE_URL`
- Value: `https://your-project.supabase.co`

### 3. EXPO_PUBLIC_SUPABASE_ANON_KEY

Anon key Supabase project Anda.

**Cara mendapatkan:**
1. Supabase Dashboard → Settings → API
2. Copy **anon public** key

**Tambahkan ke GitHub:**
- Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Value: paste anon key

## Cara Menjalankan Build

### Otomatis (via Push)

Build akan otomatis trigger saat:
- Push ke branch `main`, `develop`, atau `feature/ui-polish`
- Pull Request dibuat ke branch `main` atau `develop`

### Manual (via GitHub UI)

1. Buka tab **Actions** di GitHub repository
2. Pilih workflow **Build Android APK**
3. Klik **Run workflow**
4. Pilih branch
5. Klik **Run workflow** (hijau)

## Monitoring Build

1. Setelah workflow berjalan, buka [Expo EAS Build Dashboard](https://expo.dev/accounts/your-account/projects/bahankuapp/builds)
2. Build akan muncul dengan status:
   - **In Queue** - Menunggu
   - **In Progress** - Sedang build
   - **Finished** - Selesai (download APK)
   - **Failed** - Gagal (cek logs)

## Download APK

Setelah build selesai:
1. Buka EAS Build Dashboard
2. Klik build yang sudah **Finished**
3. Klik tombol **Download**
4. Install APK di Android device

## Build Profiles

- **development**: Development build dengan hot reload
- **preview**: APK untuk testing (tidak perlu Google Play)
- **production**: AAB untuk upload ke Google Play Store

## Troubleshooting

### Error: "Expo token is invalid"
- Generate ulang token: `npx eas token:create`
- Update secret `EXPO_TOKEN` di GitHub

### Error: "Build failed"
- Cek logs di EAS Dashboard
- Pastikan TypeScript check bersih: `npx tsc --noEmit`
- Pastikan `eas.json` sudah ada

### Error: "Missing environment variables"
- Pastikan secrets `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sudah ditambahkan di GitHub

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [EAS Build Dashboard](https://expo.dev/)
