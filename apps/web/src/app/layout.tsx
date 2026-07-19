import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono-var' });
const display = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-display' });

export const metadata: Metadata = {
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
  },
  twitter: { card: 'summary' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}>
      <body className="min-h-dvh bg-background font-geist text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
