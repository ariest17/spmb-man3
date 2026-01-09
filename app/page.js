'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, UserPlus, LogIn, CheckCircle, Calendar, FileText, Users } from 'lucide-react'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">SPMB MAN 3 Kediri</h1>
              <p className="text-sm text-gray-500">Sistem Penerimaan Murid Baru</p>
            </div>
          </div>
          <div className="flex gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="gap-2">
                    <LogIn className="w-4 h-4" /> Login
                  </Button>
                </Link>
                <Link href="/daftar">
                  <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <UserPlus className="w-4 h-4" /> Daftar Sekarang
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Pendaftaran Tahun Ajaran 2025/2026 Dibuka!
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Selamat Datang di Portal
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> SPMB MAN 3 Kediri</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Madrasah Aliyah Negeri 3 Kediri membuka pendaftaran peserta didik baru. 
            Bergabunglah bersama kami untuk meraih masa depan yang gemilang dengan landasan iman dan ilmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/daftar">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8">
                <UserPlus className="w-5 h-5" /> Daftar Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <LogIn className="w-5 h-5" /> Sudah Punya Akun?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">Jalur Pendaftaran</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Jalur Reguler</CardTitle>
              <CardDescription>Seleksi melalui tes CBT</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Tes Potensi Akademik</li>
                <li>• Tes Baca Al-Quran</li>
                <li>• Wawancara</li>
                <li>• Kuota: 240 Siswa</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <GraduationCap className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Jalur Prestasi</CardTitle>
              <CardDescription>Berdasarkan prestasi akademik/non-akademik</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Nilai rapor minimal 80</li>
                <li>• Sertifikat prestasi</li>
                <li>• Tanpa tes CBT</li>
                <li>• Kuota: 60 Siswa</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <CardTitle className="text-xl">Jalur Afirmasi</CardTitle>
              <CardDescription>Untuk keluarga kurang mampu</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• SKTM dari kelurahan</li>
                <li>• Kartu KIP/PKH/KKS</li>
                <li>• Tes wawancara</li>
                <li>• Kuota: 20 Siswa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 py-12 bg-white/50">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">Jadwal Pendaftaran</h3>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {[
              { date: '1 - 31 Januari 2026', event: 'Pendaftaran Online', status: 'active' },
              { date: '5 - 6 Februari 2026', event: 'Tes CBT (Jalur Reguler)', status: 'upcoming' },
              { date: '10 Februari 2026', event: 'Pengumuman Hasil Seleksi', status: 'upcoming' },
              { date: '11 - 15 Februari 2026', event: 'Daftar Ulang', status: 'upcoming' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.event}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                {item.status === 'active' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Sedang Berlangsung
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">MAN 3 Kediri</span>
          </div>
          <p className="text-gray-400 text-sm">Jl. Raya Kediri - Nganjuk KM. 5, Kediri, Jawa Timur</p>
          <p className="text-gray-400 text-sm mt-1">© 2025 SPMB MAN 3 Kediri. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}