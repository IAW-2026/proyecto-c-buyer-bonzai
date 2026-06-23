'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { REFUND_REASON_VALUES } from '@/features/purchases/refund-reasons';
import {
  createPaymentDispute,
  PaymentsApiError,
} from '@/server/services/payments-api';
import {
  getBuyerPurchases,
  SellerApiError,
} from '@/server/services/seller-api';

const refundRequestSchema = z.object({
  purchaseId: z.string().trim().min(1),
  reason: z.enum(REFUND_REASON_VALUES),
  description: z.string().trim().min(10).max(1000),
});

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
    purchaseId: formData.get('purchaseId'),
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
    const purchase = purchases.find(
      ({ purchaseId }) => purchaseId === parsed.data.purchaseId,
    );

    if (!purchase) {
      return errorState(
        previousState,
        'We could not find this purchase in your account.',
      );
    }

    const orderIds = purchase.orders.map(({ orderId }) => orderId);

    if (orderIds.length === 0) {
      return errorState(
        previousState,
        'We could not find orders for this purchase.',
      );
    }

    const results = await Promise.all(
      orderIds.map((orderId) =>
        createPaymentDispute({
          orderId,
          reason: parsed.data.reason,
          description: parsed.data.description,
        }),
      ),
    );

    revalidatePath('/purchases');

    return {
      status: 'success',
      submissionId: previousState.submissionId + 1,
      message: 'The transaction was disputed successfully.',
      newStatus: results[0]?.newStatus ?? 'DISPUTED',
      transactionId: results[0]?.transactionId,
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
