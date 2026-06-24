import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  getPaymentOrderStatus,
  PaymentsApiError,
  type PaymentOrderStatus,
} from '@/server/services/payments-api';
import {
  getBuyerPurchases,
  type BuyerPurchaseOrder,
  type BuyerPurchaseOrderItem,
} from '@/server/services/seller-api';
import { RefundRequestButton } from './refund-request-button';

type PurchaseHistoryViewProps = {
  userId: string;
};

const SHIPPING_TRACKING_BASE_URL =
  'https://proyecto-c-shipping-bonzai.vercel.app/shipping';

type OrderPaymentLookup = {
  status: PaymentOrderStatus | null;
  unavailable: boolean;
};

export async function PurchaseHistoryView({
  userId,
}: PurchaseHistoryViewProps) {
  const purchases = await getBuyerPurchases(userId);

  if (purchases.length === 0) {
    return <EmptyPurchases />;
  }

  const paymentStatusesByOrderId = await getPaymentStatusesByOrderId(
    purchases.flatMap((purchase) => purchase.orders),
  );

  return (
    <section className="space-y-8" aria-label="Purchase history">
      {purchases.map((purchase) => {
        const items = purchase.orders.flatMap((order) => order.items);
        const purchaseTotal = purchase.orders.reduce(
          (total, order) => total + order.total,
          0,
        );
        const trackingIds = purchase.orders.flatMap((order) =>
          order.trackingId ? [order.trackingId] : [],
        );

        return (
          <article
            key={purchase.purchaseId}
            className="grid gap-5 bg-surface-container-low p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
          >
            <div className="bg-surface-container-lowest p-5 sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                    Purchased on
                  </p>
                  <h2 className="mt-2 font-headline text-4xl leading-none tracking-[-0.03em] text-primary sm:text-5xl">
                    {formatDate(purchase.createdAt)}
                  </h2>
                  <p className="mt-3 font-label text-[11px] uppercase tracking-[0.18em] text-secondary">
                    {purchase.purchaseId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <StatusPill label="Purchase" value={purchase.status} />
                </div>
              </div>

              <div className="mt-8 grid gap-4" aria-label="Seller orders">
                {purchase.orders.map((order) => (
                  <PurchasedOrder
                    key={order.orderId}
                    order={order}
                    paymentStatus={paymentStatusesByOrderId.get(order.orderId)}
                  />
                ))}
              </div>

              <div className="mt-8 bg-surface-container p-4 sm:p-5">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                    Purchase total
                  </p>
                  <p className="mt-1 font-headline text-4xl leading-none text-primary">
                    {formatCurrency(purchaseTotal)}
                  </p>
                </div>
              </div>
            </div>

            <aside className="bg-surface-container-lowest p-5 sm:p-6 lg:sticky lg:top-6">
              <dl className="mt-2 space-y-5 text-sm leading-6">
                <Detail
                  label="Tracking"
                  value={<TrackingLinks trackingIds={trackingIds} />}
                />
                <Detail
                  label="Purchase created"
                  value={formatDate(purchase.createdAt)}
                />
                <Detail
                  label="Purchase status"
                  value={formatStatus(purchase.status)}
                />
                <Detail label="Products" value={String(items.length)} />
              </dl>
            </aside>
          </article>
        );
      })}
    </section>
  );
}

async function getPaymentStatusesByOrderId(orders: BuyerPurchaseOrder[]) {
  const entries = await Promise.all(
    orders.map(async (order): Promise<[string, OrderPaymentLookup]> => {
      try {
        return [
          order.orderId,
          {
            status: await getPaymentOrderStatus(order.orderId),
            unavailable: false,
          },
        ];
      } catch (error) {
        logPaymentStatusError(order.orderId, error);

        return [order.orderId, { status: null, unavailable: true }];
      }
    }),
  );

  return new Map(entries);
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

function PurchasedProduct({ item }: { item: BuyerPurchaseOrderItem }) {
  return (
    <div className="grid gap-4 bg-surface-container-low p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <Link
          href={`/p/${item.productId}`}
          className="font-headline text-2xl leading-tight text-primary transition hover:text-primary-container focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {item.name}
        </Link>
        <p className="mt-2 font-body text-sm text-secondary">
          {item.quantity} x {formatCurrency(item.price)}
        </p>
      </div>
      <p className="font-headline text-2xl leading-none text-primary sm:text-right">
        {formatCurrency(item.quantity * item.price)}
      </p>
    </div>
  );
}

function PurchasedOrder({
  order,
  paymentStatus,
}: {
  order: BuyerPurchaseOrder;
  paymentStatus?: OrderPaymentLookup;
}) {
  const refundAction = getRefundAction(paymentStatus);

  return (
    <section
      className="grid gap-5 bg-surface-container-low p-4 sm:p-5"
      aria-label={`Seller order ${order.orderId}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
            Seller order
          </p>
          <h3 className="mt-2 font-headline text-3xl leading-none tracking-[-0.03em] text-primary sm:text-4xl">
            {formatCurrency(order.total)}
          </h3>
          <p className="mt-3 break-all font-label text-[10px] uppercase tracking-[0.16em] text-secondary">
            {order.orderId}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <StatusPill label="Order" value={order.status} />
          <StatusPill
            label="Payment"
            value={getPaymentStatusValue(paymentStatus)}
          />
        </div>
      </div>

      <div className="grid gap-3" aria-label="Purchased products in this order">
        {order.items.map((item, index) => (
          <PurchasedProduct key={`${item.productId}-${index}`} item={item} />
        ))}
      </div>

      <div className="flex flex-col gap-4 bg-surface-container p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
            Order total
          </p>
          <p className="mt-1 font-headline text-3xl leading-none text-primary">
            {formatCurrency(order.total)}
          </p>
          <p className="mt-2 break-all text-xs leading-5 text-secondary">
            Seller: {order.sellerId}
          </p>
        </div>
        <RefundRequestButton
          orderId={order.orderId}
          disabled={refundAction.disabled}
          disabledLabel={refundAction.disabledLabel}
          disabledMessage={refundAction.disabledMessage}
        />
      </div>
    </section>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex bg-secondary-container px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-on-secondary-container">
      {label}: {formatStatus(value)}
    </span>
  );
}

function getRefundAction(paymentStatus?: OrderPaymentLookup): {
  disabled: boolean;
  disabledLabel?: string;
  disabledMessage?: string;
} {
  const status = paymentStatus?.status?.status.toUpperCase();

  if (!status || paymentStatus?.unavailable) {
    return {
      disabled: true,
      disabledLabel: 'Status unavailable',
      disabledMessage:
        'We cannot verify the refund status right now. Try again later.',
    };
  }

  if (status === 'DISPUTED') {
    return {
      disabled: true,
      disabledLabel: 'Refund in review',
      disabledMessage: 'This order already has a refund dispute in review.',
    };
  }

  if (status === 'REFUNDED') {
    return {
      disabled: true,
      disabledLabel: 'Refunded',
      disabledMessage: 'This order was refunded.',
    };
  }

  if (status === 'COMPLETED') {
    return {
      disabled: true,
      disabledLabel: 'Refund closed',
      disabledMessage:
        'The dispute was closed or the seller payout was completed, so this order cannot be disputed again.',
    };
  }

  return { disabled: false };
}

function getPaymentStatusValue(paymentStatus?: OrderPaymentLookup) {
  if (!paymentStatus?.status || paymentStatus.unavailable) {
    return 'UNAVAILABLE';
  }

  return paymentStatus.status.status;
}

function logPaymentStatusError(orderId: string, error: unknown) {
  if (error instanceof PaymentsApiError) {
    console.warn('Could not read payment status for order.', {
      orderId,
      status: error.status,
      message: error.message,
    });

    return;
  }

  console.error('Unexpected payment status error.', { orderId, error });
}

function TrackingLinks({ trackingIds }: { trackingIds: string[] }) {
  if (trackingIds.length === 0) {
    return 'Pending';
  }

  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {trackingIds.map((trackingId) => (
        <a
          key={trackingId}
          href={`${SHIPPING_TRACKING_BASE_URL}/${encodeURIComponent(trackingId)}`}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-primary/30 underline-offset-4 transition hover:text-primary-container hover:decoration-primary-container focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {trackingId}
        </a>
      ))}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
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
        No purchases yet
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
