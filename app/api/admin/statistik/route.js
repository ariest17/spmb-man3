import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Statistik Dashboard Admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const jalur = searchParams.get('jalur')
    const peminatan = searchParams.get('peminatan')
    const jenisKelamin = searchParams.get('jenisKelamin')

    const where = {}
    if (jalur) where.jalur = jalur
    if (peminatan) where.peminatan = peminatan
    if (jenisKelamin) where.jenisKelamin = jenisKelamin

    // Total Pendaftar
    const totalPendaftar = await prisma.siswa.count({ where })

    // Per Status
    const statusSeleksi = await prisma.siswa.count({
      where: { ...where, status: 'SELEKSI' }
    })
    const statusLulus = await prisma.siswa.count({
      where: { ...where, status: 'LULUS' }
    })
    const statusTidakLulus = await prisma.siswa.count({
      where: { ...where, status: 'TIDAK_LULUS' }
    })

    // Per Jalur
    const perJalur = await prisma.siswa.groupBy({
      by: ['jalur'],
      where,
      _count: { id: true }
    })

    // Per Peminatan
    const perPeminatan = await prisma.siswa.groupBy({
      by: ['peminatan'],
      where,
      _count: { id: true }
    })

    // Per Jenis Kelamin
    const perGender = await prisma.siswa.groupBy({
      by: ['jenisKelamin'],
      where,
      _count: { id: true }
    })

    // Total Pembayaran
    const pembayaranLunas = await prisma.pembayaran.count({
      where: {
        status: 'LUNAS',
        siswa: where
      }
    })

    const pembayaranBelumLunas = await prisma.pembayaran.count({
      where: {
        status: 'BELUM_LUNAS',
        siswa: where
      }
    })

    return NextResponse.json({
      data: {
        total: totalPendaftar,
        perStatus: {
          seleksi: statusSeleksi,
          lulus: statusLulus,
          tidakLulus: statusTidakLulus
        },
        perJalur: perJalur.map(j => ({
          jalur: j.jalur,
          jumlah: j._count.id
        })),
        perPeminatan: perPeminatan.map(p => ({
          peminatan: p.peminatan,
          jumlah: p._count.id
        })),
        perGender: perGender.map(g => ({
          jenisKelamin: g.jenisKelamin,
          jumlah: g._count.id
        })),
        pembayaran: {
          lunas: pembayaranLunas,
          belumLunas: pembayaranBelumLunas
        }
      }
    })

  } catch (error) {
    console.error('Error get statistik:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}