'use client';

import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import {
  decrementCartItemById,
  incrementCartItemById,
  removeCartItemById,
} from '@/features/cart/actions/cart';
import type { CartLineItem, CartViewModel } from '../types';
import { useCart } from './cart-provider';
import { formatCurrency } from '@/lib/formatters';
import { ProductImage } from '@/features/shop/components/product-image';

type CartOptimisticAction =
  | { type: 'increment'; productId: string }
  | { type: 'decrement'; productId: string }
  | { type: 'remove'; productId: string };

type CartViewProps = {
  cart: CartViewModel;
};

export function CartView({ cart }: CartViewProps) {
  const { dispatchCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cart,
    applyOptimisticCartAction,
  );

  function incrementItem(productId: string) {
    startTransition(async () => {
      updateOptimisticCart({ type: 'increment', productId });
      dispatchCart({ type: 'increment' });
      await incrementCartItemById(productId);
    });
  }

  function decrementItem(productId: string) {
    const item = optimisticCart.items.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!item || item.quantity === 1) {
      return;
    }

    startTransition(async () => {
      updateOptimisticCart({ type: 'decrement', productId });
      dispatchCart({ type: 'decrement' });
      await decrementCartItemById(productId);
    });
  }

  function removeItem(productId: string) {
    const item = optimisticCart.items.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!item) {
      return;
    }

    startTransition(async () => {
      updateOptimisticCart({ type: 'remove', productId });
      dispatchCart({ type: 'decrement', delta: item.quantity });
      await removeCartItemById(productId);
    });
  }

  if (optimisticCart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
      aria-busy={isPending}
    >
      <section className="space-y-4" aria-label="Cart products">
        {optimisticCart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onDecrement={decrementItem}
            onIncrement={incrementItem}
            onRemove={removeItem}
          />
        ))}
      </section>

      <aside className="bg-surface-container-lowest p-6 lg:sticky lg:top-6">
        <p className="mb-5 font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Order summary
        </p>

        <dl className="space-y-4 text-sm text-secondary">
          <div className="flex items-center justify-between gap-4">
            <dt>Products ({optimisticCart.totalQuantity})</dt>
            <dd className="font-medium text-primary">
              {formatCurrency(optimisticCart.productsTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Shipping</dt>
            <dd className="font-medium text-primary">Free</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-6 font-headline text-3xl text-primary">
            <dt>Total</dt>
            <dd>{formatCurrency(optimisticCart.grandTotal)}</dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="mt-8 flex w-full cursor-pointer items-center justify-center rounded-sm bg-primary px-8 py-4 text-center font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Completar pedido
        </Link>
      </aside>
    </div>
  );
}

function CartItemRow({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  item: CartLineItem;
  onDecrement: (productId: string) => void;
  onIncrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <article className="grid gap-5 bg-surface-container-lowest p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-5">
      <Link
        href={`/p/${item.productId}`}
        className="relative aspect-square cursor-pointer overflow-hidden bg-surface-container-highest"
        aria-label={`View ${item.product.name}`}
      >
        <ProductImage
          imageUrl={item.product.imageUrl}
          name={item.product.name}
          sizes="8rem"
          className="object-cover transition duration-500 hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {item.product.category ? (
            <p className="mb-2 font-label text-[11px] uppercase tracking-[0.18em] text-secondary">
              {item.product.category.name}
            </p>
          ) : null}
          <Link
            href={`/p/${item.productId}`}
            className="cursor-pointer font-headline text-2xl leading-tight text-primary transition hover:text-primary-container"
          >
            {item.product.name}
          </Link>
          <p className="mt-2 text-sm text-secondary">
            {formatCurrency(item.unitPrice)} each
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 md:justify-end">
          <QuantityControls
            item={item}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            onRemove={onRemove}
          />
          <p className="min-w-20 font-headline text-xl text-primary md:text-right">
            {formatCurrency(item.lineTotal)}
          </p>
        </div>
      </div>
    </article>
  );
}

function QuantityControls({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  item: CartLineItem;
  onDecrement: (productId: string) => void;
  onIncrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center bg-surface-container">
        <button
          type="button"
          disabled={item.quantity === 1}
          onClick={() => onDecrement(item.productId)}
          className="flex size-10 items-center justify-center text-primary transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:text-outline"
          aria-label={`Decrease ${item.product.name} quantity`}
        >
          <MinusIcon className="size-4" />
        </button>
        <span
          className="min-w-10 text-center font-label text-sm text-primary"
          aria-label="Quantity"
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onIncrement(item.productId)}
          disabled={item.quantity >= item.product.stock}
          className="flex size-10 cursor-pointer items-center justify-center text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-outline"
          aria-label={`Increase ${item.product.name} quantity`}
        >
          <PlusIcon className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-sm text-secondary transition hover:bg-surface-container-high hover:text-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`Remove ${item.product.name} from cart`}
      >
        <TrashIcon className="size-5" />
      </button>
    </div>
  );
}

function applyOptimisticCartAction(
  cart: CartViewModel,
  action: CartOptimisticAction,
): CartViewModel {
  if (action.type === 'remove') {
    return recalculateCart({
      ...cart,
      items: cart.items.filter((item) => item.productId !== action.productId),
    });
  }

  return recalculateCart({
    ...cart,
    items: cart.items.map((item) => {
      if (item.productId !== action.productId) {
        return item;
      }

      const quantity =
        action.type === 'increment'
          ? item.quantity + 1
          : Math.max(1, item.quantity - 1);

      return {
        ...item,
        quantity,
        lineTotal: item.unitPrice * quantity,
      };
    }),
  });
}

function recalculateCart(cart: CartViewModel): CartViewModel {
  const productsTotal = cart.items.reduce((total, item) => total + item.lineTotal, 0);
  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);

  return {
    ...cart,
    productsTotal,
    shippingTotal: 0,
    grandTotal: productsTotal,
    totalQuantity,
  };
}

function EmptyCart() {
  return (
    <section className="mx-auto max-w-3xl bg-surface-container-lowest p-8 text-center sm:p-12">
      <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
        Curated bag
      </p>
      <h2 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
        Your cart is waiting for plants.
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-secondary md:text-base">
        Add a plant or vessel from the Bonzai marketplace and it will appear
        here.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex cursor-pointer rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Return to shop
      </Link>
    </section>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6.5 7 7.4 20h9.2l.9-13" />
      <path d="M9 7V4.5h6V7" />
    </svg>
  );
}
