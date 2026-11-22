# GarasiU (ApexLog)

**Vehicle Lifecycle & Preventive Maintenance Hub**: platform web garasi digital untuk mencatat siklus hidup kendaraan, memantau keausan suku cadang, menghitung efisiensi BBM, dan menyusun riwayat servis (*Digital Service Passport*).

> Tugas Besar Mata Kuliah **Perancangan & Pemrograman Web** (Pekan 2 - Pekan 14).
> Pemilik kendaraan: mobil dan motor harian/koleksi. Seluruh data (odometer, BBM, servis) diinput manual, tanpa IoT/OBD-II dan tanpa API pihak ketiga.

---

## Daftar Isi

1. [Latar Belakang & Tujuan](#1-latar-belakang--tujuan)
2. [Status Implementasi](#2-status-implementasi)
3. [Fitur Utama](#3-fitur-utama)
4. [Tech Stack](#4-tech-stack)
5. [Struktur Proyek](#5-struktur-proyek)
6. [Arsitektur & Alur Data](#6-arsitektur--alur-data)
7. [Model Data](#7-model-data)
8. [Referensi API](#8-referensi-api)
9. [Aturan Bisnis](#9-aturan-bisnis)
10. [Menjalankan Proyek](#10-menjalankan-proyek)
11. [Design System](#11-design-system)
12. [Pemetaan PRD ke Pekan Perkuliahan](#12-pemetaan-prd-ke-pekan-perkuliahan)
13. [Keamanan & Batasan Saat Ini](#13-keamanan--batasan-saat-ini)
14. [Dokumentasi Pendukung](#14-dokumentasi-pendukung)

---

## 1. Latar Belakang & Tujuan

Banyak pemilik kendaraan masih mengandalkan stiker pengingat di kaca, buku servis fisik, atau ingatan pribadi. Akibatnya:

- Informasi mudah rusak atau hilang.
- Penggantian suku cadang habis pakai (oli, filter, minyak rem, dll.) sering terlambat.
- Riwayat perawatan sulit dibuktikan saat kendaraan dijual, sehingga nilai jual turun.

**GarasiU** menjawabnya dengan:

| Tujuan | Wujud di aplikasi |
| --- | --- |
| Pusat kontrol multi-kendaraan | Dasbor garasi untuk beberapa mobil dan motor sekaligus |
| Pantau keausan komponen | Progress bar wear per komponen dengan status Optimal / Due Soon / Overdue |
| Efisiensi operasional | Kalkulasi km/L metode *full-to-full* dan biaya per km |
| Buku riwayat terverifikasi | Tabel Service Log yang dapat difilter dan dicetak |

**Non-goals:** tanpa perangkat IoT/OBD-II, tanpa *payment gateway*, tanpa integrasi jadwal servis resmi bengkel tertentu.

---

## 2. Status Implementasi

Proyek terdiri dari dua aplikasi dalam satu repositori: **frontend Next.js** (root) dan **backend NestJS** (`backend/`).

| Area | Status | Catatan |
| --- | --- | --- |
| UI Dasbor, Fuel Log, Service Log | Selesai | Responsif desktop dan mobile |
| Header cockpit + navigasi responsif | Selesai | Active route via `usePathname()`, drawer mobile |
| Autentikasi (login, signup, logout, sesi) | Berjalan | Token HMAC-SHA256 di cookie HttpOnly |
| CRUD Vehicles / Service Logs / Fuel Logs | Berjalan | REST API NestJS dengan validasi DTO |
| Sinkronisasi odometer dan wear otomatis | Berjalan | Dipicu oleh log servis, log BBM, dan update odometer |
| Penyimpanan data | **In-memory** | Data hilang saat backend restart |
| PostgreSQL + Prisma | **Skema siap, belum dihubungkan** | `backend/prisma/schema.prisma` ada, tetapi service masih memakai array memori |
| Isolasi data per pengguna | Belum | Kendaraan belum difilter berdasarkan `userId` |
| Pemicu keausan berbasis waktu (bulan) | Belum | Wear saat ini dihitung dari kilometer saja |
| Katalog suku cadang standar (`parts_catalog`) | Belum | Komponen dibuat dinamis dari log servis |
| Layout cetak A4 (`@media print`) | Sebagian | Header/Footer disembunyikan saat cetak, tombol Print ada; stylesheet A4 penuh belum |

---

## 3. Fitur Utama

### Modul A: Virtual Garage (Dasbor)
- Kartu kendaraan: nama, jenis, odometer, efisiensi BBM, estimasi biaya per km, status servis, dan daftar komponen.
- Modal **Tambah / Ubah Kendaraan** (`AddVehicleForm`): merek, model, nickname, tahun, plat, kapasitas tangki, odometer.
- **Hero cockpit** dengan pill status telemetri, sapaan, dan ringkasan garasi dinamis (menyesuaikan jumlah kendaraan dan komponen overdue).
- **Bento Telemetry Strip**: Fleet Units, Avg. Fuel Efficiency, Service Health, Monthly Spend.
- Pusat odometer: odometer kendaraan naik otomatis saat log servis/BBM mencatat angka lebih tinggi.

### Modul B: Predictive Maintenance
- Setiap komponen punya `intervalKm`, `lastServiceOdo`, dan `wear` (persen).
- Ambang status komponen: **Optimal** (< 75%), **Due Soon** (75% - < 100%), **Overdue** (>= 100%).
- Status kendaraan diturunkan dari komponen terburuk: `NOT_SYNC`, `HEALTHY`, `SERVICE_SOON`, `NEED_MAINTENANCE`.

### Modul C: Fuel Economy (Full-to-Full)
- Form log BBM: tanggal, odometer, jenis BBM, liter, total biaya, flag tangki penuh.
- Efisiensi dihitung server-side: `km/L = (odometer sekarang - odometer full-tank sebelumnya) / liter`.
- Halaman Fuel Log: kartu metrik, grafik tren efisiensi, tabel riwayat, ekspor CSV.

### Modul D: Digital Service Passport
- Tabel riwayat servis dengan filter kategori (*Routine Maintenance* / *Unscheduled Repair*) dan rentang waktu.
- Form catat/ubah servis: tanggal, odometer, komponen, bengkel, biaya, kategori.
- Tombol **Export PDF / Print** (`window.print()`); elemen navigasi disembunyikan saat cetak.

### Autentikasi
- Login, signup, logout, dan endpoint profil.
- Sesi disimpan di cookie `garasiu_session` (HttpOnly, SameSite=Lax); opsi *Remember Me* memperpanjang sesi dari 1 hari menjadi 7 hari.
- Middleware `src/proxy.js` mengalihkan pengguna belum login ke `/auth`, dan pengguna yang sudah login keluar dari halaman auth.

---

## 4. Tech Stack

**Frontend (root)**

| Teknologi | Versi / Catatan |
| --- | --- |
| Next.js (App Router) | 16.4.3, `cacheComponents`, `partialPrefetching`, `reactCompiler` aktif |
| React | 19.3.0 |
| Tailwind CSS | v4 (via `@tailwindcss/turbopack`, token di `tailwind.config.js`) |
| Font | Plus Jakarta Sans (heading), Inter (body), JetBrains Mono (angka/telemetri) via `next/font` |
| Ikon | Inline SVG dan Material Symbols Outlined |
| Lint | ESLint 9 + `eslint-config-next` |

**Backend (`backend/`)**

| Teknologi | Versi / Catatan |
| --- | --- |
| NestJS | ^12 (ESM, `"type": "module"`) |
| Validasi | `class-validator`, `class-transformer`, `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) |
| ORM (disiapkan) | Prisma ^6.19 dengan PostgreSQL |
| Pengujian | Vitest 4 (unit dan e2e) |
| Lint | oxlint (type-aware) |
| TypeScript | ^6 |

> Framer Motion / Motion **tidak** terpasang di proyek ini.

---

## 5. Struktur Proyek

```text
garasi-u/
├── src/                              # Frontend Next.js
│   ├── proxy.js                      # Guard sesi (redirect ke /auth)
│   ├── app/
│   │   ├── layout.jsx                # Root layout + font (next/font)
│   │   ├── globals.css               # Tailwind, grid blueprint, fallback reduced-transparency
│   │   ├── page.jsx                  # Dashboard  (/)
│   │   ├── fuel-log/page.jsx         # Fuel Log   (/fuel-log)
│   │   ├── service-log/page.jsx      # Service Log (/service-log)
│   │   ├── auth/page.jsx             # Alias halaman login
│   │   ├── login/page.jsx
│   │   ├── signup/page.jsx
│   │   └── api/auth/                 # Route handler proxy ke backend
│   │       ├── login/route.js        #   set cookie sesi
│   │       ├── signup/route.js
│   │       ├── logout/route.js       #   hapus cookie sesi
│   │       └── me/route.js           #   profil pengguna
│   ├── components/                   # Atomic Design
│   │   ├── shared/
│   │   │   ├── atoms/Icon.jsx
│   │   │   ├── molecules/VehicleSelector.jsx
│   │   │   └── organisms/            # Header, Footer, AddVehicleForm
│   │   ├── dashboard/                # DashboardHero, MetricWidget, VehicleCard, PartProgressBar
│   │   ├── fuel-log/                 # FuelHero, FuelMetricCard, FuelEfficiencyChart, FuelLogTable, AddFuelModal, ...
│   │   ├── service-log/              # ServiceHero, ServiceSummaryCard, ServiceTimelineTable, RecordServiceModal, ...
│   │   └── auth/                     # AuthCard, AuthInputField, SupportedBrands, ...
│   ├── data/garageData.js            # navLinks dan profil default
│   └── lib/api.js                    # Klien API + mapper backend ke UI
│
├── backend/                          # Backend NestJS (port 4000)
│   ├── prisma/schema.prisma          # Skema PostgreSQL (belum dihubungkan ke service)
│   └── src/
│       ├── main.ts                   # CORS, ValidationPipe, listen
│       ├── app.module.ts
│       ├── auth/                     # login, signup, me, AuthGuard, token HMAC
│       ├── vehicles/                 # CRUD kendaraan, sinkronisasi wear/status
│       ├── service-logs/             # CRUD riwayat servis
│       ├── fuel-logs/                # CRUD log BBM, hitung efisiensi
│       └── prisma/                   # PrismaModule / PrismaService (disiapkan)
│
├── public/img/                       # Aset gambar (logo wordmark, foto profil)
├── docs/                             # Dokumentasi tugas per pekan (tangkapan layar)
├── .taste-skill/                     # Rekaman inspeksi desain sebelum/sesudah (screenshot, ukuran, lint)
├── tailwind.config.js                # Token warna, font, bayangan
├── next.config.mjs
├── eslint.config.mjs
├── .env.example                      # Contoh env frontend
└── backend/.env.example              # Contoh env backend
```

---

## 6. Arsitektur & Alur Data

```mermaid
flowchart LR
    B[Browser] -->|halaman| N[Next.js :3000]
    B -->|/api/auth/*| R[Route Handler Next.js]
    R -->|login/signup/me| API[NestJS :4000]
    B -->|fetch + cookie, CORS credentials| API
    N -. proxy.js cek cookie .-> B
    API --> S[(In-memory store)]
    API -. rencana .-> P[(PostgreSQL via Prisma)]
```

1. **Login:** form memanggil `POST /api/auth/login` (Next.js). Route handler meneruskan ke NestJS `POST /auth/login`, lalu menyimpan `accessToken` sebagai cookie HttpOnly `garasiu_session`.
2. **Guard halaman:** `src/proxy.js` memverifikasi tanda tangan HMAC dan masa berlaku token. Tanpa sesi valid, pengguna diarahkan ke `/auth`.
3. **Data bisnis:** `src/lib/api.js` memanggil API NestJS langsung dengan `credentials: "include"`. Respons 401 memicu logout dan redirect ke `/auth`.
4. **Pemetaan data:** `mapBackendVehicle`, `mapBackendServiceLog`, `mapBackendFuelLog` mengubah enum dan tanggal backend ke bentuk yang siap ditampilkan UI.
5. **Sinkronisasi:** log servis dan log BBM memperbarui odometer kendaraan dan menghitung ulang wear komponen serta status servis.

---

## 7. Model Data

Skema Prisma (`backend/prisma/schema.prisma`, PostgreSQL):

```mermaid
erDiagram
    USER ||--o{ VEHICLE : memiliki
    VEHICLE ||--o{ VEHICLE_PART : punya
    VEHICLE ||--o{ SERVICE_LOG : dicatat
    VEHICLE ||--o{ FUEL_LOG : dicatat
    VEHICLE_PART ||--o{ SERVICE_LOG : "ditautkan (opsional)"

    USER {
      uuid id PK
      string email UK
      string name
      string passwordHash
    }
    VEHICLE {
      uuid id PK
      uuid userId FK
      enum type "CAR | MOTORCYCLE"
      string brand
      string model
      string plate UK
      float tankCapacity
      int currentOdometer
      enum serviceStatus
    }
    VEHICLE_PART {
      uuid id PK
      uuid vehicleId FK
      string name
      int intervalKm
      int lastServiceOdo
      date lastServiceDate
    }
    SERVICE_LOG {
      uuid id PK
      uuid vehicleId FK
      uuid vehiclePartId FK
      date serviceDate
      int odometerAtService
      enum category
      string workshop
      decimal cost
    }
    FUEL_LOG {
      int id PK
      uuid vehicleId FK
      string fuelType
      float liters
      decimal totalCost
      int odometerAtRefuel
      boolean isFullTank
      float fuelEfficiency
      date refuelDate
    }
```

**Enum:** `VehicleType` (`CAR`, `MOTORCYCLE`), `VehicleServiceStatus` (`NOT_SYNC`, `HEALTHY`, `SERVICE_SOON`, `NEED_MAINTENANCE`), `ServiceCategory` (`ROUTINE_MAINTENANCE`, `UNSCHEDULED_REPAIR`), `ServiceLogStatus` (`VERIFIED`, `COMPLETED`).

**Perbedaan dengan PRD:** PRD merancang `parts_catalog` global (interval km dan bulan per jenis kendaraan). Implementasi saat ini memakai tabel `vehicle_parts` per kendaraan (hanya `intervalKm`), sehingga pemicu berbasis bulan dan katalog standar masih menjadi pekerjaan lanjutan.

---

## 8. Referensi API

Base URL backend: `http://localhost:4000`. Semua endpoint selain `auth/login` dan `auth/signup` dilindungi `AuthGuard` (token Bearer/cookie sesi).

| Metode | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/auth/login` | Login, mengembalikan `accessToken` dan `user` |
| POST | `/auth/signup` | Registrasi akun baru |
| GET | `/auth/me` | Profil pengguna dari token |
| POST | `/vehicles` | Tambah kendaraan |
| GET | `/vehicles` | Daftar kendaraan |
| GET | `/vehicles/:id` | Detail kendaraan (`id` UUID) |
| PATCH | `/vehicles/:id` | Ubah kendaraan / odometer |
| DELETE | `/vehicles/:id` | Hapus kendaraan |
| POST | `/service-logs` | Catat servis |
| GET | `/service-logs?vehicleId=&category=` | Daftar servis (filter opsional) |
| GET / PATCH / DELETE | `/service-logs/:id` | Detail / ubah / hapus servis |
| POST | `/fuel-logs` | Catat pengisian BBM |
| GET | `/fuel-logs?vehicleId=` | Daftar log BBM (terbaru dahulu) |
| GET / PATCH / DELETE | `/fuel-logs/:id` | Detail / ubah / hapus log BBM (`id` integer) |

Proxy Next.js (untuk cookie sesi): `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/logout`, `GET /api/auth/me`.

Validasi global menolak properti yang tidak dikenal (`forbidNonWhitelisted`) dan mentransformasi tipe otomatis.

---

## 9. Aturan Bisnis

**Odometer**
- Odometer saat ini tidak boleh lebih kecil dari odometer awal.
- Log BBM baru wajib memiliki odometer >= odometer kendaraan saat ini; setelah tersimpan, odometer kendaraan diperbarui.
- Log servis dengan odometer lebih tinggi ikut menaikkan odometer kendaraan.

**BBM**
- Tidak dapat mencatat BBM untuk kendaraan non-aktif.
- Volume pengisian tidak boleh melebihi kapasitas tangki kendaraan (jika diisi).
- Efisiensi hanya dihitung untuk pengisian *full tank* dan jika ada pengisian full tank sebelumnya:

```text
km/L        = (odometer_sekarang - odometer_full_sebelumnya) / liter
biaya / km  = total_biaya / jarak_tempuh
```

**Keausan komponen (saat ini berbasis kilometer)**

```text
jarak_sejak_servis = max(0, odometer_kendaraan - lastServiceOdo)
wear (%)           = round(jarak_sejak_servis / intervalKm * 100)
```

| Wear | Status komponen |
| --- | --- |
| < 75% | Optimal (hijau) |
| 75% - < 100% | Due Soon (kuning) |
| >= 100% | Overdue (merah) |

Status kendaraan: ada komponen overdue maka `NEED_MAINTENANCE`; ada due soon maka `SERVICE_SOON`; selain itu `HEALTHY`; tanpa komponen `NOT_SYNC`. Interval bawaan komponen baru: 5.000 km.

**Target PRD (belum diimplementasikan):** pemicu ganda jarak dan waktu (mana yang tercapai lebih dulu) dengan katalog bawaan, misalnya mobil: Oli Mesin 5.000 km / 6 bulan; motor: Oli Mesin 2.500 km / 2 bulan.

---

## 10. Menjalankan Proyek

### Prasyarat
- Node.js 20+ (dikembangkan dengan Node 24) dan npm
- (Opsional, untuk tahap database) PostgreSQL

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Isi `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
AUTH_SECRET="ganti-dengan-secret-acak-yang-kuat"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/garasi_u?schema=public"
```

Buat akun lokal untuk login (berkas ini di-*gitignore*):

```bash
cp src/auth/dummy-account.example.json src/auth/dummy-account.local.json
# lalu ubah name, email, dan password di dalamnya
```

Alternatif: daftar lewat halaman `/signup`. Karena penyimpanan masih in-memory, akun hasil signup hilang saat backend restart.

```bash
npm run start:dev         # http://localhost:4000
```

### 2. Frontend

```bash
# dari root repositori
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
AUTH_SECRET=nilai-yang-sama-dengan-backend
```

> `AUTH_SECRET` di frontend **harus sama** dengan backend karena `src/proxy.js` memverifikasi tanda tangan token secara lokal.

```bash
npm run dev               # http://localhost:3000
```

### Skrip yang tersedia

| Lokasi | Perintah | Fungsi |
| --- | --- | --- |
| root | `npm run dev` | Dev server Next.js |
| root | `npm run build` / `npm start` | Build dan jalankan produksi |
| root | `npm run lint` | ESLint frontend |
| `backend/` | `npm run start:dev` | NestJS mode watch |
| `backend/` | `npm run build` / `npm run start:prod` | Build dan jalankan produksi |
| `backend/` | `npm test` | Unit test (Vitest) |
| `backend/` | `npm run test:e2e` | Uji e2e |
| `backend/` | `npm run lint` | oxlint type-aware |

### Rencana hubungkan PostgreSQL (langkah berikutnya)

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Setelah itu `VehiclesService`, `ServiceLogsService`, `FuelLogsService`, dan `AuthService` perlu dialihkan dari array memori ke `PrismaService`.

---

## 11. Design System

Identitas visual: **Rivian Web Cockpit** (telemetri otomotif, tema gelap tunggal).

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `canvas` | `#0A0D12` | Latar terdalam, wadah pill navigasi |
| `surface-base` | `#0D1117` | Header, panel |
| `surface-raised` | `#161B22` | Kartu, pill aktif |
| `line-subtle` | `#263040` | Border |
| `action` | `#38BDF8` | Satu-satunya aksen (CTA, indikator aktif) |
| `status-*` | `#10B981` / `#F59E0B` / `#EF4444` | Sukses / peringatan / bahaya |

**Tipografi:** Plus Jakarta Sans (heading), Inter (body), JetBrains Mono (label, angka, telemetri).

**Pola UI utama**
- Header sticky 80px bergaya kaca (`backdrop-blur`), pill navigasi tersegmen, CTA primer cyan vs Logout *ghost*, drawer geser-turun di mobile dengan tombol hamburger.
- Hero cockpit tanpa kartu pemisah, ambient glow radial cyan di belakang grid blueprint.
- Bento telemetry strip 4 kartu (2x2 di mobile, 4 kolom di desktop).
- Fallback `prefers-reduced-transparency` pada permukaan kaca (kelas `.telemetry-glass`).

Rekaman inspeksi sebelum/sesudah redesign (tangkapan layar, ukuran, hasil lint) ada di `.taste-skill/before` dan `.taste-skill/after`.

---

## 12. Pemetaan PRD ke Pekan Perkuliahan

| Pekan | Materi | Deliverable pada GarasiU | Status |
| --- | --- | --- | --- |
| 2 - 4 | HTML5 semantik, CSS (Flexbox, Grid), form | Antarmuka dasbor, kartu bento, modal form, tabel log responsif | Selesai |
| 5 - 7 | JavaScript sisi klien, DOM events, validasi | Kalkulasi BBM interaktif, validasi odometer, filter tabel servis | Sebagian (validasi utama di server dan form modal) |
| 8 - 10 | Basis data relasional, 3NF, koneksi backend | Skema ERD dan koneksi basis data | Skema Prisma siap, koneksi DB belum |
| 11 - 13 | Server-side, autentikasi, CRUD | Login/registrasi, CRUD kendaraan/servis/BBM, update status wear di server | Selesai (penyimpanan in-memory) |
| 14 | Polishing, audit keamanan, print media, deployment | Sanitasi input, `@media print`, hosting publik | Dalam proses |

---

## 13. Keamanan & Batasan Saat Ini

**Sudah diterapkan**
- Password di-hash dengan `scrypt` + salt acak, dibandingkan dengan `timingSafeEqual`.
- Token sesi ditandatangani HMAC-SHA256 dan memiliki masa berlaku; cookie HttpOnly + SameSite=Lax (`secure` di produksi).
- `ValidationPipe` global dengan `whitelist` dan `forbidNonWhitelisted`.
- CORS dibatasi ke `FRONTEND_URL` dengan `credentials`.
- Parameter ID divalidasi (`ParseUUIDPipe` / `ParseIntPipe` / `ParseEnumPipe`).

**Batasan yang perlu diketahui**
- Data aplikasi (akun, kendaraan, log) tersimpan di memori backend dan **hilang saat restart**.
- Endpoint kendaraan/servis/BBM belum membatasi data per pengguna; semua pengguna terautentikasi melihat data yang sama.
- `AUTH_SECRET` memiliki nilai bawaan lokal; **wajib diganti** pada lingkungan selain pengembangan.
- Pemicu keausan berbasis waktu dan katalog suku cadang standar belum tersedia.
- Pencegahan SQL Injection akan datang melalui Prisma (query terparameter) setelah database dihubungkan.

---

## 14. Dokumentasi Pendukung

- `docs/9-nest-dan-mvc/`: dokumentasi tugas NestJS dan MVC (langkah 1 - 5, pengujian REST client, koneksi ke frontend) berupa tangkapan layar.
- `docs/10/`: ruang untuk dokumentasi pekan berikutnya.
- `backend/README.md`: panduan bawaan NestJS (skrip dan referensi).

---

**Pengembang:** Daniartha Wikus Nugroho. Proyek akademik, tidak untuk penggunaan produksi tanpa menyelesaikan batasan pada bagian 13.
