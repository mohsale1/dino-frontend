/**
 * Customer Data Validation
 * 
 * Centralized validation for customer information used across:
 * - Registration
 * - Order checkout
 * - User profile updates
 * - Customer management
 */

import { validators, validateForm, type ValidationRules, type ValidationResult } from './index';

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
}

export interface CustomerFormData extends CustomerData {
  specialInstructions?: string;
}

/**
 * Validation rules for customer data
 */
export const CUSTOMER_VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: true,
    pattern: /^[a-zA-Z\s.'-]+$/,
    errorMessage: 'Name can only contain letters, spaces, and common punctuation (. \' -)'
  },
  phone: {
    required: true,
    pattern: /^[0-9]{10}$/,
    errorMessage: 'Phone number must be exactly 10 digits'
  },
  email: {
    required: false,
    maxLength: 254,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    errorMessage: 'Please enter a valid email address'
  },
  specialInstructions: {
    required: false,
    maxLength: 500,
    errorMessage: 'Special instructions must not exceed 500 characters'
  }
} as const;

/**
 * Validate customer name
 */
export const validateCustomerName = (name: string): ValidationResult => {
  const rules = CUSTOMER_VALIDATION_RULES.name;
  
  // Required check
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }
  
  // Length check
  if (name.length < rules.minLength) {
    return { isValid: false, error: `Name must be at least ${rules.minLength} characters` };
  }
  
  if (name.length > rules.maxLength) {
    return { isValid: false, error: `Name must not exceed ${rules.maxLength} characters` };
  }
  
  // Pattern check
  if (!rules.pattern.test(name)) {
    return { isValid: false, error: rules.errorMessage };
  }
  
  return { isValid: true };
};

/**
 * Validate customer phone number
 */
export const validateCustomerPhone = (phone: string): ValidationResult => {
  const rules = CUSTOMER_VALIDATION_RULES.phone;
  
  // Required check
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Pattern check
  if (!rules.pattern.test(digitsOnly)) {
    return { isValid: false, error: rules.errorMessage };
  }
  
  return { isValid: true };
};

/**
 * Validate customer email (optional)
 */
export const validateCustomerEmail = (email?: string): ValidationResult => {
  const rules = CUSTOMER_VALIDATION_RULES.email;
  
  // Email is optional
  if (!email || email.trim() === '') {
    return { isValid: true };
  }
  
  // Length check
  if (email.length > rules.maxLength) {
    return { isValid: false, error: `Email must not exceed ${rules.maxLength} characters` };
  }
  
  // Pattern check
  if (!rules.pattern.test(email)) {
    return { isValid: false, error: rules.errorMessage };
  }
  
  return { isValid: true };
};

/**
 * Validate special instructions (optional)
 */
export const validateSpecialInstructions = (instructions?: string): ValidationResult => {
  const rules = CUSTOMER_VALIDATION_RULES.specialInstructions;
  
  // Special instructions are optional
  if (!instructions || instructions.trim() === '') {
    return { isValid: true };
  }
  
  // Length check
  if (instructions.length > rules.maxLength) {
    return { isValid: false, error: rules.errorMessage };
  }
  
  return { isValid: true };
};

/**
 * Create validation rules for customer form
 */
export const createCustomerValidationRules = (): ValidationRules<CustomerFormData> => ({
  name: [
    validators.required('Name'),
    validators.minLength(CUSTOMER_VALIDATION_RULES.name.minLength, 'Name'),
    validators.maxLength(CUSTOMER_VALIDATION_RULES.name.maxLength, 'Name'),
    validators.pattern(
      CUSTOMER_VALIDATION_RULES.name.pattern,
      'Name',
      CUSTOMER_VALIDATION_RULES.name.errorMessage
    ),
  ],
  phone: [
    validators.required('Phone number'),
    (value: string) => validateCustomerPhone(value),
  ],
  email: [
    (value?: string) => validateCustomerEmail(value),
  ],
  specialInstructions: [
    (value?: string) => validateSpecialInstructions(value),
  ],
});

/**
 * Validate entire customer form
 */
export const validateCustomerForm = (data: CustomerFormData): { 
  isValid: boolean; 
  errors: Partial<Record<keyof CustomerFormData, string>> 
} => {
  const rules = createCustomerValidationRules();
  return validateForm(data, rules);
};

/**
 * Validate a single customer field for real-time feedback
 */
export const validateCustomerField = (
  field: keyof CustomerFormData,
  value: any
): string | null => {
  let result: ValidationResult;
  
  switch (field) {
    case 'name':
      result = validateCustomerName(value);
      break;
    case 'phone':
      result = validateCustomerPhone(value);
      break;
    case 'email':
      result = validateCustomerEmail(value);
      break;
    case 'specialInstructions':
      result = validateSpecialInstructions(value);
      break;
    default:
      return null;
  }
  
  return result.isValid ? null : (result.error || null);
};

/**
 * Format phone number for display (XXX-XXX-XXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phone;
};

/**
 * Sanitize phone number (remove all non-digits)
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Check if customer data is complete (all required fields filled)
 */
export const isCustomerDataComplete = (data: Partial<CustomerFormData>): boolean => {
  return !!(
    data.name &&
    data.name.trim() !== '' &&
    data.phone &&
    data.phone.trim() !== ''
  );
};

/**
 * Get validation error messages for customer form
 */
export const getCustomerValidationErrors = (data: CustomerFormData): string[] => {
  const { errors } = validateCustomerForm(data);
  return Object.values(errors).filter(Boolean) as string[];
};