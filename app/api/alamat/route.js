import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Simpan/Update Alamat
export async function POST(request) {
  try {
    const body = await request.json()
    const { siswaId, ...alamatData } = body

    if (!siswaId) {
      return NextResponse.json(
        { error: 'Siswa ID wajib diisi' },
        { status: 400 }
      )
    }

    const alamat = await prisma.alamat.upsert({
      where: { siswaId },
      update: alamatData,
      create: {
        siswaId,
        ...alamatData
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Alamat berhasil disimpan',
      data: alamat
    })

  } catch (error) {
    console.error('Error save alamat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}