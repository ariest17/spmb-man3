import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTagihanByGender } from '@/lib/utils'

// PUT - Update Status Siswa (Admin)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!['SELEKSI', 'LULUS', 'TIDAK_LULUS'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    const siswa = await prisma.siswa.update({
      where: { id },
      data: { status }
    })

    // Jika status LULUS, buat record pembayaran
    if (status === 'LULUS') {
      const existingPembayaran = await prisma.pembayaran.findFirst({
        where: { siswaId: id }
      })

      if (!existingPembayaran) {
        const totalTagihan = getTagihanByGender(siswa.jenisKelamin)
        await prisma.pembayaran.create({
          data: {
            siswaId: id,
            totalTagihan,
            jumlahBayar: 0,
            sisaBayar: totalTagihan,
            status: 'BELUM_LUNAS'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status berhasil diubah menjadi ${status}`,
      data: siswa
    })

  } catch (error) {
    console.error('Error update status:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}