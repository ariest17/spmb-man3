import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePasswordCBT } from '@/lib/utils'

// GET - Detail Siswa
export async function GET(request, { params }) {
  try {
    const { id } = params

    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            nomorRegistrasi: true,
            role: true
          }
        },
        orangTua: true,
        alamat: {
          include: { pesantren: true }
        },
        akademik: true,
        berkas: true,
        ruangUjian: true,
        pembayaran: {
          include: { riwayatBayar: true }
        }
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: siswa })

  } catch (error) {
    console.error('Error get siswa:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT - Update Data Siswa (Daftar Ulang)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const siswa = await prisma.siswa.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      message: 'Data siswa berhasil diupdate',
      data: siswa
    })

  } catch (error) {
    console.error('Error update siswa:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}