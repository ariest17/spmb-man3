'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, LogOut, User, Calendar, FileText, CreditCard, 
  Printer, CheckCircle, Clock, Lock, AlertCircle, Loader2 
} from 'lucide-react'
import KartuUjian from '@/components/dashboard/KartuUjian'
import FormDaftarUlang from '@/components/dashboard/FormDaftarUlang'
import JadwalUjian from '@/components/dashboard/JadwalUjian'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [siswaData, setSiswaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('beranda')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.siswaId) {
      fetchSiswaData()
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [session])

  const fetchSiswaData = async () => {
    try {
      const res = await fetch(`/api/siswa/${session.user.siswaId}`)
      const result = await res.json()
      if (result.data) {
        setSiswaData(result.data)
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  const isLulus = siswaData?.status === 'LULUS'
  const isSeleksi = siswaData?.status === 'SELEKSI'

  const getStatusBadge = () => {
    if (siswaData?.status === 'LULUS') {
      return <Badge className="bg-green-500 text-white">LULUS SELEKSI</Badge>
    } else if (siswaData?.status === 'TIDAK_LULUS') {
      return <Badge variant="destructive">TIDAK LULUS</Badge>
    }
    return <Badge variant="secondary">MASA SELEKSI</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Dashboard Siswa</h1>
              <p className="text-xs text-gray-500">SPMB MAN 3 Kediri</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{session?.user?.nama}</p>
              <p className="text-xs text-gray-500">{session?.user?.nomorRegistrasi}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{siswaData?.namaLengkap}</h2>
                  <p className="text-gray-500 text-sm">No. Reg: {siswaData?.user?.nomorRegistrasi}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{siswaData?.jalur}</Badge>
                    <Badge variant="outline">{siswaData?.peminatan}</Badge>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
              {isLulus && (
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Selamat! Anda dinyatakan LULUS</p>
                    <p className="text-xs text-green-600">Silakan lanjutkan ke daftar ulang</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="beranda" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </TabsTrigger>
            <TabsTrigger value="kartu" className="gap-2">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak Kartu</span>
            </TabsTrigger>
            <TabsTrigger value="jadwal" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Jadwal</span>
            </TabsTrigger>
            <TabsTrigger value="daftar-ulang" className="gap-2" disabled={!isLulus}>
              {isLulus ? <FileText className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="hidden sm:inline">Daftar Ulang</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Beranda */}
          <TabsContent value="beranda">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Data Pendaftaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Nama Lengkap</span>
                    <span className="font-medium">{siswaData?.namaLengkap}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{siswaData?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Jenis Kelamin</span>
                    <span className="font-medium">
                      {siswaData?.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Jalur</span>
                    <span className="font-medium">{siswaData?.jalur}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Peminatan</span>
                    <span className="font-medium">{siswaData?.peminatan}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Informasi Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSeleksi && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-800">Masa Seleksi</h3>
                          <p className="text-sm text-amber-700 mt-1">
                            Anda sedang dalam masa seleksi. Saat ini Anda hanya dapat:
                          </p>
                          <ul className="text-sm text-amber-700 mt-2 list-disc list-inside space-y-1">
                            <li>Melihat dan mencetak kartu ujian</li>
                            <li>Melihat jadwal ujian</li>
                          </ul>
                          <p className="text-sm text-amber-700 mt-2">
                            Form daftar ulang akan terbuka setelah pengumuman kelulusan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isLulus && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-800">Selamat! Anda Lulus Seleksi</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Silakan segera melakukan daftar ulang dengan mengisi formulir dan melakukan pembayaran.
                          </p>
                          <Button 
                            className="mt-3 bg-green-600 hover:bg-green-700" 
                            size="sm"
                            onClick={() => setActiveTab('daftar-ulang')}
                          >
                            Isi Formulir Daftar Ulang
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {siswaData?.status === 'TIDAK_LULUS' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-red-800">Tidak Lulus Seleksi</h3>
                          <p className="text-sm text-red-700 mt-1">
                            Mohon maaf, Anda tidak dinyatakan lulus dalam seleksi ini. 
                            Tetap semangat dan jangan menyerah!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Cetak Kartu */}
          <TabsContent value="kartu">
            <KartuUjian siswaData={siswaData} onUpdate={fetchSiswaData} />
          </TabsContent>

          {/* Tab: Jadwal */}
          <TabsContent value="jadwal">
            <JadwalUjian />
          </TabsContent>

          {/* Tab: Daftar Ulang */}
          <TabsContent value="daftar-ulang">
            {isLulus ? (
              <FormDaftarUlang siswaData={siswaData} onUpdate={fetchSiswaData} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">Formulir Terkunci</h3>
                  <p className="text-gray-500 mt-2">
                    Formulir daftar ulang hanya tersedia untuk siswa yang sudah dinyatakan LULUS seleksi.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}