/**
 * Table Types
 * 
 * Restaurant table types and interfaces.
 */

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'out_of_service';

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location?: string;
  venueId: string;
  qr_code: string;
  table_status: TableStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TableQRCode {
  table_id: string;
  qr_code: string;
  qr_code_url?: string;
  venueId: string;
  table_number: string;
}

export interface QRCodeVerification {
  table_id: string;
  venueId: string;
  table_number: string;
  is_valid: boolean;
}