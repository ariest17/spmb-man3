import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List Pesantren
export async function GET() {
  try {
    const pesantren = await prisma.pesantren.findMany({
      orderBy: { nama: 'asc' }
    })

    return NextResponse.json({ data: pesantren })

  } catch (error) {
    console.error('Error get pesantren:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Tambah Pesantren (Admin)
export async function POST(request) {
  try {
    const body = await request.json()
    const { nama, alamat } = body

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama pesantren wajib diisi' },
        { status: 400 }
      )
    }

    const pesantren = await prisma.pesantren.create({
      data: { nama, alamat }
    })

    return NextResponse.json({
      success: true,
      message: 'Pesantren berhasil ditambahkan',
      data: pesantren
    }, { status: 201 })

  } catch (error) {
    console.error('Error create pesantren:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}