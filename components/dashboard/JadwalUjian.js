'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react'

export default function JadwalUjian() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJadwal()
  }, [])

  const fetchJadwal = async () => {
    try {
      const res = await fetch('/api/jadwal')
      const result = await res.json()
      if (result.data) {
        setJadwal(result.data)
      }
    } catch (error) {
      toast.error('Gagal memuat jadwal')
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Default jadwal jika belum ada di database
  const defaultJadwal = [
    {
      id: '1',
      namaKegiatan: 'Pendaftaran Online',
      tanggal: '2026-01-01',
      waktuMulai: '08:00',
      waktuSelesai: '16:00',
      lokasi: 'Online (Website SPMB)',
      status: 'active'
    },
    {
      id: '2',
      namaKegiatan: 'Tes CBT - Gelombang 1',
      tanggal: '2026-02-05',
      waktuMulai: '07:30',
      waktuSelesai: '12:00',
      lokasi: 'Lab Komputer MAN 3 Kediri',
      status: 'upcoming'
    },
    {
      id: '3',
      namaKegiatan: 'Tes CBT - Gelombang 2',
      tanggal: '2026-02-06',
      waktuMulai: '07:30',
      waktuSelesai: '12:00',
      lokasi: 'Lab Komputer MAN 3 Kediri',
      status: 'upcoming'
    },
    {
      id: '4',
      namaKegiatan: 'Pengumuman Hasil Seleksi',
      tanggal: '2026-02-10',
      waktuMulai: '10:00',
      waktuSelesai: '17:00',
      lokasi: 'Online (Website SPMB)',
      status: 'upcoming'
    },
    {
      id: '5',
      namaKegiatan: 'Daftar Ulang',
      tanggal: '2026-02-11',
      waktuMulai: '08:00',
      waktuSelesai: '14:00',
      lokasi: 'Aula MAN 3 Kediri',
      status: 'upcoming'
    }
  ]

  const displayJadwal = jadwal.length > 0 ? jadwal : defaultJadwal

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
          <p className="text-gray-500 mt-2">Memuat jadwal...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Jadwal Kegiatan SPMB
        </CardTitle>
        <CardDescription>
          Jadwal seleksi penerimaan murid baru MAN 3 Kediri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayJadwal.map((item, index) => (
            <div 
              key={item.id || index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{item.namaKegiatan}</h3>
                  {item.status === 'active' && (
                    <Badge className="bg-green-500">Berlangsung</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatTanggal(item.tanggal)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.waktuMulai} - {item.waktuSelesai} WIB
                  </span>
                  {item.lokasi && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.lokasi}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">Catatan Penting:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Peserta ujian wajib hadir 30 menit sebelum ujian dimulai</li>
            <li>• Membawa kartu peserta ujian yang sudah dicetak</li>
            <li>• Membawa alat tulis (pensil 2B, penghapus)</li>
            <li>• Memakai seragam sekolah asal yang rapi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}