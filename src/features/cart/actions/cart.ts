'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addProductToCart,
  decrementCartProduct,
  incrementCartProduct,
  removeCartProduct,
} from '@/features/cart/data/cart';

export type AddCartItemState = {
  status: 'idle' | 'success';
  submissionId: number;
};

export async function addCartItem(formData: FormData) {
  const userId = await requireUserId();
  const productId = readProductId(formData);

  await addProductToCart(userId, productId);
  revalidateCartPaths();
}

export async function addCartItemWithState(
  previousState: AddCartItemState,
  formData: FormData,
): Promise<AddCartItemState> {
  await addCartItem(formData);

  return {
    status: 'success',
    submissionId: previousState.submissionId + 1,
  };
}

export async function incrementCartItem(formData: FormData) {
  const userId = await requireUserId();
  const productId = readProductId(formData);

  await incrementCartProduct(userId, productId);
  revalidateCartPaths();
}

export async function incrementCartItemById(productId: string) {
  const userId = await requireUserId();
  const safeProductId = validateProductId(productId);

  await incrementCartProduct(userId, safeProductId);
  revalidateCartPaths();
}

export async function decrementCartItem(formData: FormData) {
  const userId = await requireUserId();
  const productId = readProductId(formData);

  await decrementCartProduct(userId, productId);
  revalidateCartPaths();
}

export async function decrementCartItemById(productId: string) {
  const userId = await requireUserId();
  const safeProductId = validateProductId(productId);

  await decrementCartProduct(userId, safeProductId);
  revalidateCartPaths();
}

export async function removeCartItem(formData: FormData) {
  const userId = await requireUserId();
  const productId = readProductId(formData);

  await removeCartProduct(userId, productId);
  revalidateCartPaths();
}

export async function removeCartItemById(productId: string) {
  const userId = await requireUserId();
  const safeProductId = validateProductId(productId);

  await removeCartProduct(userId, safeProductId);
  revalidateCartPaths();
}

async function requireUserId() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect('/sign-in');
  }

  return userId;
}

function readProductId(formData: FormData) {
  const productId = formData.get('productId');

  if (typeof productId !== 'string') {
    throw new Error('Missing product id');
  }

  return validateProductId(productId);
}

function validateProductId(productId: string) {
  const safeProductId = productId.trim();

  if (safeProductId.length === 0) {
    throw new Error('Missing product id');
  }

  return safeProductId;
}

function revalidateCartPaths() {
  revalidatePath('/cart');
}
