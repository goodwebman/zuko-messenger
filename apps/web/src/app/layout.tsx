import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono-var' });
const display = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-display' });

export const metadata: Metadata = {
  // Нужен, чтобы относительные пути в og/twitter превращались в абсолютные URL.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Zuko Messenger',
    template: '%s · Zuko',
  },
  description: 'Мини-соцсеть и мессенджер в реальном времени: посты, лайки, репосты, чаты.',
  applicationName: 'Zuko Messenger',
  openGraph: {
    title: 'Zuko Messenger',
    description: 'Мини-соцсеть и мессенджер в реальном времени',
    type: 'website',
    siteName: 'Zuko Messenger',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Zuko Messenger' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  robots: { index: true, follow: true },
};

// Цвет UI-хрома мобильных браузеров = --color-ink-well.
export const viewport: Viewport = {
  themeColor: '#121317',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // `dark` включает dark:-варианты ui-kit (@custom-variant dark) — тема всегда тёмная,
  // без класса компоненты кита (Toast, Alert) рисовались бы в светлой палитре.
  return (
    <html
      lang="ru"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable}`}
    >
      <body className="min-h-dvh bg-background font-geist text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
