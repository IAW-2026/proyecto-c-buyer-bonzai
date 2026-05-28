import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import { ShopAssistantButton } from '@/features/shell/components/shop-assistant-button';
import { SiteFooter } from '@/features/shell/components/site-footer';
import { SiteNav } from '@/features/shell/components/site-nav';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bonzai',
  description: 'A plant marketplace for thoughtful buyers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-on-surface font-body">
        <ClerkProvider>
          <SiteNav />
          <div className="min-h-screen">{children}</div>
          <SiteFooter />
          <ShopAssistantButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
