/**
 * Public Menu Service
 * Handles API calls for the public-facing QR menu page.
 *
 * All endpoints are unauthenticated — no token required.
 *
 * Base URL: API_CONFIG.BASE_URL  (resolves to /api/v1)
 *
 * Routes:
 *   GET  /application/public/menu/{workspaceId}/{personaId}  ?table_id
 *   POST /application/public/orders
 *   GET  /application/public/orders/{orderId}                ?workspace_id, persona_id
 *   GET  /application/public/orders                          ?workspace_id, persona_id, customer_phone
 *
 * Status codes:
 *   200 = success
 *   403 = venue closed (persona.is_open = false)
 *   404 = not found
 *   410 = persona deactivated
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';

// ─── Axios instance ───────────────────────────────────────────────────────────

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

export interface PublicVenueInfo {
  id: string;
  name: string;
  description?: string;
}

export interface PublicTableInfo {
  id: string;
  table_number: string;
  capacity: number;
  area_id?: string;
  status?: string;
}

export interface BillingConfig {
  tax_rate: number;
  tax_label: string;
  service_charge_rate: number;
  service_charge_label: string;
  discount_rate: number;
  currency: string;
}

const BILLING_DEFAULTS: BillingConfig = {
  tax_rate: 0,
  tax_label: 'Tax',
  service_charge_rate: 0,
  service_charge_label: 'Service Charge',
  discount_rate: 0,
  currency: 'INR',
};

export interface PublicMenuWithValidation {
  venue: PublicVenueInfo;
  persona: PublicVenueInfo;
  table?: PublicTableInfo;
  categories: PublicCategory[];
  items: PublicMenuItem[];
  billing_config: BillingConfig;
}

export interface OrderItemPayload {
  item_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  workspace_id: string;
  persona_id: string;
  table_id?: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItemPayload[];
  special_instructions?: string;
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
  venue_id: string;
  table_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
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

// ─── Normalizers ──────────────────────────────────────────────────────────────

function unwrap(res: any): any {
  return res?.data?.data ?? res?.data;
}

function normalizeVenue(raw: any): PublicVenueInfo {
  return {
    id:          raw?.id          ?? '',
    name:        raw?.name        ?? 'Restaurant',
    description: raw?.description,
  };
}

function normalizeTable(raw: any): PublicTableInfo {
  return {
    id:           raw?.id           ?? '',
    table_number: raw?.table_number ?? raw?.tableNumber ?? raw?.name ?? String(raw?.id ?? ''),
    capacity:     Number(raw?.capacity ?? raw?.seats ?? 1),
    area_id:      raw?.area_id ?? raw?.areaId,
    status:       raw?.status,
  };
}

function normalizeCategories(raw: any): PublicCategory[] {
  const arr: any[] = Array.isArray(raw) ? raw : (raw?.items ?? raw?.results ?? []);
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
  const arr: any[] = Array.isArray(raw) ? raw : (raw?.items ?? raw?.results ?? []);
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

class PublicMenuService {

  /**
   * Fetch the full menu for a workspace/persona, with optional table context.
   *
   * GET /application/public/menu/{workspaceId}/{personaId}?table_id={tableId}
   *
   * Throws with err.response.status:
   *   200 = success
   *   403 = venue closed (persona.is_open = false)
   *   404 = not found
   *   410 = persona deactivated
   */
  async getMenu(workspaceId: string, personaId: string, tableId?: string): Promise<PublicMenuWithValidation> {
    const params: Record<string, string> = {};
    if (tableId) params.table_id = tableId;

    const res = await publicAxios.get(`/application/public/menu/${workspaceId}/${personaId}`, { params });
    const payload = unwrap(res);

    const rawBilling = payload?.billing_config ?? payload?.billingConfig ?? {};
    const billing_config: BillingConfig = {
      tax_rate:             Number(rawBilling?.tax_rate             ?? BILLING_DEFAULTS.tax_rate),
      tax_label:            rawBilling?.tax_label                   ?? BILLING_DEFAULTS.tax_label,
      service_charge_rate:  Number(rawBilling?.service_charge_rate  ?? BILLING_DEFAULTS.service_charge_rate),
      service_charge_label: rawBilling?.service_charge_label        ?? BILLING_DEFAULTS.service_charge_label,
      discount_rate:        Number(rawBilling?.discount_rate        ?? BILLING_DEFAULTS.discount_rate),
      currency:             rawBilling?.currency                    ?? BILLING_DEFAULTS.currency,
    };

    return {
      venue:      normalizeVenue(payload?.workspace ?? payload?.venue ?? payload?.organization),
      persona:    normalizeVenue(payload?.persona ?? payload?.venue),
      table:      payload?.table ? normalizeTable(payload.table) : undefined,
      categories: normalizeCategories(payload?.categories ?? []),
      items:      normalizeItems(payload?.items ?? []),
      billing_config,
    };
  }

  /**
   * Place a new order.
   *
   * POST /application/public/orders
   */
  async createOrder(payload: CreateOrderPayload): Promise<PublicOrder> {
    const res = await publicAxios.post('/application/public/orders', payload);
    return unwrap(res);
  }

  /**
   * Poll the status of an existing order.
   *
   * GET /application/public/orders/{orderId}?workspace_id=&persona_id=
   */
  async getOrderStatus(orderId: string, workspaceId: string, personaId: string): Promise<PublicOrder> {
    const res = await publicAxios.get(`/application/public/orders/${orderId}`, {
      params: { workspace_id: workspaceId, persona_id: personaId },
    });
    return unwrap(res);
  }

  /**
   * Fetch all orders for a customer phone number.
   *
   * GET /application/public/orders?workspace_id=&persona_id=&customer_phone=
   */
  async getOrdersByPhone(workspaceId: string, personaId: string, phone: string): Promise<PublicOrder[]> {
    const res = await publicAxios.get('/application/public/orders', {
      params: { workspace_id: workspaceId, persona_id: personaId, customer_phone: phone },
    });
    const data = unwrap(res);
    return Array.isArray(data) ? data : (data?.items ?? data?.results ?? []);
  }

}

export const publicMenuService = new PublicMenuService();
export default publicMenuService;
