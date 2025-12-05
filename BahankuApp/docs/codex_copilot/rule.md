# Codex ↔ Copilot Collaboration Rules

Seluruh percakapan/tiket antara Codex dan GitHub Copilot harus disimpan di folder ini agar histori gampang dilacak.

## Struktur

```
docs/codex_copilot/
  rule.md
  requests/
    YYYYMMDD-HHmm-topic-request.json|md
  responses/
    YYYYMMDD-HHmm-topic-response.md
```

## Penamaan

- `YYYYMMDD` : tanggal UTC
- `HHmm` : jam + menit UTC (opsional jika tidak ada)
- `topic` : slug singkat (kebab-case)
- suffix `-request` untuk instruksi, `-response` untuk hasil
- Format file:
  - Request otomatis → `.json`
  - Request manual / catatan → `.md`
  - Response selalu `.md`

## Konten Request

Minimal mencakup:

1. `from` – siapa yang meminta (Codex / Copilot / Pangeran / Adam)
2. `context` – latar belakang singkat
3. `instructions` – array judul + langkah langkah detail
4. `deliverable` – apa yang harus dilaporkan
5. `thanks` / penutup opsional

## Konten Response

Wajib ada:

- Judul + timestamp
- Ringkasan tindakan
- Status tiap poin (✅/⚠️/❌)
- Tautan ke request yang dijawab

## Aturan Lain

- Jangan menimpa file lama; buat file baru jika ada revisi berikutnya.
- Sertakan path request/response pasangan di bagian atas dokumen supaya mudah ditrace.
- Jika tugas menyangkut layanan eksternal (Supabase MCP, dsb.) jelaskan jelas di request.
