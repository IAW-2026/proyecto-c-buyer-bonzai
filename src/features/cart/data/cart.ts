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
  const product = await assertProductAvailable(productId);
  const cart = await getOrCreateCartForUser(clerkUserId);
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cart_id_product_id: {
        cart_id: cart.id,
        product_id: productId,
      },
    },
    select: { quantity: true },
  });

  if ((existingItem?.quantity ?? 0) >= product.stock) {
    throw new Error('Not enough stock available');
  }

  const item = await prisma.cartItem.upsert({
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

  await touchCart(cart.id);

  return item;
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

  const result = await prisma.cartItem.updateMany({
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

  if (result.count > 0) {
    await touchCart(cart.id);
  }
}

export async function removeCartProduct(
  clerkUserId: string,
  productId: string,
) {
  const cart = await getExistingCartForUser(clerkUserId);

  if (!cart) {
    return;
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      cart_id: cart.id,
      product_id: productId,
    },
  });

  if (result.count > 0) {
    await touchCart(cart.id);
  }
}

export async function clearCartForUser(clerkUserId: string) {
  const cart = await getExistingCartForUser(clerkUserId);

  if (!cart) {
    return;
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      cart_id: cart.id,
    },
  });

  if (result.count > 0) {
    await touchCart(cart.id);
  }
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

async function touchCart(cartId: string) {
  await prisma.cart.update({
    where: { id: cartId },
    data: { updated_at: new Date() },
  });
}

async function assertProductAvailable(productId: string) {
  const product = await getProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock <= 0) {
    throw new Error('Product is out of stock');
  }

  return product;
}
