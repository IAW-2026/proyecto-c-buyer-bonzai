import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bonzai',
  description: 'A marketplace experience for thoughtful buyers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-stone-50/90 backdrop-blur">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex items-center gap-3 font-semibold tracking-tight text-emerald-950"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-950 text-sm text-stone-50 shadow-sm shadow-emerald-950/20">
                  BB
                </span>
                <span>Bonzai</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                <Show when="signed-out">
                  <SignInButton>
                    <button
                      type="button"
                      className="rounded-full px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-950/5"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button
                      type="button"
                      className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-stone-50 shadow-sm shadow-emerald-950/20 transition hover:bg-emerald-900"
                    >
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </nav>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
