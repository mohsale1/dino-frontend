import { useState, useCallback } from 'react';
import { PublicOrder } from '../../../../services/application/publicMenuService';

const STORAGE_KEY = 'dino_qr_orders';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
}

interface OrderStorageStats {
  count: number;
  totalRevenue: number;
  statuses: Record<string, number>;
  orders: StoredOrder[];
}

// ---------------------------------------------------------------------------
// Pure helpers (no React dependency)
// ---------------------------------------------------------------------------

function readRaw(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(orders: StoredOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // localStorage may be unavailable (private browsing quota, etc.)
  }
}

function isExpired(order: StoredOrder): boolean {
  return new Date(order.expires_at).getTime() <= Date.now();
}

function pruneExpired(orders: StoredOrder[]): StoredOrder[] {
  return orders.filter((o) => !isExpired(o));
}

function computeStats(orders: StoredOrder[]): OrderStorageStats {
  const statuses: Record<string, number> = {};
  let totalRevenue = 0;

  for (const order of orders) {
    totalRevenue += order.total_amount;
    statuses[order.status] = (statuses[order.status] ?? 0) + 1;
  }

  return {
    count: orders.length,
    totalRevenue,
    statuses,
    orders,
  };
}

// ---------------------------------------------------------------------------
// Standalone function — no React, safe to call outside component lifecycle
// ---------------------------------------------------------------------------

export function getQROrderStats(): OrderStorageStats {
  const active = pruneExpired(readRaw());
  writeRaw(active); // persist pruned list
  return computeStats(active);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOrderStorage() {
  const [stats, setStats] = useState<OrderStorageStats>(() => {
    const active = pruneExpired(readRaw());
    writeRaw(active);
    return computeStats(active);
  });

  const clearExpired = useCallback((): void => {
    const active = pruneExpired(readRaw());
    writeRaw(active);
    setStats(computeStats(active));
  }, []);

  const getStats = useCallback((): OrderStorageStats => {
    const active = pruneExpired(readRaw());
    writeRaw(active);
    const computed = computeStats(active);
    setStats(computed);
    return computed;
  }, []);

  const storeOrder = useCallback((order: PublicOrder): void => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TTL_MS);

    const entry: StoredOrder = {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at ?? now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    const existing = pruneExpired(readRaw());

    // Deduplicate by id — update in place if already stored
    const idx = existing.findIndex((o) => o.id === entry.id);
    if (idx !== -1) {
      existing[idx] = entry;
    } else {
      existing.push(entry);
    }

    writeRaw(existing);
    setStats(computeStats(existing));
  }, []);

  return { storeOrder, getStats, clearExpired, stats };
}
