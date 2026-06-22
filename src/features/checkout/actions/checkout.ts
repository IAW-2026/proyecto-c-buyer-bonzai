'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearCartForUser, getCartForUser } from '@/features/cart/data/cart';
import type { CartViewModel } from '@/features/cart/types';
import {
  checkoutAddressSelectionSchema,
  checkoutBuyerProfileSchema,
  checkoutShippingAddressSchema,
  type CheckoutBuyerProfileInput,
  type CheckoutShippingAddressInput,
} from '@/features/checkout/schema';
import {
  formatShippingAddress,
  getCheckoutShippingSelection,
} from '@/features/checkout/data/shipping';
import { prisma } from '@/lib/prisma';
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

export type CheckoutBuyerProfileState = {
  status: 'idle' | 'error';
  submissionId: number;
  message: string;
  fieldErrors: Partial<Record<keyof CheckoutBuyerProfileInput, string[]>>;
};

export type CheckoutShippingAddressState = {
  status: 'idle' | 'error';
  submissionId: number;
  message: string;
  fieldErrors: Partial<Record<keyof CheckoutShippingAddressInput, string[]>>;
};

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

export async function saveCheckoutBuyerProfile(
  previousState: CheckoutBuyerProfileState,
  formData: FormData,
): Promise<CheckoutBuyerProfileState> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return buyerProfileErrorState(
      previousState,
      'Inicia sesion para guardar tus datos.',
    );
  }

  const result = checkoutBuyerProfileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  });

  if (!result.success) {
    return buyerProfileErrorState(
      previousState,
      'Revisa los campos marcados para continuar.',
      result.error.flatten().fieldErrors,
    );
  }

  await prisma.buyerProfile.upsert({
    where: { clerk_user_id: userId },
    create: {
      clerk_user_id: userId,
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      phone: result.data.phone,
    },
    update: {
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      phone: result.data.phone,
    },
  });

  revalidateCheckoutPaths();
  redirect('/checkout');
}

export async function createCheckoutShippingAddress(
  previousState: CheckoutShippingAddressState,
  formData: FormData,
): Promise<CheckoutShippingAddressState> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return shippingAddressErrorState(
      previousState,
      'Inicia sesion para guardar una direccion.',
    );
  }

  const result = checkoutShippingAddressSchema.safeParse({
    label: formData.get('label'),
    address: formData.get('address'),
    apartment: formData.get('apartment'),
    floor: formData.get('floor'),
    city: formData.get('city'),
    postalCode: formData.get('postalCode'),
    province: formData.get('province'),
    country: formData.get('country'),
  });

  if (!result.success) {
    return shippingAddressErrorState(
      previousState,
      'Revisa los campos marcados para guardar la direccion.',
      result.error.flatten().fieldErrors,
    );
  }

  const buyer = await prisma.buyerProfile.findUnique({
    where: { clerk_user_id: userId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      phone: true,
    },
  });

  if (
    !buyer?.first_name?.trim() ||
    !buyer.last_name?.trim() ||
    !buyer.phone?.trim()
  ) {
    return shippingAddressErrorState(
      previousState,
      'Guarda primero tus datos de contacto.',
    );
  }

  const address = await prisma.shippingAddress.create({
    data: {
      buyer_id: buyer.id,
      label: result.data.label ?? null,
      address: result.data.address,
      apartment: result.data.apartment ?? null,
      floor: result.data.floor ?? null,
      city: result.data.city,
      postal_code: result.data.postalCode,
      province: result.data.province,
      country: result.data.country,
    },
    select: { id: true },
  });

  revalidateCheckoutPaths();
  redirect(`/checkout/review?addressId=${address.id}`);
}

export async function updateCheckoutShippingAddress(
  previousState: CheckoutShippingAddressState,
  formData: FormData,
): Promise<CheckoutShippingAddressState> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return shippingAddressErrorState(
      previousState,
      'Inicia sesion para editar la direccion.',
    );
  }

  const addressResult = checkoutAddressSelectionSchema.safeParse({
    addressId: formData.get('addressId'),
  });

  if (!addressResult.success) {
    return shippingAddressErrorState(
      previousState,
      'No pudimos encontrar la direccion para editar.',
    );
  }

  const result = checkoutShippingAddressSchema.safeParse({
    label: formData.get('label'),
    address: formData.get('address'),
    apartment: formData.get('apartment'),
    floor: formData.get('floor'),
    city: formData.get('city'),
    postalCode: formData.get('postalCode'),
    province: formData.get('province'),
    country: formData.get('country'),
  });

  if (!result.success) {
    return shippingAddressErrorState(
      previousState,
      'Revisa los campos marcados para guardar los cambios.',
      result.error.flatten().fieldErrors,
    );
  }

  const updateResult = await prisma.shippingAddress.updateMany({
    where: {
      id: addressResult.data.addressId,
      buyer: {
        clerk_user_id: userId,
      },
    },
    data: {
      label: result.data.label ?? null,
      address: result.data.address,
      apartment: result.data.apartment ?? null,
      floor: result.data.floor ?? null,
      city: result.data.city,
      postal_code: result.data.postalCode,
      province: result.data.province,
      country: result.data.country,
    },
  });

  if (updateResult.count === 0) {
    return shippingAddressErrorState(
      previousState,
      'No pudimos encontrar esa direccion en tu cuenta.',
    );
  }

  revalidateCheckoutPaths();
  redirect('/checkout');
}

export async function confirmCheckoutPendingOrders(
  addressId: string,
): Promise<ConfirmCheckoutResult> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      success: false,
      message: 'Inicia sesion para confirmar el pedido.',
    };
  }

  const addressResult = checkoutAddressSelectionSchema.safeParse({ addressId });

  if (!addressResult.success) {
    return {
      success: false,
      message: 'Selecciona una direccion de envio antes de confirmar.',
    };
  }

  const shipping = await getCheckoutShippingSelection(
    userId,
    addressResult.data.addressId,
  );

  if (!shipping) {
    return {
      success: false,
      message: 'Revisa tus datos de envio antes de confirmar.',
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
      shippingName: shipping.profile.firstName,
      shippingLastName: shipping.profile.lastName,
      shippingAddress: formatShippingAddress(shipping.address),
      shippingCity: shipping.address.city,
      shippingProvince: shipping.address.province,
      shippingZip: shipping.address.postalCode,
      shippingPhone: shipping.profile.phone,
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

function buyerProfileErrorState(
  previousState: CheckoutBuyerProfileState,
  message: string,
  fieldErrors: CheckoutBuyerProfileState['fieldErrors'] = {},
): CheckoutBuyerProfileState {
  return {
    status: 'error',
    submissionId: previousState.submissionId + 1,
    message,
    fieldErrors,
  };
}

function shippingAddressErrorState(
  previousState: CheckoutShippingAddressState,
  message: string,
  fieldErrors: CheckoutShippingAddressState['fieldErrors'] = {},
): CheckoutShippingAddressState {
  return {
    status: 'error',
    submissionId: previousState.submissionId + 1,
    message,
    fieldErrors,
  };
}

function revalidateCheckoutPaths() {
  revalidatePath('/cart');
  revalidatePath('/checkout');
  revalidatePath('/checkout/review');
  revalidatePath('/checkout/payment');
  revalidatePath('/purchases');
}
