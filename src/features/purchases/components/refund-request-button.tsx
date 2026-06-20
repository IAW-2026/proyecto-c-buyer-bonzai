'use client';

import { useState } from 'react';

type RefundRequestButtonProps = {
  disabled?: boolean;
  purchaseId: string;
};

export function RefundRequestButton({
  disabled = false,
  purchaseId,
}: RefundRequestButtonProps) {
  const [requested, setRequested] = useState(false);
  const isDisabled = disabled || requested;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => setRequested(true)}
      className="inline-flex cursor-pointer justify-center rounded-sm bg-primary px-7 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-outline"
      aria-label={`Request refund for ${purchaseId}`}
    >
      {requested ? 'Refund requested' : 'Request refund'}
    </button>
  );
}
