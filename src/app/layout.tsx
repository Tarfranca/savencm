import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SAVE NCM',
  description: 'Plataforma de Classificação Fiscal NCM com IA',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'

  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Sidebar />
        <Header pathname={pathname} />
        <main className="ml-[220px] mt-14 min-h-[calc(100vh-3.5rem)] bg-[#F8FAFC]">
          {children}
        </main>
      </body>
    </html>
  )
}
