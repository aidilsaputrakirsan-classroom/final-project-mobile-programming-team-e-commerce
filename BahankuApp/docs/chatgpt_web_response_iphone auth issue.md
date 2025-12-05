Oke, ini cukup menarik kasusnya. Dari gejala yang kamu jelasin, masalahnya hampir pasti di sisi **client (Supabase JS + Expo 54 di iOS)**, bukan di database Supabase, apalagi security cleanup kamu sudah rapi dan tidak ada query error di dashboard.

Aku jawab per poin pertanyaan, lalu kasih langkah eksperimen konkret yang bisa kalian jalankan bareng Codex.

---

## 1. Ada kasus serupa di komunitas Expo / Supabase?

Ya, ada beberapa yang polanya mirip banget:

### a. StackOverflow: app stuck loading setelah reload / restart

Ada thread StackOverflow (Agustus 2025) dengan gejala:

- App jalan normal kalau dibiarkan beberapa jam
- Begitu di-reload atau di-restart, semua screen cuma nunjukin loading state tanpa data
- Tidak ada error di Supabase, semua log 200 OK
- Kadang user bahkan ke-logout dan tidak bisa login lagi

Solusinya ternyata konyol tapi penting: dia **menghapus pemanggilan manual `refreshSession` di dalam `onAuthStateChange`**.

Sebelumnya dia punya:

```ts
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// DISABLE BAGIAN INI:
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    await supabase.auth.refreshSession();
  }
});
```

Begitu bagian `refreshSession()` itu di-comment, app kembali normal. ([Stack Overflow][1])

Jadi kombinasi **auto refresh bawaan Supabase** + **manual refresh di hook** bisa bikin state auth “kejerat” dan semua request berikutnya seperti nge-hang.

Ini mirip dengan kasus kamu:

- Setelah beberapa kondisi “aneh” (sleep, reload Metro), hook auth kamu memutuskan “timeout” dan jalan tanpa Supabase
- Lalu semua fetch yang bergantung pada session tidak jalan atau tidak pernah resolve

### b. Supabase issue: auth rusak setelah reload OTA / reload bundle

Di repo supabase-js ada issue khusus Expo: setelah `Updates.reloadAsync()` (yang pada dasarnya memuat ulang bundle JS), **session tidak bisa dipulihkan dan tiap call ke Supabase mentok dengan error `AuthRetryableFetchError`**. ([GitHub][2])

Pola besarnya sama:

- Cold start biasa jalan
- Setelah reload bundle, auth + network layer Supabase bisa masuk keadaan rusak

### c. Diskusi “persist session” di Expo + Supabase

Ada juga diskusi resmi Supabase tentang **session yang tidak ke-restore di Expo**, dan mereka menekankan pentingnya:

- client dibuat sekali saja (singleton)
- konfigurasi `auth` ada di bawah key `auth`, bukan langsung di root
- pakai `AsyncStorage`, `autoRefreshToken: true`, `persistSession: true` dan `detectSessionInUrl: false`
  ([GitHub][3])

Jadi, jawaban singkat:

> Ya, ada beberapa kasus serupa di komunitas. Biasanya sumbernya kombinasi antara konfigurasi client Supabase yang tidak persis seperti di dokumentasi + logic tambahan di sekitar `onAuthStateChange` atau `refreshSession` yang bikin deadlock setelah reload.

---

## 2. Langkah debugging untuk memastikan Supabase session tidak timeout di iOS (tanpa harus restart laptop)

Aku bagi jadi beberapa layer: **setup client**, **hook auth**, dan **cek jaringan**.

### 2.1. Samakan dulu client Supabase dengan template resmi Expo

Bandingkan `lib/supabase.ts` atau file client kalian dengan template terbaru Supabase + Expo. Kurang lebih mereka menyarankan:

