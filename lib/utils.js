import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Generate Nomor Registrasi
export function generateNomorRegistrasi(jalur, tahun, counter) {
  const prefixMap = {
    'REGULER': 'RG',
    'PRESTASI': 'PR',
    'AFIRMASI': 'AF',
    'GO_AKSIO': 'GA'
  }
  const prefix = prefixMap[jalur] || 'RG'
  const tahunStr = tahun.toString().slice(-2) // 2026 -> "26"
  const counterStr = counter.toString().padStart(4, '0') // 1 -> "0001"
  return `${prefix}${tahunStr}${counterStr}`
}

// Generate Password CBT (6 digit acak)
export function generatePasswordCBT() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format Rupiah
export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}

// Get Tagihan berdasarkan Gender
export function getTagihanByGender(jenisKelamin) {
  return jenisKelamin === 'LAKI_LAKI' ? 1000000 : 1200000
}

// Format Tanggal Indonesia
export function formatTanggal(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Status Label
export function getStatusLabel(status) {
  const labels = {
    'SELEKSI': 'Masa Seleksi',
    'LULUS': 'Lulus Seleksi',
    'TIDAK_LULUS': 'Tidak Lulus'
  }
  return labels[status] || status
}

// Status Color
export function getStatusColor(status) {
  const colors = {
    'SELEKSI': 'bg-yellow-100 text-yellow-800',
    'LULUS': 'bg-green-100 text-green-800',
    'TIDAK_LULUS': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}