import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import {
  CartProvider,
  CartQuantityHydrator,
} from '@/features/cart/components/cart-provider';
import { getCartForUser } from '@/features/cart/data/cart';
import { ShopAssistantButton } from '@/features/shell/components/shop-assistant-button';
import { SiteFooter } from '@/features/shell/components/site-footer';
import { SiteNav } from '@/features/shell/components/site-nav';
import { Suspense } from 'react';
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
  appleWebApp: {
    title: 'Bonzai',
  },
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
          <CartProvider initialQuantity={0}>
            <Suspense fallback={null}>
              <InitialCartQuantity />
            </Suspense>
            <SiteNav />
            <div className="min-h-screen">{children}</div>
          </CartProvider>
          <SiteFooter />
          <ShopAssistantButton />
        </ClerkProvider>
      </body>
    </html>
  );
}

async function InitialCartQuantity() {
  const initialCartQuantity = await getInitialCartQuantity();

  return <CartQuantityHydrator quantity={initialCartQuantity} />;
}

async function getInitialCartQuantity() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return 0;
  }

  const cart = await getCartForUser(userId);

  return cart.totalQuantity;
}
