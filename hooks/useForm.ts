import { useState, useCallback, useEffect, useRef } from 'react';
import { getValidationError } from '../utils/validation';
import debounce from '../utils/debounce';

export type ValidationFunction<T> = (value: T, formData?: Record<string, any>) => boolean;
export type ErrorMessageFunction = (value: string, formData?: Record<string, any>) => string;

type FieldValidation<T> = {
  required?: boolean;
  validate?: ValidationFunction<T>;
  errorMessage?: ErrorMessageFunction | string;
};

type FormConfig<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type FieldState<T> = {
  value: T;
  error: string;
  touched: boolean;
  validationState: 'default' | 'valid' | 'invalid';
};

type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FieldState<T[K]>;
};

interface UseFormReturn<T extends Record<string, any>> {
  formState: FormState<T>;
  errors: FormErrors<T>;
  values: T;
  isValid: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => void;
  reset: () => void;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateForm: () => boolean;
}

/**
 * Custom hook for form handling with validation
 * 
 * @param initialValues Initial form values
 * @param config Form field validation configuration
 * @param validateOnChange Whether to validate fields on change 
 * @param debounceMs Debounce time for onChange validation in milliseconds
 * @returns Form state, handlers and validation methods
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  config: FormConfig<T> = {},
  validateOnChange: boolean = true,
  debounceMs: number = 300
): UseFormReturn<T> {
  // Initialize form state
  const initializeFormState = useCallback((): FormState<T> => {
    const state = {} as FormState<T>;
    
    for (const key in initialValues) {
      state[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
        validationState: 'default',
      };
    }
    
    return state;
  }, [initialValues]);
  
  const [formState, setFormState] = useState<FormState<T>>(initializeFormState);
  
  // Extract just the errors for easier access
  const errors = Object.keys(formState).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    const error = formState[fieldKey]?.error;
    if (error) {
      acc[fieldKey] = error;
    }
    return acc;
  }, {} as FormErrors<T>);
  
  // Extract just the values for easier access
  const values = Object.keys(formState).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    acc[fieldKey] = formState[fieldKey].value;
    return acc;
  }, {} as T);
  
  // Determine if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0 &&
    Object.keys(formState).every(key => {
      const fieldKey = key as keyof T;
      return formState[fieldKey].touched || !config[fieldKey]?.required;
    });
  
  // Validate a single field
  const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
    const value = formState[field].value;
    const fieldConfig = config[field];
    
    // No validation rules
    if (!fieldConfig) {
      return true;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (fieldConfig.required && 
        (value === '' || value === null || value === undefined)) {
      isValid = false;
      errorMessage = typeof fieldConfig.errorMessage === 'function'
        ? fieldConfig.errorMessage(String(value), values)
        : fieldConfig.errorMessage || `${String(field)} is required`;
    }
    
    // Custom validation
    else if (fieldConfig.validate && !fieldConfig.validate(value, values)) {
      isValid = false;
      errorMessage = typeof fieldConfig.errorMessage === 'function'
        ? fieldConfig.errorMessage(String(value), values)
        : fieldConfig.errorMessage || `${String(field)} is invalid`;
    }
    
    // Update the field state
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: errorMessage,
        validationState: isValid ? 'valid' : 'invalid',
      },
    }));
    
    return isValid;
  }, [formState, config, values]);
  
  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    for (const key in formState) {
      const fieldKey = key as keyof T;
      // Only validate if there's a config for this field
      if (config[fieldKey]) {
        const fieldValid = validateField(fieldKey);
        
        // Mark as touched during form validation
        setFormState(prev => ({
          ...prev,
          [fieldKey]: {
            ...prev[fieldKey],
            touched: true,
          },
        }));
        
        if (!fieldValid) {
          isValid = false;
        }
      }
    }
    
    return isValid;
  }, [formState, validateField, config]);
  
  // Debounced validation function
  const debouncedValidate = useRef(
    debounce(<K extends keyof T>(field: K) => {
      validateField(field);
    }, debounceMs)
  ).current;
  
  // Handle field change
  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true,
      },
    }));
    
    if (validateOnChange) {
      debouncedValidate(field);
    }
  }, [validateOnChange, debouncedValidate]);
  
  // Handle field blur
  const handleBlur = useCallback(<K extends keyof T>(field: K) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
      },
    }));
    
    validateField(field);
  }, [validateField]);
  
  // Reset form to initial values
  const reset = useCallback(() => {
    setFormState(initializeFormState());
  }, [initializeFormState]);
  
  // Manually set a field value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
      },
    }));
  }, []);
  
  // Manually set an error
  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
        validationState: error ? 'invalid' : prev[field].validationState,
      },
    }));
  }, []);
  
  // Clear an error
  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: '',
        validationState: 'default',
      },
    }));
  }, []);
  
  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);
  
  return {
    formState,
    errors,
    values,
    isValid,
    handleChange,
    handleBlur,
    reset,
    setValue,
    setError,
    clearError,
    validateField,
    validateForm,
  };
}

export default useForm; 