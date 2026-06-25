'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { REFUND_REASON_VALUES } from '@/features/purchases/refund-reasons';
import {
  createPaymentDispute,
  getPaymentOrderStatus,
  PaymentsApiError,
} from '@/server/services/payments-api';
import {
  getBuyerPurchases,
  SellerApiError,
} from '@/server/services/seller-api';

const refundRequestSchema = z.object({
  orderId: z.string().trim().min(1),
  reason: z.enum(REFUND_REASON_VALUES),
  description: z.string().trim().min(10).max(1000),
});

const BLOCKED_REFUND_STATUSES = new Set(['DISPUTED', 'REFUNDED', 'COMPLETED']);

export type RefundRequestState = {
  status: 'idle' | 'success' | 'error';
  submissionId: number;
  message?: string;
  newStatus?: string;
  transactionId?: string;
};

export async function requestRefundDispute(
  previousState: RefundRequestState,
  formData: FormData,
): Promise<RefundRequestState> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return errorState(previousState, 'Sign in to request a refund.');
  }

  const parsed = refundRequestSchema.safeParse({
    orderId: formData.get('orderId'),
    reason: formData.get('reason'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return errorState(
      previousState,
      'Choose a reason and describe the issue in at least 10 characters.',
    );
  }

  try {
    const purchases = await getBuyerPurchases(userId);
    const order = purchases
      .flatMap((purchase) => purchase.orders)
      .find(({ orderId }) => orderId === parsed.data.orderId);

    if (!order) {
      return errorState(
        previousState,
        'We could not find this order in your account.',
      );
    }

    const currentPaymentStatus = await getPaymentOrderStatus(order.orderId);

    const normalizedStatus = currentPaymentStatus.status.toUpperCase();

    if (BLOCKED_REFUND_STATUSES.has(normalizedStatus)) {
      return errorState(
        previousState,
        getBlockedRefundMessage(normalizedStatus),
      );
    }

    const result = await createPaymentDispute({
      orderId: order.orderId,
      reason: parsed.data.reason,
      description: parsed.data.description,
    });

    revalidatePath('/purchases');

    return {
      status: 'success',
      submissionId: previousState.submissionId + 1,
      message: 'The refund dispute was opened for this seller order.',
      newStatus: result.newStatus,
      transactionId: result.transactionId,
    };
  } catch (error) {
    if (!(error instanceof PaymentsApiError) && !(error instanceof SellerApiError)) {
      console.error('Unexpected refund dispute error.', error);
    }

    return errorState(
      previousState,
      'We could not open the dispute. Try again.',
    );
  }
}

function getBlockedRefundMessage(status: string) {
  if (status === 'DISPUTED') {
    return 'This order already has a refund dispute in review.';
  }

  if (status === 'REFUNDED') {
    return 'This order was already refunded.';
  }

  if (status === 'COMPLETED') {
    return 'This order can no longer be disputed because the dispute was closed or the seller payout was completed.';
  }

  return 'This order cannot be disputed right now.';
}

function errorState(
  previousState: RefundRequestState,
  message: string,
): RefundRequestState {
  return {
    status: 'error',
    submissionId: previousState.submissionId + 1,
    message,
  };
}