```ts
// lib/supabase.ts
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Hanya sekali, di luar komponen
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

Ini langsung diambil dari quickstart resmi Supabase React Native terbaru. ([Supabase][4])

Checklist yang perlu kamu cocokin:

- [ ] `auth` memang di dalam key `auth`, bukan di level atas opsi `createClient`
- [ ] `storage: AsyncStorage` dipakai untuk non web
- [ ] `lock: processLock` diset, karena ini penting supaya operasi baca/tulis session tidak saling ngunci di React Native
- [ ] `AppState.addEventListener` dipasang **sekali** di luar komponen, bukan di dalam hook yang bisa ke-register berkali-kali setelah fast refresh

Kalau BahanKu belum pakai `lock: processLock` atau AppState listener ada di `useAuth.ts` dan kena re-register setiap reload, itu kandidat kuat sumber masalah.

---

### 2.2. Sederhanakan `useAuth.ts` sementara, buang timeout dan logic ekstra

Untuk mendiagnosis, aku sarankan bikin versi minimal `useAuth` yang:

- **Tidak** pakai timeout “inisialisasi auth melewati batas waktu”
- **Tidak** memanggil `refreshSession()` manual di `onAuthStateChange`
- Cuma melakukan `getSession` sekali, lalu subscribe ke perubahan

Contoh pola minimal:

```ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function useAuthDebug() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      console.log('[auth] getSession start');
      const { data, error } = await supabase.auth.getSession();
      console.log('[auth] getSession result', {
        hasSession: !!data?.session,
        error,
      });

      if (!cancelled) {
        setSession(data.session ?? null);
        setReady(true);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth] onAuthStateChange', event, !!session);
      if (!cancelled) setSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { session, ready };
}
```

Lalu:

1. Pakai hook ini untuk sementara di root (AuthProvider kalian).
2. Replikasi langkah yang biasa bikin app rusak:
   - laptop sleep
   - bangun
   - `npx expo start -c`
   - scan QR di iPhone

3. Lihat log Metro:
   - Kalau `getSession` **tidak pernah** nge-log hasil, berarti ada sesuatu di supabase client yang nge-block promise.
   - Kalau `getSession` resolve dengan session, tapi UI kalian tetap masuk path “timeout, jalankan tanpa Supabase”, berarti logika timeout di versi `useAuth` aslinya yang perlu direvisi.

Sebagaimana di kasus StackOverflow tadi, sering kali masalah muncul justru dari **logic tambahan di sekitar Supabase**, bukan dari Supabase-nya. ([Stack Overflow][1])

---

### 2.3. Ping Supabase dari layar “Dev / Diagnostics”

Biar yakin masalahnya bukan di network iOS, bikin satu screen atau dev menu yang bisa kamu buka saat app lagi “rusak”:

```ts
const testPing = async () => {
  console.log('[dev] ping start');
  const { data, error } = await supabase.from('products').select('id').limit(1);
  console.log('[dev] ping result', { error, count: data?.length });
};
```

Saat kondisi “auth timeout, jalan tanpa Supabase” terjadi:

1. Buka screen ini
2. Tekan tombol “Ping Supabase”
3. Perhatikan hasil:

- Kalau `console.log` untuk result **tidak pernah muncul**, maka network call ke Supabase tidak pernah dikirim atau promise tidak resolve, yang berarti masalah di client layer.
- Kalau error muncul (misal `Network request failed` atau `AuthRetryableFetchError`), catat detailnya untuk dibawa ke issue Supabase atau Expo.

---

### 2.4. Cek versi `@supabase/supabase-js` yang digunakan

Ada issue terbaru di supabase-js v2.49.8 di React Native terkait import `ws` yang bikin app crash di iOS. Itu biasanya langsung bikin Metro error, bukan cuma skeleton loading, tapi tetap penting untuk:

- Pastikan kamu tidak berada di versi yang sedang bermasalah
- Kalau perlu, pin ke versi yang direkomendasikan di docs Expo/Supabase saat ini ([GitHub][5])

---

## 3. Reset / setting di Expo Go atau iOS yang bisa dicoba

Ini daftar “hard reset” yang bisa kamu eksperimenkan **tanpa restart laptop**.

### 3.1. Reset cache & state Expo Go

Langkah yang bisa dicoba di iPhone:

1. Tutup Expo Go dari app switcher.
2. Buka lagi Expo Go, lalu:
   - Kalau ada dev menu (shake device atau lewat Metro: tekan `d`), gunakan opsi seperti:
     - “Reload”
     - “Clear React Native cache” atau serupa (tergantung versi)

3. Kalau masih aneh, lakukan reset penuh:
   - iOS Settings → General → iPhone Storage → Expo Go
   - Pilih “Delete App”
   - Install ulang Expo Go dari App Store
     Ini juga akan menghapus AsyncStorage untuk “app dalam app” BahanKu yang jalan di Expo Go.

Untuk Metro di laptop kamu sudah rutin pakai `npx expo start -c`, itu sudah langkah yang benar buat clear cache bundler. ([Expo Documentation][6])

### 3.2. Reset storage Supabase secara eksplisit (opsional)

Kalau nanti kamu pakai **SecureStore** atau menyimpan token di tempat lain, uninstall saja tidak selalu menghapus Keychain. Cara yang lebih “bersih”:

- Tambah satu opsi di layar pengembang, misalnya “Reset auth storage” yang melakukan:

```ts
await supabase.auth.signOut();
await AsyncStorage.clear(); // atau hanya key-key "sb-..."
```

Ini memastikan tidak ada session/token lama yang membuat logic timeout kamu bingung.

### 3.3. Cek jaringan iOS saja, tanpa sentuh laptop

Saat bug muncul, sebelum kamu restart laptop, coba:

1. Matikan Wi-Fi di iPhone, hidupkan lagi
2. Kalau pakai VPN, matikan dulu
3. Coba “Ping Supabase” dari dev screen tadi

Kalau setelah toggle Wi-Fi app tiba-tiba normal lagi, berarti problemnya lebih ke koneksi device → internet, bukan antara laptop dan device.

---

## 4. Eksperimen terarah yang aku sarankan kalian lakukan

Supaya debugging tidak nyebar kemana-mana, aku sarankan urut seperti ini:

1. **Samakan client Supabase dengan template terbaru**
   Pastikan `lock: processLock`, `AppState` listener hanya satu, dan opsi `auth` sesuai docs. ([Supabase][4])

2. **Matikan semua logic ekstra di `useAuth.ts` sementara**
   - Hilangkan timeout “Inisialisasi auth melewati batas waktu…”
   - Hilangkan panggilan `refreshSession` manual di `onAuthStateChange` jika ada
   - Pakai versi minimal seperti contoh di atas dan pasang banyak `console.log`

3. **Buat layar “Dev / Ping Supabase”**
   - Jalankan saat app stuck untuk melihat apakah request benar-benar hang atau hanya UI yang “menyerah duluan”.

4. **Minimal repro project**
   - Buat project baru dengan Expo 54 dan quickstart Supabase React Native resmi
   - Jalankan di iPhone yang sama
   - Ulangi skenario sleep laptop → start Metro → scan QR
   - Kalau project minimal tidak pernah rusak, berarti bug ada di kombinasi `useAuth` + BahanKu, bukan di stack Expo/Supabase global.

Kalau setelah langkah 1–4 app masih masuk kondisi “auth timeout” dan request memang tidak pernah resolve, kamu sudah punya:

- Log `getSession` + `onAuthStateChange`
- Versi supabase-js dan expo kamu
- Info bahwa project minimal pun bermasalah atau tidak

Ini bahan yang sangat bagus kalau mau buka issue di Supabase atau Expo.

---

Kalau kamu mau, kita juga bisa:

- Bedah isi `src/hooks/useAuth.ts` bareng
- Desain ulang flow auth BahanKu supaya lebih mendekati template resmi (tapi tetap cocok sama struktur tab Home / Orders / Cart kalian)

Kamu tinggal paste isi filenya di chat berikutnya, nanti kita stepping pelan-pelan.

[1]: https://stackoverflow.com/questions/79746968/app-not-fetching-any-data-from-supabase-only-after-the-session-expires-hours-la 'react native - App not fetching any data from Supabase, only after the session expires hours later - Stack Overflow'
[2]: https://github.com/supabase/supabase-js/issues/1367 '[expo] Supabase Auth Fails After Expo OTA Update IOS · Issue #1367 · supabase/supabase-js · GitHub'
[3]: https://github.com/orgs/supabase/discussions/20155 'Cant seem to persist session with Expo · supabase · Discussion #20155 · GitHub'
[4]: https://supabase.com/docs/guides/auth/quickstarts/react-native 'Use Supabase Auth with React Native | Supabase Docs'
[5]: https://github.com/supabase/supabase-js/issues/1434 '@supabase/supabase-js v2.x fails on React Native (Expo) due to ws module import, even with realtime disabled · Issue #1434 · supabase/supabase-js · GitHub'
[6]: https://docs.expo.dev/guides/customizing-metro/?utm_source=chatgpt.com 'Metro bundler - Expo Documentation'
