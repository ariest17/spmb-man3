import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Simpan/Update Data Akademik (Nilai Rapor)
export async function POST(request) {
  try {
    const body = await request.json()
    const { siswaId, nilaiMatematika, nilaiBahasaIndonesia, nilaiBahasaInggris, nilaiIpa, nilaiIps } = body

    if (!siswaId) {
      return NextResponse.json(
        { error: 'Siswa ID wajib diisi' },
        { status: 400 }
      )
    }

    // Hitung rata-rata
    const nilai = [nilaiMatematika, nilaiBahasaIndonesia, nilaiBahasaInggris, nilaiIpa, nilaiIps].filter(n => n != null)
    const rataRata = nilai.length > 0 ? nilai.reduce((a, b) => a + b, 0) / nilai.length : null

    const akademik = await prisma.akademik.upsert({
      where: { siswaId },
      update: {
        nilaiMatematika,
        nilaiBahasaIndonesia,
        nilaiBahasaInggris,
        nilaiIpa,
        nilaiIps,
        rataRata
      },
      create: {
        siswaId,
        nilaiMatematika,
        nilaiBahasaIndonesia,
        nilaiBahasaInggris,
        nilaiIpa,
        nilaiIps,
        rataRata
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Data akademik berhasil disimpan',
      data: akademik
    })

  } catch (error) {
    console.error('Error save akademik:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}