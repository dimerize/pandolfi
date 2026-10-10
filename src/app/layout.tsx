import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import '@/styles/base.css';
import { site } from '@content/site';

/*
  One family, one weight, upright and italic. next/font downloads the files
  at build time and serves them from this origin: a visitor's browser never
  contacts Google. The CSS variable is read by --font-mono in tokens.css.
*/
const plex = IBM_Plex_Mono({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  /* The tab title is his handle as a sentence; inner pages follow it. */
  title: { default: site.phrase, template: `${site.phrase} · %s` },
  description: site.line,
  openGraph: {
    type: 'website',
    siteName: site.brand,
    title: site.phrase,
    description: site.line,
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  /* The literal value of --cloth: HTML cannot read a custom property. */
  themeColor: '#e9e4d8',
  colorScheme: 'light',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={plex.variable}>
      <body>
        <a className="skip" href="#main">
          skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
