'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useCart } from '@/features/cart/components/cart-provider';

export function CartNavLink() {
  const { pulseKey, quantity } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const badgeLabel = quantity > 9 ? '9+' : quantity.toString();
  const ariaLabel =
    quantity === 0
      ? 'Open shopping bag'
      : quantity === 1
        ? 'Open shopping bag, 1 item'
        : `Open shopping bag, ${quantity} items`;

  return (
    <Link
      href="/cart"
      className="relative flex size-10 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={ariaLabel}
    >
      <ShoppingBagIcon className="size-5" />

      <AnimatePresence initial={false}>
        {quantity > 0 ? (
          <motion.span
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center overflow-hidden rounded-full bg-primary px-1 font-label text-[10px] font-semibold leading-none text-on-primary shadow-[0_0_0_2px_var(--color-surface)]"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.85, y: -3 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: pulseKey > 0 ? [1, 1.18, 1] : 1,
                    y: pulseKey > 0 ? [0, -2, 0] : 0,
                  }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.85, y: -2 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.12 }
                : { duration: 0.24, ease: 'easeOut' }
            }
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={badgeLabel}
                className="block"
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.1 }
                    : { duration: 0.18, ease: 'easeOut' }
                }
              >
                {badgeLabel}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M6.5 8.5h11l-.75 11h-9.5l-.75-11Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </svg>
  );
}
