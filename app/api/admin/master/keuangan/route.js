import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.pengaturan.upsert({
      where: { id: "default-config" },
      create: { id: "default-config", biayaLaki: 1000000, biayaPerempuan: 1200000 },
      update: {},
    });
    
    // UPDATE: Hanya kembalikan settings, jangan panggil prisma.petugas lagi
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === "update_biaya") {
      const updated = await prisma.pengaturan.update({
        where: { id: "default-config" },
        data: { biayaLaki: parseInt(data.biayaLaki), biayaPerempuan: parseInt(data.biayaPerempuan) },
      });
      return NextResponse.json(updated);
    }

    if (action === "tambah_petugas") {
      const newPetugas = await prisma.petugas.create({ data: { nama: data.nama } });
      return NextResponse.json(newPetugas);
    }

    if (action === "hapus_petugas") {
      await prisma.petugas.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Aksi salah" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
