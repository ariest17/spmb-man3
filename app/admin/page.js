'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  GraduationCap, LogOut, Users, CreditCard, BarChart3, Upload, 
  Search, Loader2, CheckCircle, XCircle, TrendingUp, UserCheck,
  DollarSign, FileSpreadsheet
} from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('statistik')
  const [loading, setLoading] = useState(true)
  const [statistik, setStatistik] = useState(null)
  const [siswaList, setSiswaList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    jalur: '',
    peminatan: '',
    jenisKelamin: ''
  })

  // Pembayaran Dialog State
  const [showPembayaranDialog, setShowPembayaranDialog] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [pembayaranData, setPembayaranData] = useState(null)
  const [inputBayar, setInputBayar] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      // Allow access for demo - in production, redirect non-admins
      // router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    fetchStatistik()
    fetchSiswa()
  }, [filters])

  const fetchStatistik = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.jalur) params.append('jalur', filters.jalur)
      if (filters.peminatan) params.append('peminatan', filters.peminatan)
      if (filters.jenisKelamin) params.append('jenisKelamin', filters.jenisKelamin)

      const res = await fetch(`/api/admin/statistik?${params}`)
      const result = await res.json()
      if (result.data) {
        setStatistik(result.data)
      }
    } catch (error) {
      console.error('Error fetching statistik:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSiswa = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.jalur) params.append('jalur', filters.jalur)
      if (filters.peminatan) params.append('peminatan', filters.peminatan)
      if (filters.jenisKelamin) params.append('jenisKelamin', filters.jenisKelamin)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/pendaftaran?${params}`)
      const result = await res.json()
      if (result.data) {
        setSiswaList(result.data)
      }
    } catch (error) {
      console.error('Error fetching siswa:', error)
    }
  }

  const handleSearch = () => {
    fetchSiswa()
  }

  const handleUpdateStatus = async (siswaId, newStatus) => {
    try {
      const res = await fetch(`/api/siswa/${siswaId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await res.json()
      if (result.success) {
        toast.success(`Status berhasil diubah menjadi ${newStatus}`)
        fetchSiswa()
        fetchStatistik()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal mengubah status')
    }
  }

  const openPembayaranDialog = async (siswa) => {
    setSelectedSiswa(siswa)
    setShowPembayaranDialog(true)
    setInputBayar('')

    // Fetch pembayaran data
    try {
      const res = await fetch(`/api/pembayaran?siswaId=${siswa.id}`)
      const result = await res.json()
      setPembayaranData(result.data)
    } catch (error) {
      console.error('Error fetching pembayaran:', error)
    }
  }

  const handleSavePembayaran = async () => {
    if (!inputBayar || parseInt(inputBayar) <= 0) {
      toast.error('Masukkan jumlah pembayaran yang valid')
      return
    }

    setSavingPayment(true)
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          jumlahBayar: parseInt(inputBayar),
          keterangan: 'Pembayaran daftar ulang'
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Pembayaran berhasil dicatat')
        setPembayaranData(result.data)
        setInputBayar('')
        fetchSiswa()
        // Refresh pembayaran data
        const res2 = await fetch(`/api/pembayaran?siswaId=${selectedSiswa.id}`)
        const result2 = await res2.json()
        setPembayaranData(result2.data)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan pembayaran')
    } finally {
      setSavingPayment(false)
    }
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka)
  }

  const getTagihanByGender = (jenisKelamin) => {
    return jenisKelamin === 'LAKI_LAKI' ? 1000000 : 1200000
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    )
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
              <h1 className="font-bold text-lg text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">SPMB MAN 3 Kediri</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Jalur</Label>
                <Select value={filters.jalur} onValueChange={(v) => setFilters(prev => ({ ...prev, jalur: v }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Semua Jalur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jalur</SelectItem>
                    <SelectItem value="REGULER">Reguler</SelectItem>
                    <SelectItem value="PRESTASI">Prestasi</SelectItem>
                    <SelectItem value="AFIRMASI">Afirmasi</SelectItem>
                    <SelectItem value="GO_AKSIO">Go Aksio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Peminatan</Label>
                <Select value={filters.peminatan} onValueChange={(v) => setFilters(prev => ({ ...prev, peminatan: v }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="UMUM">Umum</SelectItem>
                    <SelectItem value="AGAMA">Agama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Gender</Label>
                <Select value={filters.jenisKelamin} onValueChange={(v) => setFilters(prev => ({ ...prev, jenisKelamin: v }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setFilters({ jalur: '', peminatan: '', jenisKelamin: '' }); fetchStatistik(); fetchSiswa(); }} variant="outline" size="sm">
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="statistik" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Statistik
            </TabsTrigger>
            <TabsTrigger value="siswa" className="gap-2">
              <Users className="w-4 h-4" /> Data Siswa
            </TabsTrigger>
            <TabsTrigger value="pembayaran" className="gap-2">
              <CreditCard className="w-4 h-4" /> Pembayaran
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" /> Import
            </TabsTrigger>
          </TabsList>

          {/* Tab Statistik */}
          <TabsContent value="statistik">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Pendaftar</p>
                      <p className="text-2xl font-bold">{statistik?.total || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Masa Seleksi</p>
                      <p className="text-2xl font-bold">{statistik?.perStatus?.seleksi || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lulus</p>
                      <p className="text-2xl font-bold text-green-600">{statistik?.perStatus?.lulus || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pembayaran Lunas</p>
                      <p className="text-2xl font-bold text-emerald-600">{statistik?.pembayaran?.lunas || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Per Jalur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistik?.perJalur?.map((item) => (
                      <div key={item.jalur} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.jalur}</span>
                        <Badge variant="secondary">{item.jumlah}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Per Peminatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistik?.perPeminatan?.map((item) => (
                      <div key={item.peminatan} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.peminatan}</span>
                        <Badge variant="secondary">{item.jumlah}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Per Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistik?.perGender?.map((item) => (
                      <div key={item.jenisKelamin} className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {item.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                        <Badge variant="secondary">{item.jumlah}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Data Siswa */}
          <TabsContent value="siswa">
            <Card>
              <CardHeader>
                <CardTitle>Data Pendaftar</CardTitle>
                <CardDescription>Kelola data dan status pendaftar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Cari nama atau nomor registrasi..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleSearch} className="gap-2">
                    <Search className="w-4 h-4" /> Cari
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">No. Reg</th>
                        <th className="text-left p-3">Nama</th>
                        <th className="text-left p-3">Jalur</th>
                        <th className="text-left p-3">Gender</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaList.map((siswa) => (
                        <tr key={siswa.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono">{siswa.user?.nomorRegistrasi}</td>
                          <td className="p-3">{siswa.namaLengkap}</td>
                          <td className="p-3">
                            <Badge variant="outline">{siswa.jalur}</Badge>
                          </td>
                          <td className="p-3">
                            {siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}
                          </td>
                          <td className="p-3">
                            <Badge className={
                              siswa.status === 'LULUS' ? 'bg-green-500' :
                              siswa.status === 'TIDAK_LULUS' ? 'bg-red-500' : 'bg-amber-500'
                            }>
                              {siswa.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {siswa.status === 'SELEKSI' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => handleUpdateStatus(siswa.id, 'LULUS')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleUpdateStatus(siswa.id, 'TIDAK_LULUS')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {siswa.status === 'LULUS' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openPembayaranDialog(siswa)}
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Pembayaran */}
          <TabsContent value="pembayaran">
            <Card>
              <CardHeader>
                <CardTitle>Modul Pembayaran</CardTitle>
                <CardDescription>Kelola pembayaran daftar ulang siswa yang sudah lulus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Cari siswa yang lulus..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleSearch} className="gap-2">
                    <Search className="w-4 h-4" /> Cari
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">No. Reg</th>
                        <th className="text-left p-3">Nama</th>
                        <th className="text-left p-3">Gender</th>
                        <th className="text-left p-3">Tagihan</th>
                        <th className="text-left p-3">Dibayar</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaList.filter(s => s.status === 'LULUS').map((siswa) => (
                        <tr key={siswa.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono">{siswa.user?.nomorRegistrasi}</td>
                          <td className="p-3">{siswa.namaLengkap}</td>
                          <td className="p-3">
                            {siswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                          </td>
                          <td className="p-3">{formatRupiah(getTagihanByGender(siswa.jenisKelamin))}</td>
                          <td className="p-3">
                            {formatRupiah(siswa.pembayaran?.[0]?.jumlahBayar || 0)}
                          </td>
                          <td className="p-3">
                            <Badge className={
                              siswa.pembayaran?.[0]?.status === 'LUNAS' ? 'bg-green-500' : 'bg-amber-500'
                            }>
                              {siswa.pembayaran?.[0]?.status || 'BELUM BAYAR'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              onClick={() => openPembayaranDialog(siswa)}
                            >
                              Input Bayar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Import */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  Import Data Go Aksio
                </CardTitle>
                <CardDescription>
                  Import data siswa jalur Go Aksio dari file Excel. Akun akan otomatis dibuat dengan status LULUS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Upload File Excel</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Format: .xlsx dengan kolom: Nama Lengkap, Email, Jenis Kelamin (L/P), Peminatan (Umum/Agama)
                    </p>
                    <Input type="file" accept=".xlsx,.xls" className="max-w-xs mx-auto" />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Panduan Import:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>1. Siapkan file Excel dengan format kolom yang sesuai</li>
                      <li>2. Kolom wajib: Nama Lengkap, Email, Jenis Kelamin, Peminatan</li>
                      <li>3. Password default = Nomor Registrasi yang digenerate</li>
                      <li>4. Status akan otomatis diset ke LULUS</li>
                    </ul>
                  </div>

                  <Button className="gap-2">
                    <Upload className="w-4 h-4" /> Proses Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Pembayaran Dialog */}
      <Dialog open={showPembayaranDialog} onOpenChange={setShowPembayaranDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Pembayaran</DialogTitle>
            <DialogDescription>
              {selectedSiswa?.namaLengkap} ({selectedSiswa?.user?.nomorRegistrasi})
            </DialogDescription>
          </DialogHeader>
          
          {selectedSiswa && (
            <div className="space-y-4">
              {/* Info Tagihan */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jenis Kelamin</span>
                  <span className="font-medium">
                    {selectedSiswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tagihan</span>
                  <span className="font-bold text-lg">
                    {formatRupiah(getTagihanByGender(selectedSiswa.jenisKelamin))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sudah Dibayar</span>
                  <span className="font-medium text-green-600">
                    {formatRupiah(pembayaranData?.jumlahBayar || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-500">Sisa Tagihan</span>
                  <span className="font-bold text-red-600">
                    {formatRupiah(pembayaranData?.sisaBayar || getTagihanByGender(selectedSiswa.jenisKelamin))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge className={
                    pembayaranData?.status === 'LUNAS' ? 'bg-green-500' : 'bg-amber-500'
                  }>
                    {pembayaranData?.status || 'BELUM LUNAS'}
                  </Badge>
                </div>
              </div>

              {/* Input Pembayaran */}
              {pembayaranData?.status !== 'LUNAS' && (
                <div className="space-y-2">
                  <Label>Jumlah Pembayaran</Label>
                  <Input 
                    type="number"
                    value={inputBayar}
                    onChange={(e) => setInputBayar(e.target.value)}
                    placeholder="Masukkan jumlah pembayaran"
                  />
                </div>
              )}

              {/* Riwayat Pembayaran */}
              {pembayaranData?.riwayatBayar?.length > 0 && (
                <div className="space-y-2">
                  <Label>Riwayat Pembayaran</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {pembayaranData.riwayatBayar.map((riwayat, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>{new Date(riwayat.tanggal).toLocaleDateString('id-ID')}</span>
                        <span className="font-medium text-green-600">{formatRupiah(riwayat.jumlah)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPembayaranDialog(false)}>
              Tutup
            </Button>
            {pembayaranData?.status !== 'LUNAS' && (
              <Button onClick={handleSavePembayaran} disabled={savingPayment} className="gap-2">
                {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Simpan Pembayaran
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}