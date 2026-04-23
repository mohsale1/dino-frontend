import type { Order as _Order, OrderDetail as _OrderDetail } from '../../../services/application/order.service';

export type Order = _Order;
export type OrderDetail = _OrderDetail;

// ── Filter types ─────────────────────────────────────────────────────────────
export type StatusFilter = '' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type DateFilter = '' | 'today' | 'week' | 'month';

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
  served:    { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', dot: '#0EA5E9', label: 'Served' },
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
  ready:     { next: 'served',    label: 'Mark Served',     color: '#0369A1', btnBg: '#0284C7' },
  served:    { next: 'completed', label: 'Complete Order',  color: '#166534', btnBg: '#15803D' },
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
  return d.toISOString().split('T')[0];
}

export function getDateRange(filter: DateFilter): { startDate?: string; endDate?: string } {
  const now = new Date();
  if (filter === 'today') { const s = toISODate(now); return { startDate: s, endDate: s }; }
  if (filter === 'week') { const s = new Date(now); s.setDate(s.getDate() - 7); return { startDate: toISODate(s), endDate: toISODate(now) }; }
  if (filter === 'month') { const s = new Date(now); s.setDate(s.getDate() - 30); return { startDate: toISODate(s), endDate: toISODate(now) }; }
  return {};
}
