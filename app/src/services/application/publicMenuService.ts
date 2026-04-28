/**
 * Public Menu Service
 * Handles API calls for the public-facing QR menu page.
 *
 * All endpoints are unauthenticated — no token required.
 *
 * Base URL: API_CONFIG.BASE_URL  (resolves to /api/v1)
 *
 * Menu routes:
 *   GET /menu/public/validate-qr-access                          ?qr_code
 *   GET /menu/public/venues/{venue_id}/menu-with-validation      ?table_id
 *   GET /menu/public/venues/{venue_id}/categories                ?table_id
 *   GET /menu/public/venues/{venue_id}/items                     ?category_id, table_id
 *
 * Order routes:
 *   GET  /orders/public/qr/{qr_code}
 *   GET  /orders/public/venue/{venue_id}/status
 *   POST /orders/public/validate-order
 *   POST /orders/public/create-order
 *   GET  /orders/public/{order_id}/status
 *   GET  /orders/public/{order_id}/receipt
 *   POST /orders/public/{order_id}/feedback                      ?rating, feedback
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

export interface QrAccessValidation {
  valid: boolean;
  venue_id?: string;
  table_id?: string;
  message?: string;
}

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

export interface PublicMenuWithValidation {
  venue: PublicVenueInfo;
  table?: PublicTableInfo;
  categories: PublicCategory[];
  items: PublicMenuItem[];
}

export interface OrderItemPayload {
  item_id: string;
  quantity: number;
}

export interface ValidateOrderPayload {
  venue_id: string;
  items: OrderItemPayload[];
  table_id?: string;
}

export interface ValidateOrderResult {
  valid: boolean;
  errors?: string[];
  total_amount?: number;
}

export interface CreateOrderPayload {
  venue_id: string;
  items: OrderItemPayload[];
  table_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
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

export interface PublicOrderStatus {
  order_id: string;
  status: string;
  payment_status: string;
  updated_at: string;
}

export interface PublicOrderReceipt {
  order: PublicOrder;
  receipt_url?: string;
}

export interface VenueOrderStatus {
  venue_id: string;
  is_accepting_orders: boolean;
  message?: string;
}

export interface QrOrderInfo {
  qr_code: string;
  venue_id: string;
  table_id?: string;
  venue_name?: string;
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

// ─── Service ──────────────────────────────────────────────────────────────────

class PublicMenuService {

  /**
   * Validate a QR code and retrieve the associated venue/table context.
   *
   * GET /menu/public/validate-qr-access?qr_code={qr_code}
   */
  async validateQrAccess(qrCode: string): Promise<QrAccessValidation> {
    const res = await publicAxios.get('/menu/public/validate-qr-access', {
      params: { qr_code: qrCode },
    });
    return unwrap(res);
  }

  /**
   * Fetch the full menu for a venue, with optional table-level validation.
   *
   * GET /menu/public/venues/{venue_id}/menu-with-validation?table_id={table_id}
   */
  async getMenuWithValidation(venueId: string, tableId?: string): Promise<PublicMenuWithValidation> {
    const params: Record<string, string> = {};
    if (tableId) params.table_id = tableId;

    const res = await publicAxios.get(`/menu/public/venues/${venueId}/menu-with-validation`, { params });
    const payload = unwrap(res);

    return {
      venue:      normalizeVenue(payload?.venue ?? payload?.organization),
      table:      payload?.table ? normalizeTable(payload.table) : undefined,
      categories: normalizeCategories(payload?.categories ?? []),
      items:      normalizeItems(payload?.items ?? []),
    };
  }

  /**
   * Fetch categories for a venue.
   *
   * GET /menu/public/venues/{venue_id}/categories?table_id={table_id}
   */
  async getCategories(venueId: string, tableId?: string): Promise<PublicCategory[]> {
    const params: Record<string, string> = {};
    if (tableId) params.table_id = tableId;

    const res = await publicAxios.get(`/menu/public/venues/${venueId}/categories`, { params });
    return normalizeCategories(unwrap(res));
  }

  /**
   * Fetch menu items for a venue, optionally filtered by category.
   *
   * GET /menu/public/venues/{venue_id}/items?category_id={category_id}&table_id={table_id}
   */
  async getItems(venueId: string, categoryId?: string, tableId?: string): Promise<PublicMenuItem[]> {
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    if (tableId)    params.table_id    = tableId;

    const res = await publicAxios.get(`/menu/public/venues/${venueId}/items`, { params });
    return normalizeItems(unwrap(res));
  }

  /**
   * Retrieve venue and table context from a QR code string.
   *
   * GET /orders/public/qr/{qr_code}
   */
  async getQrInfo(qrCode: string): Promise<QrOrderInfo> {
    const res = await publicAxios.get(`/orders/public/qr/${qrCode}`);
    return unwrap(res);
  }

  /**
   * Check whether a venue is currently accepting orders.
   *
   * GET /orders/public/venue/{venue_id}/status
   */
  async getVenueOrderStatus(venueId: string): Promise<VenueOrderStatus> {
    const res = await publicAxios.get(`/orders/public/venue/${venueId}/status`);
    return unwrap(res);
  }

  /**
   * Validate a prospective order (items, availability, totals) without placing it.
   *
   * POST /orders/public/validate-order
   */
  async validateOrder(payload: ValidateOrderPayload): Promise<ValidateOrderResult> {
    const res = await publicAxios.post('/orders/public/validate-order', payload);
    return unwrap(res);
  }

  /**
   * Place a new order.
   *
   * POST /orders/public/create-order
   */
  async createOrder(payload: CreateOrderPayload): Promise<PublicOrder> {
    const res = await publicAxios.post('/orders/public/create-order', payload);
    return unwrap(res);
  }

  /**
   * Poll the status of an existing order.
   *
   * GET /orders/public/{order_id}/status
   */
  async getOrderStatus(orderId: string): Promise<PublicOrderStatus> {
    const res = await publicAxios.get(`/orders/public/${orderId}/status`);
    return unwrap(res);
  }

  /**
   * Retrieve the receipt for a completed order.
   *
   * GET /orders/public/{order_id}/receipt
   */
  async getOrderReceipt(orderId: string): Promise<PublicOrderReceipt> {
    const res = await publicAxios.get(`/orders/public/${orderId}/receipt`);
    return unwrap(res);
  }

  /**
   * Submit customer feedback for a completed order.
   *
   * POST /orders/public/{order_id}/feedback?rating={rating}&feedback={feedback}
   */
  async submitFeedback(orderId: string, rating: number, feedback?: string): Promise<void> {
    const params: Record<string, string | number> = { rating };
    if (feedback) params.feedback = feedback;

    await publicAxios.post(`/orders/public/${orderId}/feedback`, null, { params });
  }

}

export const publicMenuService = new PublicMenuService();
export default publicMenuService;
