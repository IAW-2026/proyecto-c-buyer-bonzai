export const REFUND_REASON_OPTIONS = [
  { value: 'ITEM_DAMAGED', label: 'Item damaged' },
  { value: 'ITEM_NOT_RECEIVED', label: 'Item not received' },
  { value: 'WRONG_ITEM', label: 'Wrong item' },
  { value: 'QUALITY_ISSUE', label: 'Quality issue' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type RefundReason = (typeof REFUND_REASON_OPTIONS)[number]['value'];

export const REFUND_REASON_VALUES = REFUND_REASON_OPTIONS.map(
  ({ value }) => value,
) as [RefundReason, ...RefundReason[]];
