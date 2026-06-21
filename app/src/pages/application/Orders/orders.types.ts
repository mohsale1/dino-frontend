import type { Order as _Order, OrderDetail as _OrderDetail } from '../../../services/application/order.service';

export type Order = _Order;
export type OrderDetail = _OrderDetail;

// ── Filter types ─────────────────────────────────────────────────────────────
export type StatusFilter = '' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type DateFilter = '' | 'today' | 'week' | 'month' | 'custom';
export type TableFilter = string; // table_number value or '' for all

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const ROWS_PER_PAGE = 20;
export const CANCELLABLE: Order['status'][] = ['pending', 'confirmed'];

// ── Stats interface ───────────────────────────────────────────────────────────
export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  orders_by_status: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    served: number;
    completed: number;
    cancelled: number;
  };
  avg_order_value: number;
  today_orders: number;
  today_revenue: number;
}

// ── Status visual config ──────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<Order['status'], {
  bg: string; color: string; border: string; dot: string; label: string;
}> = {
  pending:   { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#F97316', label: 'Pending' },
  confirmed: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6', label: 'Confirmed' },
  preparing: { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', dot: '#8B5CF6', label: 'Preparing' },
  ready:     { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', dot: '#22C55E', label: 'Ready' },
  completed: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#16A34A', label: 'Completed' },
  cancelled: { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3', dot: '#F43F5E', label: 'Cancelled' },
};

// ── Status flow (what action advances the order) ──────────────────────────────
export const STATUS_FLOW: Partial<Record<Order['status'], {
  next: Order['status'];
  label: string;
  color: string;
  btnBg: string;
}>> = {
  pending:   { next: 'confirmed', label: 'Confirm Order',   color: '#1D4ED8', btnBg: '#2563EB' },
  confirmed: { next: 'preparing', label: 'Start Preparing', color: '#6D28D9', btnBg: '#7C3AED' },
  preparing: { next: 'ready',     label: 'Mark Ready',      color: '#15803D', btnBg: '#16A34A' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatINR(value: number | undefined | null): string {
  return `₹${(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function toISODate(d: Date): string {
  // Format as YYYY-MM-DD in IST (UTC+5:30) to avoid date shifting
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split('T')[0];
}

/**
 * Convert a YYYY-MM-DD date string to an IST-aware ISO datetime string.
 * start=true  → YYYY-MM-DDT00:00:00+05:30  (beginning of day in IST)
 * start=false → YYYY-MM-DDT23:59:59+05:30  (end of day in IST)
 */
export function toISTDatetime(dateStr: string, start: boolean): string {
  const time = start ? 'T00:00:00+05:30' : 'T23:59:59+05:30';
  return `${dateStr}${time}`;
}


export function getDateRange(
  filter: DateFilter,
  customStart?: string,
  customEnd?: string,
): { startDate?: string; endDate?: string } {
  const now = new Date();

  if (filter === 'today') {
    const s = toISODate(now);
    return { startDate: toISTDatetime(s, true), endDate: toISTDatetime(s, false) };
  }
  if (filter === 'week') {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return {
      startDate: toISTDatetime(toISODate(from), true),
      endDate: toISTDatetime(toISODate(now), false),
    };
  }
  if (filter === 'month') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return {
      startDate: toISTDatetime(toISODate(from), true),
      endDate: toISTDatetime(toISODate(now), false),
    };
  }
  if (filter === 'custom') {
    return {
      startDate: customStart ? toISTDatetime(customStart, true) : undefined,
      endDate: customEnd ? toISTDatetime(customEnd, false) : undefined,
    };
  }
  return {};
}