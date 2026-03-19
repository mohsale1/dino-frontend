/**
 * Type Definitions Entry Point
 * 
 * Central export point for all application types organized by domain.
 */

// Common types (shared across domains)
export * from './common';

// Error types
export * from './error';

// Authentication & Authorization
export * from './auth';

// User domain
export * from './user';

// Workspace domain
export * from './workspace';

// Venue domain
export * from './venue';

// Catalog domain (menu items & categories)
export * from './catalog';

// Location domain (tables & service areas)
export * from './location';

// Order domain (orders, cart, payment)
export * from './order';

// Dashboard & Analytics
export * from './dashboard';

// Notifications
export * from './notification';
