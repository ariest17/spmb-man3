'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, Users, MapPin, GraduationCap, FileUp, Save, Loader2, CheckCircle 
} from 'lucide-react'

export default function FormDaftarUlang({ siswaData, onUpdate }) {
  const [activeTab, setActiveTab] = useState('siswa')
  const [loading, setLoading] = useState(false)
  const [pesantrenList, setPesantrenList] = useState([])

  // Form States
  const [dataSiswa, setDataSiswa] = useState({
    tempatLahir: siswaData?.tempatLahir || '',
    tanggalLahir: siswaData?.tanggalLahir?.split('T')[0] || '',
    nik: siswaData?.nik || '',
    nisn: siswaData?.nisn || '',
    noHp: siswaData?.noHp || '',
    asalSekolah: siswaData?.asalSekolah || '',
    tahunLulus: siswaData?.tahunLulus || '2025'
  })

  const [dataOrangTua, setDataOrangTua] = useState([
    { tipe: 'AYAH', nama: '', status: 'HIDUP', nik: '', tempatLahir: '', tanggalLahir: '', pendidikan: '', pekerjaan: '', penghasilan: '', noHp: '' },
    { tipe: 'IBU', nama: '', status: 'HIDUP', nik: '', tempatLahir: '', tanggalLahir: '', pendidikan: '', pekerjaan: '', penghasilan: '', noHp: '' },
    { tipe: 'WALI', nama: '', status: 'HIDUP', nik: '', tempatLahir: '', tanggalLahir: '', pendidikan: '', pekerjaan: '', penghasilan: '', noHp: '' }
  ])

  const [dataAlamat, setDataAlamat] = useState({
    tipeAlamat: siswaData?.alamat?.tipeAlamat || 'RUMAH',
    alamatLengkap: siswaData?.alamat?.alamatLengkap || '',
    rt: siswaData?.alamat?.rt || '',
    rw: siswaData?.alamat?.rw || '',
    desa: siswaData?.alamat?.desa || '',
    kecamatan: siswaData?.alamat?.kecamatan || '',
    kabupaten: siswaData?.alamat?.kabupaten || '',
    provinsi: siswaData?.alamat?.provinsi || 'Jawa Timur',
    kodePos: siswaData?.alamat?.kodePos || '',
    pesantrenId: siswaData?.alamat?.pesantrenId || ''
  })

  const [dataAkademik, setDataAkademik] = useState({
    nilaiMatematika: siswaData?.akademik?.nilaiMatematika || '',
    nilaiBahasaIndonesia: siswaData?.akademik?.nilaiBahasaIndonesia || '',
    nilaiBahasaInggris: siswaData?.akademik?.nilaiBahasaInggris || '',
    nilaiIpa: siswaData?.akademik?.nilaiIpa || '',
    nilaiIps: siswaData?.akademik?.nilaiIps || ''
  })

  useEffect(() => {
    fetchPesantren()
    if (siswaData?.orangTua?.length > 0) {
      const mappedOrangTua = ['AYAH', 'IBU', 'WALI'].map(tipe => {
        const existing = siswaData.orangTua.find(ot => ot.tipe === tipe)
        return existing || { tipe, nama: '', status: 'HIDUP', nik: '', tempatLahir: '', tanggalLahir: '', pendidikan: '', pekerjaan: '', penghasilan: '', noHp: '' }
      })
      setDataOrangTua(mappedOrangTua)
    }
  }, [siswaData])

  const fetchPesantren = async () => {
    try {
      const res = await fetch('/api/master/pesantren')
      const result = await res.json()
      if (result.data) {
        setPesantrenList(result.data)
      }
    } catch (error) {
      console.error('Error fetching pesantren:', error)
    }
  }

  const handleSaveSiswa = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/siswa/${siswaData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataSiswa,
          tanggalLahir: dataSiswa.tanggalLahir ? new Date(dataSiswa.tanggalLahir) : null
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Data siswa berhasil disimpan')
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOrangTua = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orang-tua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswaData.id,
          orangTuaData: dataOrangTua.filter(ot => ot.nama) // Hanya yang ada namanya
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Data orang tua berhasil disimpan')
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAlamat = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alamat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswaData.id,
          ...dataAlamat
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Data alamat berhasil disimpan')
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAkademik = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/akademik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswaData.id,
          nilaiMatematika: dataAkademik.nilaiMatematika ? parseFloat(dataAkademik.nilaiMatematika) : null,
          nilaiBahasaIndonesia: dataAkademik.nilaiBahasaIndonesia ? parseFloat(dataAkademik.nilaiBahasaIndonesia) : null,
          nilaiBahasaInggris: dataAkademik.nilaiBahasaInggris ? parseFloat(dataAkademik.nilaiBahasaInggris) : null,
          nilaiIpa: dataAkademik.nilaiIpa ? parseFloat(dataAkademik.nilaiIpa) : null,
          nilaiIps: dataAkademik.nilaiIps ? parseFloat(dataAkademik.nilaiIps) : null
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Data akademik berhasil disimpan')
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const updateOrangTua = (index, field, value) => {
    setDataOrangTua(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const pendidikanOptions = ['SD/MI', 'SMP/MTs', 'SMA/MA', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3']
  const penghasilanOptions = ['< Rp 1.000.000', 'Rp 1.000.000 - Rp 3.000.000', 'Rp 3.000.000 - Rp 5.000.000', 'Rp 5.000.000 - Rp 10.000.000', '> Rp 10.000.000']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-green-600" />
          Formulir Daftar Ulang
        </CardTitle>
        <CardDescription>
          Lengkapi data berikut untuk menyelesaikan proses daftar ulang
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="siswa" className="gap-1 text-xs sm:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Siswa</span>
            </TabsTrigger>
            <TabsTrigger value="ortu" className="gap-1 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Orang Tua</span>
            </TabsTrigger>
            <TabsTrigger value="alamat" className="gap-1 text-xs sm:text-sm">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Alamat</span>
            </TabsTrigger>
            <TabsTrigger value="akademik" className="gap-1 text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Akademik</span>
            </TabsTrigger>
            <TabsTrigger value="berkas" className="gap-1 text-xs sm:text-sm">
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Berkas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Data Siswa */}
          <TabsContent value="siswa" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={siswaData?.namaLengkap} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={siswaData?.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Tempat Lahir</Label>
                <Input 
                  value={dataSiswa.tempatLahir}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, tempatLahir: e.target.value }))}
                  placeholder="Contoh: Kediri"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input 
                  type="date"
                  value={dataSiswa.tanggalLahir}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>NIK (16 digit)</Label>
                <Input 
                  value={dataSiswa.nik}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, nik: e.target.value.slice(0, 16) }))}
                  placeholder="Nomor Induk Kependudukan"
                  maxLength={16}
                />
              </div>
              <div className="space-y-2">
                <Label>NISN (10 digit)</Label>
                <Input 
                  value={dataSiswa.nisn}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, nisn: e.target.value.slice(0, 10) }))}
                  placeholder="Nomor Induk Siswa Nasional"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label>No. HP/WhatsApp</Label>
                <Input 
                  value={dataSiswa.noHp}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, noHp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>Asal Sekolah</Label>
                <Input 
                  value={dataSiswa.asalSekolah}
                  onChange={(e) => setDataSiswa(prev => ({ ...prev, asalSekolah: e.target.value }))}
                  placeholder="Nama SMP/MTs asal"
                />
              </div>
              <div className="space-y-2">
                <Label>Tahun Lulus</Label>
                <Select 
                  value={dataSiswa.tahunLulus} 
                  onValueChange={(value) => setDataSiswa(prev => ({ ...prev, tahunLulus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSiswa} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Data Siswa
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Data Orang Tua */}
          <TabsContent value="ortu" className="space-y-6 mt-6">
            {dataOrangTua.map((ortu, index) => (
              <div key={ortu.tipe} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Data {ortu.tipe === 'AYAH' ? 'Ayah' : ortu.tipe === 'IBU' ? 'Ibu' : 'Wali'}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      value={ortu.nama}
                      onChange={(e) => updateOrangTua(index, 'nama', e.target.value)}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={ortu.status}
                      onValueChange={(value) => updateOrangTua(index, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIDUP">Hidup</SelectItem>
                        <SelectItem value="MENINGGAL">Meninggal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>NIK</Label>
                    <Input 
                      value={ortu.nik}
                      onChange={(e) => updateOrangTua(index, 'nik', e.target.value.slice(0, 16))}
                      placeholder="NIK"
                      disabled={ortu.status === 'MENINGGAL'}
                      maxLength={16}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pendidikan</Label>
                    <Select 
                      value={ortu.pendidikan}
                      onValueChange={(value) => updateOrangTua(index, 'pendidikan', value)}
                      disabled={ortu.status === 'MENINGGAL'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendidikanOptions.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pekerjaan</Label>
                    <Input 
                      value={ortu.pekerjaan}
                      onChange={(e) => updateOrangTua(index, 'pekerjaan', e.target.value)}
                      placeholder="Pekerjaan"
                      disabled={ortu.status === 'MENINGGAL'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penghasilan</Label>
                    <Select 
                      value={ortu.penghasilan}
                      onValueChange={(value) => updateOrangTua(index, 'penghasilan', value)}
                      disabled={ortu.status === 'MENINGGAL'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {penghasilanOptions.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>No. HP</Label>
                    <Input 
                      value={ortu.noHp}
                      onChange={(e) => updateOrangTua(index, 'noHp', e.target.value)}
                      placeholder="No. HP"
                      disabled={ortu.status === 'MENINGGAL'}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={handleSaveOrangTua} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Data Orang Tua
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Alamat */}
          <TabsContent value="alamat" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Tipe Tempat Tinggal</Label>
              <Select 
                value={dataAlamat.tipeAlamat}
                onValueChange={(value) => setDataAlamat(prev => ({ ...prev, tipeAlamat: value }))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUMAH">Rumah</SelectItem>
                  <SelectItem value="PONDOK">Pondok Pesantren</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dataAlamat.tipeAlamat === 'PONDOK' && (
              <div className="space-y-2">
                <Label>Nama Pesantren</Label>
                <Select 
                  value={dataAlamat.pesantrenId}
                  onValueChange={(value) => setDataAlamat(prev => ({ ...prev, pesantrenId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pesantren" />
                  </SelectTrigger>
                  <SelectContent>
                    {pesantrenList.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Textarea 
                value={dataAlamat.alamatLengkap}
                onChange={(e) => setDataAlamat(prev => ({ ...prev, alamatLengkap: e.target.value }))}
                placeholder="Nama jalan, nomor rumah, dll"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>RT</Label>
                <Input 
                  value={dataAlamat.rt}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, rt: e.target.value.slice(0, 3) }))}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>RW</Label>
                <Input 
                  value={dataAlamat.rw}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, rw: e.target.value.slice(0, 3) }))}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Kode Pos</Label>
                <Input 
                  value={dataAlamat.kodePos}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, kodePos: e.target.value.slice(0, 5) }))}
                  placeholder="64101"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desa/Kelurahan</Label>
                <Input 
                  value={dataAlamat.desa}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, desa: e.target.value }))}
                  placeholder="Nama desa"
                />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <Input 
                  value={dataAlamat.kecamatan}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, kecamatan: e.target.value }))}
                  placeholder="Nama kecamatan"
                />
              </div>
              <div className="space-y-2">
                <Label>Kabupaten/Kota</Label>
                <Input 
                  value={dataAlamat.kabupaten}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, kabupaten: e.target.value }))}
                  placeholder="Nama kabupaten"
                />
              </div>
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <Input 
                  value={dataAlamat.provinsi}
                  onChange={(e) => setDataAlamat(prev => ({ ...prev, provinsi: e.target.value }))}
                  placeholder="Nama provinsi"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveAlamat} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Data Alamat
              </Button>
            </div>
          </TabsContent>

          {/* Tab 4: Akademik */}
          <TabsContent value="akademik" className="space-y-4 mt-6">
            <p className="text-sm text-gray-500 mb-4">Masukkan nilai rata-rata rapor semester 1-5</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Matematika</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dataAkademik.nilaiMatematika}
                  onChange={(e) => setDataAkademik(prev => ({ ...prev, nilaiMatematika: e.target.value }))}
                  placeholder="0 - 100"
                />
              </div>
              <div className="space-y-2">
                <Label>Bahasa Indonesia</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dataAkademik.nilaiBahasaIndonesia}
                  onChange={(e) => setDataAkademik(prev => ({ ...prev, nilaiBahasaIndonesia: e.target.value }))}
                  placeholder="0 - 100"
                />
              </div>
              <div className="space-y-2">
                <Label>Bahasa Inggris</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dataAkademik.nilaiBahasaInggris}
                  onChange={(e) => setDataAkademik(prev => ({ ...prev, nilaiBahasaInggris: e.target.value }))}
                  placeholder="0 - 100"
                />
              </div>
              <div className="space-y-2">
                <Label>IPA</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dataAkademik.nilaiIpa}
                  onChange={(e) => setDataAkademik(prev => ({ ...prev, nilaiIpa: e.target.value }))}
                  placeholder="0 - 100"
                />
              </div>
              <div className="space-y-2">
                <Label>IPS</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dataAkademik.nilaiIps}
                  onChange={(e) => setDataAkademik(prev => ({ ...prev, nilaiIps: e.target.value }))}
                  placeholder="0 - 100"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveAkademik} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Data Akademik
              </Button>
            </div>
          </TabsContent>

          {/* Tab 5: Upload Berkas */}
          <TabsContent value="berkas" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Kartu Keluarga (KK)</h4>
                <p className="text-sm text-gray-500 mb-3">Format: JPG, PNG, PDF (Max 2MB)</p>
                <Input type="file" accept=".jpg,.jpeg,.png,.pdf" className="max-w-xs mx-auto" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Ijazah/SKL</h4>
                <p className="text-sm text-gray-500 mb-3">Format: JPG, PNG, PDF (Max 2MB)</p>
                <Input type="file" accept=".jpg,.jpeg,.png,.pdf" className="max-w-xs mx-auto" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Pas Foto 3x4</h4>
                <p className="text-sm text-gray-500 mb-3">Format: JPG, PNG (Max 1MB)</p>
                <Input type="file" accept=".jpg,.jpeg,.png" className="max-w-xs mx-auto" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Akta Kelahiran</h4>
                <p className="text-sm text-gray-500 mb-3">Format: JPG, PNG, PDF (Max 2MB)</p>
                <Input type="file" accept=".jpg,.jpeg,.png,.pdf" className="max-w-xs mx-auto" />
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Catatan:</strong> Upload berkas akan segera tersedia. Saat ini silakan siapkan dokumen-dokumen yang diperlukan.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}