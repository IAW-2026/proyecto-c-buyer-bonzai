import { getProductById } from '@/features/shop/data/products';
import { prisma } from '@/lib/prisma';
import type { CartViewModel } from '../types';

const emptyCart: CartViewModel = {
  items: [],
  productsTotal: 0,
  shippingTotal: 0,
  grandTotal: 0,
  totalQuantity: 0,
};

export async function getCartForUser(
  clerkUserId: string,
): Promise<CartViewModel> {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      cart: {
        include: {
          items: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  const items = buyer?.cart?.items ?? [];

  if (items.length === 0) {
    return emptyCart;
  }

  const cartItems = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.product_id);

      if (!product) {
        return null;
      }

      return {
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      };
    }),
  );

  const availableItems = cartItems.filter((item) => item !== null);
  const productsTotal = availableItems.reduce(
    (total, item) => total + item.lineTotal,
    0,
  );
  const totalQuantity = availableItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const shippingTotal = 0;

  return {
    items: availableItems,
    productsTotal,
    shippingTotal,
    grandTotal: productsTotal + shippingTotal,
    totalQuantity,
  };
}

export async function addProductToCart(clerkUserId: string, productId: string) {
  await assertProductExists(productId);
  const cart = await getOrCreateCartForUser(clerkUserId);

  return prisma.cartItem.upsert({
    where: {
      cart_id_product_id: {
        cart_id: cart.id,
        product_id: productId,
      },
    },
    create: {
      cart_id: cart.id,
      product_id: productId,
      quantity: 1,
    },
    update: {
      quantity: {
        increment: 1,
      },
    },
  });
}

export async function incrementCartProduct(
  clerkUserId: string,
  productId: string,
) {
  return addProductToCart(clerkUserId, productId);
}

export async function decrementCartProduct(
  clerkUserId: string,
  productId: string,
) {
  const cart = await getExistingCartForUser(clerkUserId);

  if (!cart) {
    return;
  }

  await prisma.cartItem.updateMany({
    where: {
      cart_id: cart.id,
      product_id: productId,
      quantity: {
        gt: 1,
      },
    },
    data: {
      quantity: {
        decrement: 1,
      },
    },
  });
}

export async function removeCartProduct(
  clerkUserId: string,
  productId: string,
) {
  const cart = await getExistingCartForUser(clerkUserId);

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cart_id: cart.id,
      product_id: productId,
    },
  });
}

export async function clearCartForUser(clerkUserId: string) {
  const cart = await getExistingCartForUser(clerkUserId);

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cart_id: cart.id,
    },
  });
}

async function getOrCreateCartForUser(clerkUserId: string) {
  const buyer = await prisma.buyerProfile.upsert({
    where: { clerk_user_id: clerkUserId },
    create: { clerk_user_id: clerkUserId },
    update: {},
  });

  return prisma.cart.upsert({
    where: { buyer_id: buyer.id },
    create: { buyer_id: buyer.id },
    update: {},
  });
}

async function getExistingCartForUser(clerkUserId: string) {
  return prisma.cart.findFirst({
    where: {
      buyer: {
        clerk_user_id: clerkUserId,
      },
    },
    select: { id: true },
  });
}

async function assertProductExists(productId: string) {
  const product = await getProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }
}
