/**
 * Public Menu Service
 * Handles API calls for the public-facing QR menu page.
 *
 * All endpoints below are truly public — no authentication token required.
 *
 * Public endpoint pattern (backend /application/menu router):
 *   GET /application/menu/public/{orgId}/{tableId}/menu
 *   GET /application/menu/public/{orgId}/{tableId}/categories
 *   GET /application/menu/public/{orgId}/{tableId}/items
 *
 * Order endpoints (/application/orders router):
 *   POST /application/orders/public/{orgId}/{tableId}/create
 *   GET  /application/orders/public/{orgId}/{tableId}/orders
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';

// ─── Axios instance ───────────────────────────────────────────────────────────

// Unauthenticated instance — all public endpoints, no token needed
const publicAxios = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Refresh base URL from runtime config on first use
let baseUrlInitialized = false;
publicAxios.interceptors.request.use((config) => {
  if (!baseUrlInitialized) {
    const runtimeConfig = (window as any).APP_CONFIG;
    if (runtimeConfig?.API_BASE_URL) {
      config.baseURL = runtimeConfig.API_BASE_URL;
    }
    baseUrlInitialized = true;
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicCategory {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  is_available: boolean;
  display_order?: number;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  workspace_id: string;
  price: number;
  is_available: boolean;
  is_vegetarian?: boolean;
  display_order?: number;
  image_urls?: string[];
  preparation_time_minutes?: number;
}

export interface PublicTableInfo {
  id: string;
  table_number: string;
  capacity: number;
  area_id?: string;
  status?: string;
}

export interface PublicOrganizationInfo {
  id: string;
  name: string;
  description?: string;
}

export interface PublicMenuData {
  organization: PublicOrganizationInfo;
  table: PublicTableInfo;
  categories: PublicCategory[];
  items: PublicMenuItem[];
}

export interface PublicOrderItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PublicOrder {
  id: string;
  order_number: string;
  organization_id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  items: PublicOrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  status: string;
  payment_status: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaceOrderPayload {
  customer_name: string;
  customer_phone: string;
  items: { item_id: string; item_name: string; quantity: number; unit_price: number; total_price: number }[];
  special_instructions?: string;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeTable(raw: any): PublicTableInfo {
  return {
    id:           raw?.id           ?? '',
    table_number: raw?.table_number ?? raw?.tableNumber ?? raw?.name ?? String(raw?.id ?? ''),
    capacity:     Number(raw?.capacity ?? raw?.seats ?? 1),
    area_id:      raw?.area_id ?? raw?.areaId,
    status:       raw?.status,
  };
}

function normalizeOrg(raw: any): PublicOrganizationInfo {
  return {
    id:          raw?.id          ?? '',
    name:        raw?.name        ?? 'Restaurant',
    description: raw?.description,
  };
}

function normalizeCategories(raw: any): PublicCategory[] {
  const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.results ?? []);
  return arr.map((c: any) => ({
    id:            c.id            ?? '',
    name:          c.name          ?? '',
    description:   c.description,
    workspace_id:  c.workspace_id  ?? c.workspaceId ?? c.organization_id ?? '',
    is_available:  c.is_available  ?? c.isAvailable ?? true,
    display_order: c.display_order ?? c.displayOrder,
  }));
}

function normalizeItems(raw: any): PublicMenuItem[] {
  const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.results ?? []);
  return arr.map((i: any) => ({
    id:                       i.id                       ?? '',
    name:                     i.name                     ?? '',
    description:              i.description,
    category_id:              i.category_id              ?? i.categoryId ?? '',
    workspace_id:             i.workspace_id             ?? i.workspaceId ?? i.organization_id ?? '',
    price:                    Number(i.price             ?? i.unit_price ?? 0),
    is_available:             i.is_available             ?? i.isAvailable ?? true,
    is_vegetarian:            i.is_vegetarian            ?? i.isVegetarian,
    display_order:            i.display_order            ?? i.displayOrder,
    image_urls:               i.image_urls               ?? i.imageUrls ?? [],
    preparation_time_minutes: i.preparation_time_minutes ?? i.prepTime,
  }));
}

// ─── Service ──────────────────────────────────────────────────────────────────

class PublicMenuService {

  /**
   * Fetch all menu data for a given organization and table in a single request.
   *
   * Calls: GET /application/menu/public/{organizationId}/{tableId}/menu
   * Response shape: { success, data: { organization, table, area, categories, items, items_by_category } }
   */
  async getMenuData(organizationId: string, tableId: string): Promise<PublicMenuData> {
    const res = await publicAxios.get(
      `/application/menu/public/${organizationId}/${tableId}/menu`,
    );

    // Unwrap envelope: response.data.data
    const payload = res.data?.data ?? res.data;

    return {
      organization: normalizeOrg(payload.organization),
      table:        normalizeTable(payload.table),
      categories:   normalizeCategories(payload.categories ?? []),
      items:        normalizeItems(payload.items ?? []),
    };
  }

  /**
   * Fetch orders for a specific table, optionally filtered by customer phone.
   *
   * Calls: GET /application/orders/public/{organizationId}/{tableId}/orders
   */
  async getOrders(
    organizationId: string,
    tableId: string,
    customerPhone?: string,
  ): Promise<PublicOrder[]> {
    const params: Record<string, any> = {};
    if (customerPhone) params.customer_phone = customerPhone;

    try {
      const res = await publicAxios.get(
        `/application/orders/public/${organizationId}/${tableId}/orders`,
        { params },
      );
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  }

  /**
   * Place a new order for a specific table.
   *
   * Calls: POST /application/orders/public/{organizationId}/{tableId}/create
   */
  async placeOrder(
    organizationId: string,
    tableId: string,
    payload: PlaceOrderPayload,
  ): Promise<PublicOrder> {
    const res = await publicAxios.post(
      `/application/orders/public/${organizationId}/${tableId}/create`,
      payload,
    );
    return res.data?.data ?? res.data;
  }
}

export const publicMenuService = new PublicMenuService();
export default publicMenuService;