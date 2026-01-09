# SPMB MAN 3 Kediri

Sistem Penerimaan Murid Baru MAN 3 Kediri - Aplikasi pendaftaran siswa baru berbasis web.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL dengan Prisma ORM
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: NextAuth.js

## Fitur Utama

### 1. Pendaftaran Siswa
- Form pendaftaran dengan validasi
- Generate nomor registrasi otomatis (Format: RG260001)
- Pilihan jalur: Reguler, Prestasi, Afirmasi
- Pilihan peminatan: Umum, Agama

### 2. Dashboard Siswa
- **Status A (Masa Seleksi)**: Akses menu Cetak Kartu dan Jadwal
- **Status B (Lulus)**: Akses tambahan ke Form Daftar Ulang
- Cetak Kartu Ujian dengan auto-assign ruangan (Jalur Reguler)
- Generate password CBT otomatis

### 3. Form Daftar Ulang (5 Tab)
- Tab 1: Data Siswa
- Tab 2: Data Orang Tua (dengan logika Meninggal)
- Tab 3: Alamat (opsi Pondok dengan dropdown pesantren)
- Tab 4: Akademik (Input nilai rapor)
- Tab 5: Upload Berkas

### 4. Admin Dashboard
- Statistik real-time dengan filter
- Manajemen status siswa (Lulus/Tidak Lulus)
- Modul pembayaran dengan angsuran
- Import Excel untuk jalur Go Aksio

### 5. Modul Keuangan
- Tagihan otomatis berdasarkan gender:
  - Laki-laki: Rp 1.000.000
  - Perempuan: Rp 1.200.000
- Fitur pembayaran angsuran
- Riwayat pembayaran

## Instalasi

### Prasyarat
- Node.js 18+
- MySQL (XAMPP/Laragon/etc)
- Yarn/npm

### Langkah Instalasi

1. **Clone dan Install Dependencies**
```bash
git clone <repo-url>
cd spmb-man3-kediri
yarn install
```

2. **Setup Environment**
```bash
cp .env.example .env
```

Edit file `.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/spmb_man3kediri"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Buat Database MySQL**
```sql
CREATE DATABASE spmb_man3kediri;
```

4. **Generate Prisma Client & Push Schema**
```bash
yarn db:generate
yarn db:push
```

5. **Seed Database (Opsional)**
```bash
yarn db:seed
```

6. **Jalankan Development Server**
```bash
yarn dev
```

7. **Akses Aplikasi**
- Frontend: http://localhost:3000
- Admin Login: `ADMIN001` / `admin123`

## Struktur Database

### Tabel Utama
- `users` - Autentikasi (nomor_registrasi, password, role)
- `siswa` - Data utama siswa
- `orang_tua` - Data orang tua/wali
- `alamat` - Data alamat siswa
- `akademik` - Nilai rapor
- `berkas` - Upload dokumen
- `ruang_ujian` - Master ruang ujian
- `pembayaran` - Transaksi pembayaran
- `riwayat_pembayaran` - History angsuran
- `pesantren` - Master pesantren
- `jadwal_ujian` - Jadwal kegiatan
- `counter` - Counter nomor registrasi

## API Endpoints

### Auth
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Pendaftaran
- `POST /api/pendaftaran` - Daftar baru
- `GET /api/pendaftaran` - List pendaftar (Admin)

### Siswa
- `GET /api/siswa/[id]` - Detail siswa
- `PUT /api/siswa/[id]` - Update data siswa
- `POST /api/siswa/[id]/cetak-kartu` - Generate kartu ujian
- `PUT /api/siswa/[id]/status` - Update status (Admin)

### Pembayaran
- `GET /api/pembayaran` - List/cari pembayaran
- `POST /api/pembayaran` - Input pembayaran

### Admin
- `GET /api/admin/statistik` - Statistik dashboard
- `POST /api/admin/import` - Import Excel Go Aksio

### Master Data
- `GET /api/jadwal` - List jadwal
- `GET /api/master/pesantren` - List pesantren

## Deployment ke cPanel

1. Build aplikasi:
```bash
yarn build
```

2. Upload folder `.next`, `public`, `prisma`, `package.json`, `.env` ke hosting

3. Setup Node.js App di cPanel

4. Konfigurasi MySQL database

5. Run `npx prisma db push`

6. Start aplikasi

## License

MIT License - MAN 3 Kediri
