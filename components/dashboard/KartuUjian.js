'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Printer, Loader2, GraduationCap, User, MapPin, Calendar, Key } from 'lucide-react'

export default function KartuUjian({ siswaData, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [kartuData, setKartuData] = useState({
    ruangUjian: siswaData?.ruangUjian?.namaRuang || null,
    nomorKursi: siswaData?.nomorKursi || null,
    passwordCbt: siswaData?.passwordCbt || null
  })
  const printRef = useRef(null)

  const handleCetakKartu = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/siswa/${siswaData.id}/cetak-kartu`, {
        method: 'POST'
      })
      const result = await res.json()

      if (result.success) {
        setKartuData({
          ruangUjian: result.data.ruangUjian,
          nomorKursi: result.data.nomorKursi,
          passwordCbt: result.data.passwordCbt
        })
        toast.success(result.message)
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.error || 'Gagal mencetak kartu')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const isReguler = siswaData?.jalur === 'REGULER'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-green-600" />
            Kartu Ujian
          </CardTitle>
          <CardDescription>
            {isReguler 
              ? 'Cetak kartu ujian untuk mendapatkan ruang ujian dan password CBT'
              : 'Cetak kartu sebagai bukti pendaftaran'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!siswaData?.kartuDicetak ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Kartu Belum Dicetak</h3>
              <p className="text-gray-500 mb-4">
                {isReguler 
                  ? 'Klik tombol di bawah untuk mendapatkan ruang ujian, nomor kursi, dan password CBT'
                  : 'Klik tombol di bawah untuk mencetak kartu pendaftaran'}
              </p>
              <Button 
                onClick={handleCetakKartu} 
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {loading ? 'Memproses...' : 'Generate & Cetak Kartu'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Kartu Preview */}
              <div ref={printRef} className="print-area border-2 border-green-600 rounded-lg overflow-hidden">
                {/* Header Kartu */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">MAN 3 KEDIRI</h2>
                        <p className="text-sm text-green-100">Kartu Peserta {isReguler ? 'Ujian' : 'Seleksi'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-100">Tahun Ajaran</p>
                      <p className="font-bold">2025/2026</p>
                    </div>
                  </div>
                </div>

                {/* Body Kartu */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Foto Placeholder */}
                    <div className="flex justify-center">
                      <div className="w-32 h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-300" />
                      </div>
                    </div>

                    {/* Data Siswa */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Nomor Registrasi</p>
                        <p className="font-bold text-lg text-green-600">{siswaData?.user?.nomorRegistrasi}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nama Lengkap</p>
                        <p className="font-semibold text-gray-900">{siswaData?.namaLengkap}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Jalur Pendaftaran</p>
                          <Badge variant="outline">{siswaData?.jalur}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Peminatan</p>
                          <Badge variant="outline">{siswaData?.peminatan}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Ujian (Khusus Reguler) */}
                  {isReguler && kartuData.ruangUjian && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Informasi Ujian
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-blue-600">Ruang Ujian</p>
                          <p className="font-bold text-blue-800 text-lg">{kartuData.ruangUjian}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                          <User className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                          <p className="text-xs text-amber-600">Nomor Kursi</p>
                          <p className="font-bold text-amber-800 text-lg">{kartuData.nomorKursi}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <Key className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Password CBT</p>
                          <p className="font-bold text-green-800 text-lg font-mono">{kartuData.passwordCbt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Note */}
                  <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                    <p>* Kartu ini wajib dibawa saat ujian berlangsung</p>
                    <p>* Peserta hadir 30 menit sebelum ujian dimulai</p>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-center gap-4 no-print">
                <Button onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Cetak Kartu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}