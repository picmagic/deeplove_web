import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DeepLove AI',
  description: 'Chat with Your Favorite Character Every Day!',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
