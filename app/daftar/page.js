'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, UserPlus, Loader2, CheckCircle, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function DaftarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    jenisKelamin: '',
    jalur: '',
    peminatan: '',
    password: '',
    konfirmasiPassword: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.konfirmasiPassword) {
      toast.error('Password dan konfirmasi password tidak sama')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          jenisKelamin: formData.jenisKelamin,
          jalur: formData.jalur,
          peminatan: formData.peminatan,
          password: formData.password
        })
      })

      const result = await response.json()

      if (response.ok) {
        setRegistrationData(result.data)
        setShowSuccess(true)
        toast.success('Pendaftaran berhasil!')
      } else {
        toast.error(result.error || 'Pendaftaran gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Nomor registrasi berhasil disalin!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Pendaftaran Siswa Baru</CardTitle>
            <CardDescription>MAN 3 Kediri Tahun Ajaran 2025/2026</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input
                  id="namaLengkap"
                  name="namaLengkap"
                  placeholder="Masukkan nama lengkap sesuai ijazah"
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => handleSelectChange('jenisKelamin', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  *Jenis kelamin menentukan nominal biaya pendaftaran ulang
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jalur Pendaftaran <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(value) => handleSelectChange('jalur', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jalur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULER">Reguler</SelectItem>
                      <SelectItem value="PRESTASI">Prestasi</SelectItem>
                      <SelectItem value="AFIRMASI">Afirmasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Peminatan <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(value) => handleSelectChange('peminatan', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peminatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UMUM">Umum (MIPA/IPS)</SelectItem>
                      <SelectItem value="AGAMA">Agama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Buat Password Login</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="konfirmasiPassword">Konfirmasi Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="konfirmasiPassword"
                      name="konfirmasiPassword"
                      type="password"
                      placeholder="Ulangi password"
                      value={formData.konfirmasiPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-green-600 hover:underline font-medium">
                  Login di sini
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 text-center">
                ← Kembali ke Beranda
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Pendaftaran Berhasil!</DialogTitle>
            <DialogDescription className="text-center">
              Simpan nomor registrasi berikut untuk login
            </DialogDescription>
          </DialogHeader>
          {registrationData && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Nomor Registrasi</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{registrationData.nomorRegistrasi}</span>
                  <button
                    onClick={() => copyToClipboard(registrationData.nomorRegistrasi)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="text-sm space-y-2 bg-amber-50 p-3 rounded-lg">
                <p className="font-medium text-amber-800">Informasi Penting:</p>
                <ul className="text-amber-700 space-y-1">
                  <li>• Nama: {registrationData.namaLengkap}</li>
                  <li>• Jalur: {registrationData.jalur}</li>
                  <li>• Peminatan: {registrationData.peminatan}</li>
                </ul>
              </div>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Login Sekarang
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}