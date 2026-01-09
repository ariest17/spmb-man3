import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { generateNomorRegistrasi, getTagihanByGender } from '@/lib/utils'

// POST - Import Excel Go Aksio
export async function POST(request) {
  try {
    const body = await request.json()
    const { data } = body // Array of siswa data from Excel

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const tahun = new Date().getFullYear()
    const tahunStr = tahun.toString().slice(-2)
    const prefix = 'GA' // Go Aksio

    const results = []
    const errors = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const { namaLengkap, email, jenisKelamin, peminatan } = row

      try {
        // Validasi
        if (!namaLengkap || !email || !jenisKelamin || !peminatan) {
          errors.push({ row: i + 1, error: 'Data tidak lengkap' })
          continue
        }

        // Cek email sudah ada
        const existingEmail = await prisma.siswa.findUnique({
          where: { email }
        })

        if (existingEmail) {
          errors.push({ row: i + 1, error: `Email ${email} sudah terdaftar` })
          continue
        }

        // Get counter
        const counter = await prisma.counter.upsert({
          where: {
            prefix_tahun: { prefix, tahun: tahunStr }
          },
          update: {
            counter: { increment: 1 }
          },
          create: {
            prefix,
            tahun: tahunStr,
            counter: 1
          }
        })

        const nomorRegistrasi = generateNomorRegistrasi('GO_AKSIO', tahun, counter.counter)
        
        // Generate default password (nomor registrasi)
        const hashedPassword = await bcrypt.hash(nomorRegistrasi, 10)

        // Create User dan Siswa
        const result = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              nomorRegistrasi,
              password: hashedPassword,
              role: 'SISWA'
            }
          })

          const siswa = await tx.siswa.create({
            data: {
              userId: user.id,
              namaLengkap,
              email,
              jenisKelamin: jenisKelamin === 'L' || jenisKelamin === 'Laki-laki' ? 'LAKI_LAKI' : 'PEREMPUAN',
              jalur: 'GO_AKSIO',
              peminatan: peminatan === 'Umum' ? 'UMUM' : 'AGAMA',
              status: 'LULUS' // Auto set LULUS
            }
          })

          // Create pembayaran
          const totalTagihan = getTagihanByGender(siswa.jenisKelamin)
          await tx.pembayaran.create({
            data: {
              siswaId: siswa.id,
              totalTagihan,
              jumlahBayar: 0,
              sisaBayar: totalTagihan,
              status: 'BELUM_LUNAS'
            }
          })

          return { nomorRegistrasi, namaLengkap, email }
        })

        results.push(result)

      } catch (err) {
        errors.push({ row: i + 1, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai. Berhasil: ${results.length}, Gagal: ${errors.length}`,
      data: {
        imported: results,
        errors
      }
    })

  } catch (error) {
    console.error('Error import:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}