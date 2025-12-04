# Design Document — BahanKu

## Overview

BahanKu adalah aplikasi mobile e-commerce yang dibangun dengan React Native (Expo) dan TypeScript. Aplikasi ini memungkinkan customer untuk membeli bahan dapur secara online dari single-seller, melihat inspirasi resep, dan mengelola pesanan. Admin dapat mengelola produk, kategori, dan status pesanan melalui panel admin.

**Target Audiens:**

- **Customer**: Pengguna umum yang ingin membeli bahan dapur dan mencari resep
- **Admin**: Pengelola toko yang mengatur katalog dan pesanan

**Pendekatan Desain:**

- **Mobile-first**: Desain utama untuk Android, kompatibel dengan iOS
- **Minimalis dan fungsional**: Fokus pada kemudahan navigasi dan performa
- **Offline-capable**: Cart dan produk terakhir di-cache untuk akses tanpa internet

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         User Interface (React Native + Expo Router)         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components Layer                                    │   │
│  │  - ProductCard, RecipeCard, QuantityStepper         │   │
│  │  - EmptyState, LoadingSkeleton                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (Zustand + AsyncStorage)          │   │
│  │  - cart.store.ts (Cart state + persist)             │   │
│  │  - ui.store.ts (Dark mode, loading)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Hooks Layer                                         │   │
│  │  - useAuth, useProducts, useOrders, useRecipes      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  - supabase.client.ts (Auth + DB)                   │   │
│  │  - image.ts (Upload to Storage)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│      Supabase (PostgreSQL + Auth + Storage)                 │
│  - Tables: users, products, categories, orders, recipes     │
│  - Storage: images bucket                                   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React Native 0.81.5 + TypeScript 5.9
- **Navigation**: Expo Router 6.0 (file-based routing)
- **State Management**: Zustand 5.0 + AsyncStorage (persist middleware)
- **Backend-as-a-Service**: Supabase 2.76 (PostgreSQL + Auth + Storage)
- **Form Handling**: React Hook Form 7.65 + Zod 3.25 (validation)
- **Icons**: Lucide React Native 0.548
- **Styling**: StyleSheet + Custom Theme (`src/theme/index.ts`)
- **Build Tool**: Expo SDK 54
- \*\*
