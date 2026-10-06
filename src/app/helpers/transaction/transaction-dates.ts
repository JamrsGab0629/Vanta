type DateLike = string | Date | null | undefined;

// Only the fields these helpers read. Your backend sets `updated_at` and uses
// `receipt_date`, so those come first; the camelCase names are a fallback.
export interface TransactionDates {
  status: string;
  created_at?: DateLike;
  updated_at?: DateLike;
  createdAt?: DateLike;
  updatedAt?: DateLike;
  Receipt?: {
    receipt_date?: DateLike;
    created_at?: DateLike;
    createdAt?: DateLike;
  };
}

// Same style as the admin console: Oct 2, 2026, 9:19 AM
export const DATE_FORMAT = 'MMM d, y, h:mm a';

// When the customer placed the order (the receipt is created at checkout)
export function orderedAt(t: TransactionDates): DateLike {
  return (
    t.Receipt?.receipt_date ??
    t.Receipt?.created_at ??
    t.Receipt?.createdAt ??
    t.created_at ??
    t.createdAt ??
    null
  );
}

// When the status last changed
export function lastUpdateAt(t: TransactionDates): DateLike {
  return t.updated_at ?? t.updatedAt ?? null;
}

const FINAL_LABELS: Record<string, string> = {
  delivered: 'DELIVERED',
  completed: 'DELIVERED',
  cancelled: 'CANCELLED',
  failed: 'FAILED',
  refunded: 'REFUNDED',
};

// For finished transactions: what happened and when. Returns null while the
// order is still pending or on its way, so we never claim a delivery that
// hasn't happened (and never label a cancellation as "delivered").
export function finalEvent(t: TransactionDates): { label: string; date: DateLike } | null {
  const label = FINAL_LABELS[t.status.toLowerCase()];
  const date = lastUpdateAt(t);
  return label && date ? { label, date } : null;
}