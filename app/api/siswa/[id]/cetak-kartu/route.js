import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePasswordCBT } from '@/lib/utils'

// POST - Cetak Kartu & Auto Assign Ruangan (Jalur Reguler)
export async function POST(request, { params }) {
  try {
    const { id } = params

    // Get siswa
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: { ruangUjian: true }
    })

    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Jika sudah pernah cetak, return data yang ada
    if (siswa.kartuDicetak && siswa.ruangUjianId) {
      return NextResponse.json({
        success: true,
        message: 'Kartu sudah pernah dicetak',
        data: {
          ruangUjian: siswa.ruangUjian?.namaRuang,
          nomorKursi: siswa.nomorKursi,
          passwordCbt: siswa.passwordCbt
        }
      })
    }

    // Khusus Jalur Reguler - Auto assign ruangan
    if (siswa.jalur === 'REGULER') {
      // Cari ruang ujian yang belum penuh
      let ruangUjian = await prisma.ruangUjian.findFirst({
        where: {
          terisi: { lt: prisma.ruangUjian.fields.kapasitas }
        },
        orderBy: { namaRuang: 'asc' }
      })

      // Jika tidak ada ruangan, buat ruangan baru
      if (!ruangUjian) {
        const countRuang = await prisma.ruangUjian.count()
        ruangUjian = await prisma.ruangUjian.create({
          data: {
            namaRuang: `Ruang ${countRuang + 1}`,
            kapasitas: 30,
            terisi: 0
          }
        })
      }

      // Generate password CBT
      const passwordCbt = generatePasswordCBT()
      const nomorKursi = ruangUjian.terisi + 1

      // Update siswa dan ruang ujian dalam transaksi
      await prisma.$transaction([
        prisma.siswa.update({
          where: { id },
          data: {
            ruangUjianId: ruangUjian.id,
            nomorKursi,
            passwordCbt,
            kartuDicetak: true
          }
        }),
        prisma.ruangUjian.update({
          where: { id: ruangUjian.id },
          data: {
            terisi: { increment: 1 }
          }
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Kartu berhasil dicetak',
        data: {
          ruangUjian: ruangUjian.namaRuang,
          nomorKursi,
          passwordCbt
        }
      })
    }

    // Non-Reguler (Prestasi/Afirmasi) - hanya tandai sudah cetak
    await prisma.siswa.update({
      where: { id },
      data: { kartuDicetak: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Kartu berhasil dicetak',
      data: {
        ruangUjian: null,
        nomorKursi: null,
        passwordCbt: null
      }
    })

  } catch (error) {
    console.error('Error cetak kartu:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error.message },
      { status: 500 }
    )
  }
}