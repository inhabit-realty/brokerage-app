import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: { default: 'inhabit. realty', template: '%s — inhabit.' },
  description:
    'Florida real estate brokerage. Search homes, work with agents, and get a quieter, more deliberate buying or selling process.',
  metadataBase: new URL('https://inhabit.app'),
  openGraph: {
    title: 'inhabit. realty',
    description: 'Florida real estate brokerage built on broker-controlled data.',
    url: 'https://inhabit.app',
    siteName: 'inhabit.',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <header className="border-b border-mist bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-display text-2xl font-semibold text-prussian">
              inhabit<span className="text-gold">.</span>
            </Link>
            <nav className="flex gap-8 items-center text-xs tracking-[0.14em] uppercase font-medium text-ash">
              <Link href="/search" className="hover:text-prussian transition-colors">
                Search
              </Link>
              <Link
                href="/login"
                className="text-prussian border border-prussian px-4 py-2 hover:bg-prussian hover:text-white transition-colors"
              >
                Agent Sign In
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-prussian-2 mt-24 py-8 px-6 border-t border-gold/20">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-4 text-xs text-canvas/40">
            <span>
              <span className="font-display text-canvas">
                inhabit<span className="text-gold-light">.</span>
              </span>{' '}
              realty &middot; Florida &middot; Equal Housing Opportunity &middot; Broker: James Meyer
            </span>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-canvas transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-canvas transition-colors">
                Privacy
              </Link>
              <a
                href="https://github.com/inhabit-realty"
                className="hover:text-canvas transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
