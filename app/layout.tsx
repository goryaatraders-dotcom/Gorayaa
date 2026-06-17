import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Goraya Traders - Arifwala Galla Mandi',
  description: 'Your trusted fertilizer shop for DAP, Urea, Khad and more agricultural products in Arifwala',
  icons: {
    icon: [{ url: '/gt-favicon.svg', type: 'image/svg+xml' }],
    apple: '/gt-favicon.svg',
    shortcut: '/gt-favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} font-sans antialiased`}>
        <Providers>
          <div className="site-enter">{children}</div>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
