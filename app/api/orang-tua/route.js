import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Simpan/Update Data Orang Tua
export async function POST(request) {
  try {
    const body = await request.json()
    const { siswaId, orangTuaData } = body

    if (!siswaId || !orangTuaData || !Array.isArray(orangTuaData)) {
      return NextResponse.json(
        { error: 'Data tidak valid' },
        { status: 400 }
      )
    }

    // Hapus data lama dan insert baru
    await prisma.orangTua.deleteMany({
      where: { siswaId }
    })

    const results = await prisma.orangTua.createMany({
      data: orangTuaData.map(ot => ({
        siswaId,
        tipe: ot.tipe,
        nama: ot.nama,
        status: ot.status || 'HIDUP',
        nik: ot.status === 'MENINGGAL' ? null : ot.nik,
        tempatLahir: ot.status === 'MENINGGAL' ? null : ot.tempatLahir,
        tanggalLahir: ot.status === 'MENINGGAL' ? null : (ot.tanggalLahir ? new Date(ot.tanggalLahir) : null),
        pendidikan: ot.status === 'MENINGGAL' ? null : ot.pendidikan,
        pekerjaan: ot.status === 'MENINGGAL' ? null : ot.pekerjaan,
        penghasilan: ot.status === 'MENINGGAL' ? null : ot.penghasilan,
        noHp: ot.status === 'MENINGGAL' ? null : ot.noHp
      }))
    })

    return NextResponse.json({
      success: true,
      message: 'Data orang tua berhasil disimpan',
      data: results
    })

  } catch (error) {
    console.error('Error save orang tua:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}