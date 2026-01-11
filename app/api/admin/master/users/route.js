import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET: Ambil daftar user (kecuali Siswa)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "SISWA" // Ambil Admin, Superadmin, Bendahara, Verifikator
        }
      },
      select: {
        id: true,
        nomorRegistrasi: true, // Username
        nama: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat users" }, { status: 500 });
  }
}

// POST: Tambah / Edit / Hapus User
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // 1. Tambah User Baru
    if (action === "create") {
      // Cek username kembar
      const exist = await prisma.user.findUnique({
        where: { nomorRegistrasi: data.username }
      });
      if (exist) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 400 });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const newUser = await prisma.user.create({
        data: {
          nomorRegistrasi: data.username,
          password: hashedPassword,
          nama: data.nama,
          role: data.role
        }
      });
      return NextResponse.json(newUser);
    }

    // 2. Hapus User
    if (action === "delete") {
      await prisma.user.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }

    // 3. Reset Password (Opsional)
    if (action === "reset_password") {
        const hashedPassword = await bcrypt.hash("123456", 10); // Default reset
        await prisma.user.update({
            where: { id: data.id },
            data: { password: hashedPassword }
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}