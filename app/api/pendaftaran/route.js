import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { generateNomorRegistrasi } from '@/lib/utils'

// POST - Pendaftaran Baru
export async function POST(request) {
  try {
    const body = await request.json()
    const { namaLengkap, email, jenisKelamin, jalur, peminatan, password } = body

    // Validasi input
    if (!namaLengkap || !email || !jenisKelamin || !jalur || !peminatan || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Cek email sudah terdaftar
    const existingEmail = await prisma.siswa.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Generate Nomor Registrasi
    const tahun = new Date().getFullYear()
    const tahunStr = tahun.toString().slice(-2)
    
    const prefixMap = {
      'REGULER': 'RG',
      'PRESTASI': 'PR',
      'AFIRMASI': 'AF',
      'GO_AKSIO': 'GA'
    }
    const prefix = prefixMap[jalur] || 'RG'

    // Upsert counter dan dapatkan nilai baru
    const counter = await prisma.counter.upsert({
      where: {
        prefix_tahun: {
          prefix: prefix,
          tahun: tahunStr
        }
      },
      update: {
        counter: { increment: 1 }
      },
      create: {
        prefix: prefix,
        tahun: tahunStr,
        counter: 1
      }
    })

    const nomorRegistrasi = generateNomorRegistrasi(jalur, tahun, counter.counter)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create User dan Siswa dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          nomorRegistrasi,
          password: hashedPassword,
          role: 'SISWA'
        }
      })

      // Create Siswa
      const siswa = await tx.siswa.create({
        data: {
          userId: user.id,
          namaLengkap,
          email,
          jenisKelamin,
          jalur,
          peminatan,
          status: 'SELEKSI'
        }
      })

      return { user, siswa }
    })

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: {
        nomorRegistrasi,
        namaLengkap,
        email,
        jalur,
        peminatan
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error pendaftaran:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error.message },
      { status: 500 }
    )
  }
}

// GET - List Pendaftar (untuk Admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const jalur = searchParams.get('jalur')
    const status = searchParams.get('status')
    const jenisKelamin = searchParams.get('jenisKelamin')
    const search = searchParams.get('search')

    const where = {}

    if (jalur) where.jalur = jalur
    if (status) where.status = status
    if (jenisKelamin) where.jenisKelamin = jenisKelamin
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { user: { nomorRegistrasi: { contains: search } } }
      ]
    }

    const siswa = await prisma.siswa.findMany({
      where,
      include: {
        user: {
          select: {
            nomorRegistrasi: true
          }
        },
        pembayaran: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data: siswa })

  } catch (error) {
    console.error('Error get pendaftar:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}