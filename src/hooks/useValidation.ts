/**
 * Reusable Validation Hook
 * 
 * Provides form validation with real-time feedback and error handling
 */

import { useState, useCallback } from 'react';
import { ValidationRules, validateForm, validateField as validateSingleField } from '../utils/validation';

export interface UseValidationOptions<T extends Record<string, any>> {
  rules: ValidationRules<T>;
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseValidationReturn<T> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isValidating: boolean;
  
  // Methods
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  handleChange: (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => () => void;
}

/**
 * Custom hook for form validation
 */
export function useValidation<T extends Record<string, any>>(
  options: UseValidationOptions<T>
): UseValidationReturn<T> {
  const {
    rules,
    initialValues = {} as Partial<T>,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValuesState] = useState<Partial<T>>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    const value = values[field];
    const result = validateSingleField(value, fieldRules);

    if (!result.isValid) {
      setErrorsState(prev => ({ ...prev, [field]: result.error }));
      return false;
    } else {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, [values, rules]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    setIsValidating(true);
    const result = validateForm(values as T, rules);
    setErrorsState(result.errors);
    setIsValidating(false);
    return result.isValid;
  }, [values, rules]);

  /**
   * Set a single field value
   */
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange && touched[field]) {
      // Validate after state update
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnChange, touched, validateField]);

  /**
   * Set multiple field values
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Set a single field error
   */
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Set multiple field errors
   */
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(newErrors);
  }, []);

  /**
   * Set a field as touched
   */
  const setTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
  }, [initialValues]);

  /**
   * Handle input change event
   */
  const handleChange = useCallback((field: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValue(field, value);
    };
  }, [setValue]);

  /**
   * Handle input blur event
   */
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(field, true);
      if (validateOnBlur) {
        validateField(field);
      }
    };
  }, [validateOnBlur, validateField, setTouched]);

  /**
   * Check if form is valid
   */
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isValidating,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    validateField,
    validateAll,
    reset,
    handleChange,
    handleBlur,
  };
}

export default useValidation;
