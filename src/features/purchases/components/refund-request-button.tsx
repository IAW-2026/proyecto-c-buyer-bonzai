'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import {
  requestRefundDispute,
  type RefundRequestState,
} from '@/features/purchases/actions/refund';
import { REFUND_REASON_OPTIONS } from '@/features/purchases/refund-reasons';

const initialRefundRequestState: RefundRequestState = {
  status: 'idle',
  submissionId: 0,
};

type RefundRequestButtonProps = {
  disabled?: boolean;
  purchaseId: string;
};

export function RefundRequestButton({
  disabled = false,
  purchaseId,
}: RefundRequestButtonProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const helpId = useId();
  const reasonId = useId();
  const descriptionId = useId();
  const [state, formAction, isPending] = useActionState(
    requestRefundDispute,
    initialRefundRequestState,
  );
  const requested = state.status === 'success';
  const isDisabled = disabled || requested;

  useEffect(() => {
    if (state.status === 'success') {
      dialogRef.current?.close();
    }
  }, [state.status, state.submissionId]);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!isPending) {
      dialogRef.current?.close();
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        disabled={isDisabled}
        onClick={openDialog}
        className="inline-flex justify-center rounded-sm bg-primary px-7 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-outline"
        aria-label={`Request refund for ${purchaseId}`}
      >
        {requested ? 'Refund requested' : 'Request refund'}
      </button>

      {state.status === 'success' ? (
        <p
          className="max-w-72 text-left text-xs leading-5 text-secondary sm:text-right"
          role="status"
        >
          {state.message} Status: {state.newStatus ?? 'DISPUTED'}.
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={helpId}
        onCancel={closeDialog}
        className="w-[calc(100%-2rem)] max-w-xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_rgb(27_28_25/0.16)] backdrop:bg-on-surface/30 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="p-6 text-left sm:p-8">
          <input type="hidden" name="purchaseId" value={purchaseId} />
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
            Refund request
          </p>
          <h3
            id={titleId}
            className="mt-3 font-headline text-4xl leading-none tracking-[-0.04em] text-primary"
          >
            Tell us what happened
          </h3>
          <p
            id={helpId}
            className="mt-4 text-sm leading-7 text-secondary"
          >
            Choose a reason and describe the issue. Bonzai will open a payment
            dispute and mark the transaction as disputed when the request is
            accepted.
          </p>

          <div className="mt-7 grid gap-5">
            <label className="grid gap-2" htmlFor={reasonId}>
              <span className="font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
                Reason
              </span>
              <select
                id={reasonId}
                name="reason"
                required
                defaultValue={REFUND_REASON_OPTIONS[0].value}
                disabled={isPending}
                className="min-h-12 rounded-sm border border-outline-variant bg-surface px-4 font-body text-sm text-primary outline-none transition focus:border-primary disabled:cursor-wait disabled:opacity-60"
              >
                {REFUND_REASON_OPTIONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2" htmlFor={descriptionId}>
              <span className="font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
                Description
              </span>
              <textarea
                id={descriptionId}
                name="description"
                required
                minLength={10}
                maxLength={1000}
                rows={5}
                disabled={isPending}
                placeholder="Example: The ceramic planter arrived cracked and the plant had damaged leaves."
                className="min-h-36 resize-y rounded-sm border border-outline-variant bg-surface px-4 py-3 font-body text-sm leading-6 text-primary outline-none transition placeholder:text-outline focus:border-primary disabled:cursor-wait disabled:opacity-60"
              />
            </label>
          </div>

          {state.status === 'error' ? (
            <p
              className="mt-5 text-sm font-medium leading-6 text-error"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-7 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? 'Opening dispute...' : 'Open dispute'}
            </button>
            <button
              type="button"
              onClick={closeDialog}
              disabled={isPending}
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-surface-container-high px-7 py-3 font-label text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
