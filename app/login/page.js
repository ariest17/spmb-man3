'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, LogIn, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nomorRegistrasi: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        nomorRegistrasi: formData.nomorRegistrasi,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Login berhasil!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Login SPMB</CardTitle>
          <CardDescription>Masuk dengan nomor registrasi Anda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomorRegistrasi">Nomor Registrasi</Label>
              <Input
                id="nomorRegistrasi"
                name="nomorRegistrasi"
                placeholder="Contoh: RG260001"
                value={formData.nomorRegistrasi}
                onChange={handleChange}
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Memproses...' : 'Login'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Belum punya akun?{' '}
              <Link href="/daftar" className="text-green-600 hover:underline font-medium">
                Daftar Sekarang
              </Link>
            </p>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 text-center">
              ← Kembali ke Beranda
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}