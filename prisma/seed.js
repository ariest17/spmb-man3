const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { nomorRegistrasi: 'ADMIN001' },
    update: {},
    create: {
      nomorRegistrasi: 'ADMIN001',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('Admin created:', admin.nomorRegistrasi)

  // Create Sample Ruang Ujian
  const ruangUjian = [
    { namaRuang: 'Ruang 1', kapasitas: 30 },
    { namaRuang: 'Ruang 2', kapasitas: 30 },
    { namaRuang: 'Ruang 3', kapasitas: 30 },
    { namaRuang: 'Ruang 4', kapasitas: 30 },
    { namaRuang: 'Ruang 5', kapasitas: 30 },
  ]

  for (const ruang of ruangUjian) {
    await prisma.ruangUjian.upsert({
      where: { namaRuang: ruang.namaRuang },
      update: {},
      create: ruang
    })
  }
  console.log('Ruang ujian created')

  // Create Sample Pesantren
  const pesantrenList = [
    { nama: 'Pondok Pesantren Lirboyo', alamat: 'Kediri' },
    { nama: 'Pondok Pesantren Ploso', alamat: 'Kediri' },
    { nama: 'Pondok Pesantren Jampes', alamat: 'Kediri' },
    { nama: 'Pondok Pesantren Al-Falah', alamat: 'Kediri' },
    { nama: 'Pondok Pesantren Mahir Arriyadl', alamat: 'Kediri' },
  ]

  for (const pesantren of pesantrenList) {
    await prisma.pesantren.create({
      data: pesantren
    })
  }
  console.log('Pesantren created')

  // Create Sample Jadwal
  const jadwalList = [
    {
      namaKegiatan: 'Pendaftaran Online',
      tanggal: new Date('2026-01-01'),
      waktuMulai: '08:00',
      waktuSelesai: '16:00',
      lokasi: 'Online (Website SPMB)'
    },
    {
      namaKegiatan: 'Tes CBT - Gelombang 1',
      tanggal: new Date('2026-02-05'),
      waktuMulai: '07:30',
      waktuSelesai: '12:00',
      lokasi: 'Lab Komputer MAN 3 Kediri'
    },
    {
      namaKegiatan: 'Tes CBT - Gelombang 2',
      tanggal: new Date('2026-02-06'),
      waktuMulai: '07:30',
      waktuSelesai: '12:00',
      lokasi: 'Lab Komputer MAN 3 Kediri'
    },
    {
      namaKegiatan: 'Pengumuman Hasil Seleksi',
      tanggal: new Date('2026-02-10'),
      waktuMulai: '10:00',
      waktuSelesai: '17:00',
      lokasi: 'Online (Website SPMB)'
    },
    {
      namaKegiatan: 'Daftar Ulang',
      tanggal: new Date('2026-02-11'),
      waktuMulai: '08:00',
      waktuSelesai: '14:00',
      lokasi: 'Aula MAN 3 Kediri'
    }
  ]

  for (const jadwal of jadwalList) {
    await prisma.jadwalUjian.create({
      data: jadwal
    })
  }
  console.log('Jadwal created')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })