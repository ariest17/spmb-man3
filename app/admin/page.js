'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Tambahan baru
import * as XLSX from 'xlsx' // Tambahan baru untuk baca Excel
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
  DollarSign, FileSpreadsheet, Database
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
  const [listPetugas, setListPetugas] = useState([]) 
  const [selectedPetugas, setSelectedPetugas] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  // --- TAMBAHAN LOGIKA IMPORT GO AKSIO ---
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setImportFile(file)
  }

  const handleProcessImport = async () => {
    if (!importFile) {
      toast.error('Pilih file Excel terlebih dahulu')
      return
    }

    setImporting(true)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        // Mapping data Excel ke format database (sesuai route.js)
        const formattedData = jsonData.map(row => ({
          namaLengkap: row['Nama Lengkap'] || row['namaLengkap'] || row['Nama'],
          email: row['Email'] || row['email'],
          jenisKelamin: row['Jenis Kelamin'] || row['jenisKelamin'] || row['Gender'], // Harap isi L/P
          peminatan: row['Peminatan'] || row['peminatan']
        }))

        // Kirim ke Backend
        const res = await fetch('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: formattedData })
        })

        const result = await res.json()

        if (result.success) {
          toast.success(result.message)
          setImportFile(null)
          // Reset input file di HTML nanti
          document.getElementById('fileInputGoAksio').value = ''
          fetchStatistik() // Refresh data
          fetchSiswa()
        } else {
          toast.error(result.error || 'Gagal import data')
        }
      } catch (error) {
        console.error(error)
        toast.error('Gagal memproses file Excel')
      } finally {
        setImporting(false)
      }
    }

    reader.readAsBinaryString(importFile)
  }
  // --- AKHIR TAMBAHAN ---

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
    fetchMasterPetugas() // <--- Tambahan
  }, [filters])

  // --- FUNGSI AMBIL PETUGAS DARI MASTER DATA ---
  const fetchMasterPetugas = async () => {
    try {
      const res = await fetch('/api/admin/master/keuangan')
      const data = await res.json()
      if (data.petugas) setListPetugas(data.petugas)
    } catch (error) {
      console.error('Gagal load petugas')
    }
  }

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
    // Validasi Petugas Wajib Dipilih
    if (!selectedPetugas) {
      toast.error('Harap pilih Petugas Penerima!')
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
          keterangan: 'Pembayaran daftar ulang',
          petugas: selectedPetugas // <--- Kirim Data Petugas
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Pembayaran berhasil dicatat')
        // Refresh data
        const res2 = await fetch(`/api/pembayaran?siswaId=${selectedSiswa.id}`)
        const result2 = await res2.json()
        setPembayaranData(result2.data)
        setInputBayar('')
        fetchSiswa() 
        fetchStatistik() // Update statistik uang juga
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
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
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
            <Link href="/admin/master-data">
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-background/50 hover:text-accent-foreground ml-2 cursor-pointer border border-transparent hover:border-gray-200">
                <Database className="w-4 h-4 mr-2" /> Master Data
              </div>
            </Link>
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
                <CardTitle>Transaksi Pembayaran</CardTitle>
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

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b font-semibold text-gray-700">
                      <tr>
                        <th className="p-3 text-left">No. Reg</th>
                        <th className="p-3 text-left">Nama</th>
                        <th className="p-3 text-left">Gender</th>
                        <th className="p-3 text-left">Jalur</th>
                        <th className="p-3 text-left">Asal Sekolah</th>
                        <th className="p-3 text-right">Biaya Daftar Ulang</th>
                        <th className="p-3 text-right">Dibayar</th>
                        <th className="p-3 text-right">Kurang Bayar</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaList.filter(s => s.status === 'LULUS').map((siswa) => {
                        const bayarInfo = siswa.pembayaran?.[0] || {};
                        const tagihan = bayarInfo.totalTagihan || 0;
                        const dibayar = bayarInfo.jumlahBayar || 0;
                        const sisa = tagihan - dibayar;
                        const statusLunas = bayarInfo.status === 'LUNAS';

                        return (
                          <tr key={siswa.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono">{siswa.user?.nomorRegistrasi}</td>
                            <td className="p-3 font-medium">{siswa.namaLengkap}</td>
                            <td className="p-3">{siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}</td>
                            <td className="p-3"><Badge variant="outline" className="text-xs">{siswa.jalur}</Badge></td>
                            <td className="p-3 text-gray-600">{siswa.asalSekolah || '-'}</td>
                            <td className="p-3 text-right font-medium">{formatRupiah(tagihan)}</td>
                            <td className="p-3 text-right text-green-600">{formatRupiah(dibayar)}</td>
                            <td className="p-3 text-right text-red-600">{sisa > 0 ? formatRupiah(sisa) : '-'}</td>
                            <td className="p-3 text-center">
                              <Badge className={statusLunas ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                {statusLunas ? 'LUNAS' : 'BELUM'}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                   openPembayaranDialog(siswa);
                                   setSelectedPetugas(''); // Reset petugas saat buka baru
                                }}
                                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                              >
                                <DollarSign className="w-3 h-3 mr-1" /> Bayar
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
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
                    <Input 
                      id="fileInputGoAksio"
                      type="file" 
                      accept=".xlsx,.xls" 
                      className="max-w-xs mx-auto bg-white"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4"/> Panduan Kolom Excel:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                      <li><strong>Nama Lengkap</strong> (Contoh: Ahmad Dahlan)</li>
                      <li><strong>Email</strong> (Contoh: ahmad@gmail.com)</li>
                      <li><strong>Jenis Kelamin</strong> (Isi "L" atau "P")</li>
                      <li><strong>Peminatan</strong> (Isi "Umum" atau "Agama")</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2 ml-1">*Password akun otomatis menggunakan Nomor Registrasi yang digenerate.</p>
                  </div>

                  <Button 
                    className="gap-2 w-full sm:w-auto" 
                    onClick={handleProcessImport} 
                    disabled={importing || !importFile}
                  >
                    {importing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Memproses Data...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Proses Import Sekarang</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Pembayaran Dialog */}
      <Dialog open={showPembayaranDialog} onOpenChange={setShowPembayaranDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Input Pembayaran</DialogTitle>
            <DialogDescription>
              {selectedSiswa?.namaLengkap} ({selectedSiswa?.user?.nomorRegistrasi})
            </DialogDescription>
          </DialogHeader>
          
          {selectedSiswa && (
            <div className="space-y-4 py-2">
              {/* Ringkasan Tagihan */}
              <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Total Biaya:</div>
                <div className="font-bold text-right">{formatRupiah(pembayaranData?.totalTagihan || 0)}</div>
                <div className="text-gray-500">Sudah Bayar:</div>
                <div className="font-medium text-green-600 text-right">{formatRupiah(pembayaranData?.jumlahBayar || 0)}</div>
                <div className="text-gray-500 pt-2 border-t mt-2">Sisa Tagihan:</div>
                <div className="font-bold text-red-600 text-right pt-2 border-t mt-2">
                   {formatRupiah(pembayaranData?.sisaBayar ?? (pembayaranData?.totalTagihan || 0))}
                </div>
              </div>

              {/* Form Input (Hanya jika belum lunas) */}
              {pembayaranData?.status !== 'LUNAS' && (
                <>
                  <div className="space-y-2">
                    <Label>Jumlah Bayar (Rp)</Label>
                    <Input 
                      type="number" 
                      placeholder="Contoh: 500000"
                      value={inputBayar}
                      onChange={(e) => setInputBayar(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Petugas Penerima</Label>
                    <Select value={selectedPetugas} onValueChange={setSelectedPetugas}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Petugas..." />
                      </SelectTrigger>
                      <SelectContent>
                        {listPetugas.length === 0 ? (
                           <SelectItem value="Admin" disabled>Belum ada petugas (Isi Master Data dulu)</SelectItem>
                        ) : (
                           listPetugas.map((p) => (
                              <SelectItem key={p.id} value={p.nama}>{p.nama}</SelectItem>
                           ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Tabel Riwayat Transaksi */}
              <div className="space-y-2">
                <Label>Riwayat Transaksi</Label>
                <div className="border rounded-md overflow-hidden text-xs">
                   <table className="w-full">
                      <thead className="bg-gray-100">
                         <tr>
                            <th className="p-2 text-left">Tgl</th>
                            <th className="p-2 text-right">Nominal</th>
                            <th className="p-2 text-right">Petugas</th>
                         </tr>
                      </thead>
                      <tbody>
                         {pembayaranData?.riwayatBayar?.map((r, idx) => (
                            <tr key={idx} className="border-t">
                               <td className="p-2">{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                               <td className="p-2 text-right font-medium">{formatRupiah(r.jumlah)}</td>
                               <td className="p-2 text-right text-gray-500">{r.petugas || '-'}</td>
                            </tr>
                         ))}
                         {(!pembayaranData?.riwayatBayar || pembayaranData.riwayatBayar.length === 0) && (
                            <tr><td colSpan="3" className="p-2 text-center text-gray-400">Belum ada transaksi</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPembayaranDialog(false)}>
              Tutup
            </Button>
            {pembayaranData?.status !== 'LUNAS' && (
              <Button onClick={handleSavePembayaran} disabled={savingPayment} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
