'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { clearCartForUser, getCartForUser } from '@/features/cart/data/cart';
import type { CartViewModel } from '@/features/cart/types';
import {
  checkoutShippingSchema,
  type CheckoutShippingDetails,
} from '@/features/checkout/schema';
import {
  createPaymentsCheckout,
  PaymentsApiError,
} from '@/server/services/payments-api';
import {
  createSellerOrders,
  createSellerReservations,
  type CreateSellerOrdersResult,
  SellerApiError,
} from '@/server/services/seller-api';

export type ConfirmCheckoutResult =
  | {
      success: true;
      orders: CreateSellerOrdersResult['orders'];
      paymentUrl: string;
      transactionId: string;
      paymentStatus: string;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function confirmCheckoutPendingOrders(
  shippingDetails: CheckoutShippingDetails,
): Promise<ConfirmCheckoutResult> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      success: false,
      message: 'Inicia sesion para confirmar el pedido.',
    };
  }

  const shippingResult = checkoutShippingSchema.safeParse(shippingDetails);

  if (!shippingResult.success) {
    return {
      success: false,
      message: 'Revisa los datos de envio antes de confirmar.',
    };
  }

  const cart = await getCartForUser(userId);

  if (cart.items.length === 0) {
    return {
      success: false,
      message: 'Tu carrito esta vacio. Agrega productos antes de confirmar.',
    };
  }

  const unavailableItem = cart.items.find(
    (item) => item.quantity > item.product.stock,
  );

  if (unavailableItem) {
    return {
      success: false,
      message: `${unavailableItem.product.name} no tiene stock suficiente.`,
    };
  }

  const shipping = shippingResult.data;
  const reservationItems = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    sellerId: item.product.sellerId,
  }));
  let reservationIds: string[] = [];
  let createdOrders: CreateSellerOrdersResult;
  let paymentsCheckout: Awaited<ReturnType<typeof createPaymentsCheckout>>;

  try {
    reservationIds = await createSellerReservations({
      buyerId: userId,
      items: reservationItems,
    });

    if (reservationIds.length === 0) {
      throw new SellerApiError('Seller did not return reservation ids.');
    }

    createdOrders = await createSellerOrders({
      buyerId: userId,
      reservationIds,
      status: 'PENDING',
      shippingName: shipping.firstName,
      shippingLastName: shipping.lastName,
      shippingAddress: formatShippingAddress(shipping),
      shippingCity: shipping.city,
      shippingProvince: shipping.province,
      shippingZip: shipping.postalCode,
      shippingPhone: shipping.phone,
    });

    const paymentOrders = buildPaymentsOrders(createdOrders.orders, cart.items);

    paymentsCheckout = await createPaymentsCheckout({
      buyerId: userId,
      orders: paymentOrders,
    });
  } catch (error) {
    return {
      success: false,
      message: getCheckoutErrorMessage(error),
    };
  }

  try {
    await clearCartForUser(userId);
    revalidateCheckoutPaths();
  } catch (error) {
    console.error('Order created but local cart could not be cleared.', error);
  }

  return {
    success: true,
    orders: createdOrders.orders,
    paymentUrl: paymentsCheckout.paymentUrl,
    transactionId: paymentsCheckout.transactionId,
    paymentStatus: paymentsCheckout.status,
    message: 'Pedido creado y pendiente de pago.',
  };
}

function buildPaymentsOrders(
  sellerOrders: CreateSellerOrdersResult['orders'],
  cartItems: CartViewModel['items'],
) {
  if (sellerOrders.length === 0) {
    throw new SellerApiError('Seller did not return orders to pay.');
  }

  const totalsBySeller = cartItems.reduce((totals, item) => {
    const currentTotal = totals.get(item.product.sellerId) ?? 0;

    totals.set(item.product.sellerId, currentTotal + item.lineTotal);

    return totals;
  }, new Map<string, number>());

  return sellerOrders.map((order) => {
    const total = totalsBySeller.get(order.sellerId);

    if (!total || total <= 0) {
      throw new SellerApiError(
        `No pudimos calcular el total para el seller ${order.sellerId}.`,
      );
    }

    return {
      sellerId: order.sellerId,
      amount: roundMoney(total),
      orderRef: order.orderId,
    };
  });
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

function formatShippingAddress(details: CheckoutShippingDetails) {
  return [
    details.address,
    details.apartment ? `Depto ${details.apartment}` : null,
    details.floor ? `Piso ${details.floor}` : null,
  ]
    .filter(Boolean)
    .join(', ');
}

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof SellerApiError) {
    return error.message;
  }

  if (error instanceof PaymentsApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No pudimos confirmar el pedido. Intentalo nuevamente.';
}

function revalidateCheckoutPaths() {
  revalidatePath('/cart');
  revalidatePath('/checkout');
  revalidatePath('/checkout/review');
  revalidatePath('/checkout/payment');
  revalidatePath('/purchases');
}
