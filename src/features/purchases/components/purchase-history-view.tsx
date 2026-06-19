import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { RefundRequestButton } from './refund-request-button';
import type { PurchaseOrderItem } from '../types';
import { getOrdersForBuyer } from '@/features/purchases/data/purchases';

type PurchaseHistoryViewProps = {
  userId: string;
};

export async function PurchaseHistoryView({
  userId,
}: PurchaseHistoryViewProps) {
  const orders = await getOrdersForBuyer(userId);

  if (orders.length === 0) {
    return <EmptyPurchases />;
  }

  return (
    <section className="space-y-8" aria-label="Order history">
      {orders.map((order) => (
        <article
          key={order.orderId}
          className="grid gap-5 bg-surface-container-low p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
        >
          <div className="bg-surface-container-lowest p-5 sm:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                  Ordered on
                </p>
                <h2 className="mt-2 font-headline text-4xl leading-none tracking-[-0.03em] text-primary sm:text-5xl">
                  {formatDate(order.createdAt)}
                </h2>
                <p className="mt-3 font-label text-[11px] uppercase tracking-[0.18em] text-secondary">
                  {order.orderId}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <StatusPill label="Order" value={order.status} />
                <StatusPill
                  label="Payment"
                  value={order.status === 'PAID' ? 'COMPLETED' : 'PENDING'}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-3" aria-label="Purchased products">
              {order.items.map((item) => (
                <PurchasedProduct key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 bg-surface-container p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                  Order total
                </p>
                <p className="mt-1 font-headline text-4xl leading-none text-primary">
                  {formatCurrency(order.total)}
                </p>
              </div>
              <RefundRequestButton
                orderId={order.orderId}
                disabled
              />
            </div>
          </div>

          <aside className="bg-surface-container-lowest p-5 sm:p-6 lg:sticky lg:top-6">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-secondary">
              Fulfillment
            </p>
            <p className="mt-3 font-headline text-3xl leading-none text-primary">
              {order.trackingId ? 'Tracking assigned' : 'Awaiting tracking'}
            </p>

            <dl className="mt-7 space-y-5 text-sm leading-6">
              <Detail label="Tracking" value={order.trackingId ?? 'Pending'} />
              <Detail
                label="Order created"
                value={formatDate(order.createdAt)}
              />
              <Detail
                label="Payment status"
                value={order.status === 'PAID' ? 'Completed' : 'Pending'}
              />
              <Detail label="Current status" value={formatStatus(order.status)} />
            </dl>
          </aside>
        </article>
      ))}
    </section>
  );
}

export function PurchaseHistorySkeleton() {
  return (
    <section
      className="space-y-8"
      aria-label="Order history loading"
      aria-busy="true"
    >
      {Array.from({ length: 2 }, (_, index) => (
        <article
          key={index}
          className="grid gap-5 bg-surface-container-low p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
          aria-hidden="true"
        >
          <div className="bg-surface-container-lowest p-5 sm:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="h-3 w-24 bg-surface-container" />
                <div className="mt-3 h-12 w-56 bg-surface-container-high" />
                <div className="mt-4 h-3 w-40 bg-surface-container" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-secondary-container/60" />
                <div className="h-8 w-28 bg-secondary-container/50" />
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {Array.from({ length: 2 }, (_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="grid gap-4 bg-surface-container-low p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div>
                    <div className="h-7 w-56 bg-surface-container-high" />
                    <div className="mt-3 h-4 w-28 bg-surface-container" />
                  </div>
                  <div className="h-7 w-20 bg-surface-container-high" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 bg-surface-container p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
              <div>
                <div className="h-3 w-24 bg-surface-container-high" />
                <div className="mt-3 h-10 w-28 bg-surface-container-high" />
              </div>
              <div className="h-10 w-36 bg-surface-container-high" />
            </div>
          </div>

          <aside className="bg-surface-container-lowest p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="h-4 w-36 bg-surface-container" />
            <div className="mt-4 h-9 w-44 bg-surface-container-high" />
            <div className="mt-7 space-y-5">
              {Array.from({ length: 4 }, (_, detailIndex) => (
                <div key={detailIndex}>
                  <div className="h-3 w-24 bg-surface-container" />
                  <div className="mt-2 h-4 w-full bg-surface-container-high" />
                </div>
              ))}
            </div>
          </aside>
        </article>
      ))}
    </section>
  );
}

function PurchasedProduct({ item }: { item: PurchaseOrderItem }) {
  return (
    <div className="grid gap-4 bg-surface-container-low p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <Link
          href={`/p/${item.productId}`}
          className="font-headline text-2xl leading-tight text-primary transition hover:text-primary-container focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {item.productName}
        </Link>
        <p className="mt-2 font-body text-sm text-secondary">
          {item.quantity} x {formatCurrency(item.unitPrice)}
        </p>
      </div>
      <p className="font-headline text-2xl leading-none text-primary sm:text-right">
        {formatCurrency(item.subtotal)}
      </p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex bg-secondary-container px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-on-secondary-container">
      {label}: {formatStatus(value)}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
        {label}
      </dt>
      <dd className="mt-1 text-primary">{value}</dd>
    </div>
  );
}

function EmptyPurchases() {
  return (
    <section className="bg-surface-container-low p-6 text-center sm:p-10">
      <p className="font-label text-xs uppercase tracking-[0.2em] text-secondary">
        No orders yet
      </p>
      <h2 className="mx-auto mt-3 max-w-2xl font-headline text-4xl leading-tight text-primary sm:text-5xl">
        Your archive is still waiting for its first living piece.
      </h2>
      <Link
        href="/shop"
        className="mt-8 inline-flex cursor-pointer rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Browse the archive
      </Link>
    </section>
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
