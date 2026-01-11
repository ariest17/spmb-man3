import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil Semua Data Master Pendaftaran
export async function GET() {
  try {
    const kuota = await prisma.kuota.findMany();
    const ruang = await prisma.ruangUjian.findMany({ orderBy: { namaRuang: 'asc' } });
    
    // --- TAMBAHAN BARU ---
    const listJalur = await prisma.masterJalur.findMany({ orderBy: { nama: 'asc' } });
    const listPeminatan = await prisma.masterPeminatan.findMany({ orderBy: { nama: 'asc' } });

    // Seed default otomatis jika kosong
    if (listJalur.length === 0) {
       await prisma.masterJalur.createMany({ data: [{ nama: 'REGULER' }, { nama: 'PRESTASI' }, { nama: 'AFIRMASI' }] });
    }
    if (listPeminatan.length === 0) {
       await prisma.masterPeminatan.createMany({ data: [{ nama: 'UMUM' }, { nama: 'AGAMA' }] });
    }
    // ---------------------

    return NextResponse.json({ kuota, ruang, listJalur, listPeminatan });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// POST: Handle Update Kuota, Ruang, Jadwal
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // ... di dalam const { type, data } = body;

    // --- LOGIKA BARU JALUR & PEMINATAN ---
    if (type === "tambah_jalur") {
      const res = await prisma.masterJalur.create({ data: { nama: data.nama.toUpperCase() } });
      return NextResponse.json(res);
    }
    if (type === "hapus_jalur") {
      await prisma.masterJalur.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }
    if (type === "tambah_peminatan") {
      const res = await prisma.masterPeminatan.create({ data: { nama: data.nama.toUpperCase() } });
      return NextResponse.json(res);
    }
    if (type === "hapus_peminatan") {
      await prisma.masterPeminatan.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }
    // -------------------------------------

    // ... logika kuota dan ruang (biarkan tetap ada) ...

    // --- LOGIKA KUOTA ---
    if (type === "kuota") {
        // Upsert: Update jika ada, Create jika belum
        const result = await prisma.kuota.upsert({
            where: {
                jalur_peminatan: {
                    jalur: data.jalur,
                    peminatan: data.peminatan
                }
            },
            update: { jumlah: parseInt(data.jumlah) },
            create: {
                jalur: data.jalur,
                peminatan: data.peminatan,
                jumlah: parseInt(data.jumlah)
            }
        });
        return NextResponse.json(result);
    }

    // --- LOGIKA RUANG UJIAN ---
    if (type === "tambah_ruang") {
        const res = await prisma.ruangUjian.create({
            data: { namaRuang: data.namaRuang, kapasitas: parseInt(data.kapasitas) }
        });
        return NextResponse.json(res);
    }
    if (type === "hapus_ruang") {
        await prisma.ruangUjian.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
    }

    // --- LOGIKA JADWAL UJIAN ---
    if (type === "tambah_jadwal") {
        const res = await prisma.jadwalUjian.create({
            data: {
                namaKegiatan: data.namaKegiatan,
                tanggal: new Date(data.tanggal), // Pastikan format YYYY-MM-DD
                waktuMulai: data.waktuMulai,
                waktuSelesai: data.waktuSelesai,
                lokasi: data.lokasi,
                keterangan: data.keterangan
            }
        });
        return NextResponse.json(res);
    }
    if (type === "hapus_jadwal") {
        await prisma.jadwalUjian.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Tipe aksi salah" }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}