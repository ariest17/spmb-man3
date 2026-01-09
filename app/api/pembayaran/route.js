import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTagihanByGender } from '@/lib/utils'

// GET - List Pembayaran atau Cari Siswa
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const siswaId = searchParams.get('siswaId')

    if (siswaId) {
      // Get pembayaran spesifik siswa
      const pembayaran = await prisma.pembayaran.findFirst({
        where: { siswaId },
        include: {
          siswa: {
            include: {
              user: { select: { nomorRegistrasi: true } }
            }
          },
          riwayatBayar: {
            orderBy: { tanggal: 'desc' }
          }
        }
      })

      return NextResponse.json({ data: pembayaran })
    }

    // Cari siswa berdasarkan nama atau nomor registrasi
    const where = {
      status: 'LULUS' // Hanya yang sudah lulus
    }

    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { user: { nomorRegistrasi: { contains: search } } }
      ]
    }

    const siswa = await prisma.siswa.findMany({
      where,
      include: {
        user: { select: { nomorRegistrasi: true } },
        pembayaran: true
      },
      take: 20
    })

    return NextResponse.json({ data: siswa })

  } catch (error) {
    console.error('Error get pembayaran:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Input Pembayaran/Angsuran
export async function POST(request) {
  try {
    const body = await request.json()
    const { siswaId, jumlahBayar, keterangan } = body

    if (!siswaId || !jumlahBayar) {
      return NextResponse.json(
        { error: 'Siswa ID dan jumlah bayar wajib diisi' },
        { status: 400 }
      )
    }

    // Get atau create pembayaran
    let pembayaran = await prisma.pembayaran.findFirst({
      where: { siswaId }
    })

    if (!pembayaran) {
      // Get siswa untuk menentukan tagihan
      const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId }
      })

      if (!siswa) {
        return NextResponse.json(
          { error: 'Siswa tidak ditemukan' },
          { status: 404 }
        )
      }

      const totalTagihan = getTagihanByGender(siswa.jenisKelamin)
      pembayaran = await prisma.pembayaran.create({
        data: {
          siswaId,
          totalTagihan,
          jumlahBayar: 0,
          sisaBayar: totalTagihan,
          status: 'BELUM_LUNAS'
        }
      })
    }

    // Hitung pembayaran baru
    const jumlahBayarBaru = pembayaran.jumlahBayar + parseInt(jumlahBayar)
    const sisaBayar = pembayaran.totalTagihan - jumlahBayarBaru
    const statusBaru = sisaBayar <= 0 ? 'LUNAS' : 'BELUM_LUNAS'

    // Update pembayaran dan tambah riwayat
    const result = await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaran.id },
        data: {
          jumlahBayar: jumlahBayarBaru,
          sisaBayar: Math.max(0, sisaBayar),
          status: statusBaru,
          tanggalBayar: new Date()
        }
      }),
      prisma.riwayatPembayaran.create({
        data: {
          pembayaranId: pembayaran.id,
          jumlah: parseInt(jumlahBayar),
          keterangan
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil dicatat',
      data: result[0]
    })

  } catch (error) {
    console.error('Error input pembayaran:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}