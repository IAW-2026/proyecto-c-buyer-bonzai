import type { CartViewModel } from '@/features/cart/types';
import { formatCurrency } from '@/lib/formatters';

type OrderSummaryProps = {
  cart: CartViewModel;
  title?: string;
};

export function OrderSummary({ cart, title = 'Resumen del pedido' }: OrderSummaryProps) {
  return (
    <aside className="bg-surface-container-lowest p-6 lg:sticky lg:top-6">
      <p className="mb-5 font-label text-xs uppercase tracking-[0.18em] text-secondary">
        {title}
      </p>

      <div className="space-y-5">
        <ul className="space-y-4" aria-label="Productos del pedido">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-headline text-xl leading-tight text-primary">
                  {item.product.name}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium text-primary">{formatCurrency(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-4 pt-4 text-sm text-secondary">
          <div className="flex items-center justify-between gap-4">
            <dt>Productos ({cart.totalQuantity})</dt>
            <dd className="font-medium text-primary">
              {formatCurrency(cart.productsTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Envio</dt>
            <dd className="font-medium text-primary">Gratis</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-5 font-headline text-3xl text-primary">
            <dt>Total</dt>
            <dd>{formatCurrency(cart.grandTotal)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
