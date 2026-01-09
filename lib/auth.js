import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        nomorRegistrasi: { label: 'Nomor Registrasi', type: 'text', placeholder: 'RG260001' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.nomorRegistrasi || !credentials?.password) {
          throw new Error('Nomor Registrasi dan Password harus diisi')
        }

        const user = await prisma.user.findUnique({
          where: { nomorRegistrasi: credentials.nomorRegistrasi },
          include: { siswa: true }
        })

        if (!user) {
          throw new Error('Nomor Registrasi tidak ditemukan')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Password salah')
        }

        return {
          id: user.id,
          nomorRegistrasi: user.nomorRegistrasi,
          role: user.role,
          nama: user.siswa?.namaLengkap || 'Admin',
          siswaId: user.siswa?.id || null,
          status: user.siswa?.status || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.nomorRegistrasi = user.nomorRegistrasi
        token.role = user.role
        token.nama = user.nama
        token.siswaId = user.siswaId
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.nomorRegistrasi = token.nomorRegistrasi
      session.user.role = token.role
      session.user.nama = token.nama
      session.user.siswaId = token.siswaId
      session.user.status = token.status
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
}

export const getAuthSession = () => getServerSession(authOptions)