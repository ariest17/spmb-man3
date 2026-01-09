import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List Jadwal Ujian
export async function GET() {
  try {
    const jadwal = await prisma.jadwalUjian.findMany({
      orderBy: { tanggal: 'asc' }
    })

    return NextResponse.json({ data: jadwal })

  } catch (error) {
    console.error('Error get jadwal:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Tambah Jadwal (Admin)
export async function POST(request) {
  try {
    const body = await request.json()
    const { namaKegiatan, tanggal, waktuMulai, waktuSelesai, lokasi, keterangan } = body

    if (!namaKegiatan || !tanggal || !waktuMulai || !waktuSelesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const jadwal = await prisma.jadwalUjian.create({
      data: {
        namaKegiatan,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai,
        lokasi,
        keterangan
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Jadwal berhasil ditambahkan',
      data: jadwal
    }, { status: 201 })

  } catch (error) {
    console.error('Error create jadwal:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}