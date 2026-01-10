import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Ambil Data Pembayaran Siswa
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const siswaId = searchParams.get('siswaId')

  if (!siswaId) {
    return NextResponse.json({ error: 'Siswa ID wajib diisi' }, { status: 400 })
  }

  try {
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { siswaId },
      include: {
        riwayatBayar: {
          orderBy: { tanggal: 'desc' }
        }
      }
    })

    return NextResponse.json({ success: true, data: pembayaran })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat pembayaran' }, { status: 500 })
  }
}

// POST - Simpan Pembayaran Baru
export async function POST(request) {
  try {
    // --- UPDATE: Menerima 'petugas' dari body ---
    const { siswaId, jumlahBayar, keterangan, petugas } = await request.json()

    if (!siswaId || !jumlahBayar) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // 1. Ambil data pembayaran saat ini
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { siswaId }
    })

    if (!pembayaran) {
      return NextResponse.json({ error: 'Data tagihan tidak ditemukan' }, { status: 404 })
    }

    // 2. Hitung nominal baru
    const newJumlahBayar = pembayaran.jumlahBayar + jumlahBayar
    const newSisaBayar = pembayaran.totalTagihan - newJumlahBayar
    
    // Status Lunas jika sisa <= 0
    const newStatus = newSisaBayar <= 0 ? 'LUNAS' : 'BELUM_LUNAS'

    // 3. Update Database (Transaksi)
    const result = await prisma.$transaction(async (tx) => {
      // Update Tabel Utama
      const updatedPembayaran = await tx.pembayaran.update({
        where: { id: pembayaran.id },
        data: {
          jumlahBayar: newJumlahBayar,
          sisaBayar: newSisaBayar < 0 ? 0 : newSisaBayar, // Mencegah minus
          status: newStatus,
          tanggalBayar: new Date() // Tanggal pembayaran terakhir
        }
      })

      // Catat di Riwayat (Log)
      await tx.riwayatPembayaran.create({
        data: {
          pembayaranId: pembayaran.id,
          jumlah: jumlahBayar,
          keterangan: keterangan || 'Pembayaran angsuran',
          petugas: petugas || 'Admin' // Simpan nama petugas yang dikirim dari Frontend
        }
      })

      return updatedPembayaran
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pembayaran berhasil disimpan',
      data: result 
    })

  } catch (error) {
    console.error('Error payment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
