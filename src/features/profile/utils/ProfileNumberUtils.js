// --- React Core Libraries and Modules ---
import { useCallback } from 'react';

/**
 * useNumberPicker
 * 
 * A custom React hook for managing a controlled numeric stepper input in Formik forms.
 * 
 * Functionality:
 * - Takes a Formik field object, form instance, and optional maxValue (default 15)
 * - Provides current numeric value (coerced to Number, defaults to 1 if invalid)
 * - Returns memoized increment and decrement callbacks
 * - Safely increments/decrements within bounds (1 to maxValue)
 * - Marks field as touched and updates value via Formik on change
 * 
 * Purpose:
 * Simplifies creation of reusable +/- number picker controls (e.g., years of experience, current year) in profile/setup forms with consistent validation and bounds.
 */

const useNumberPicker = (field, form, maxValue = 15) => {

  const currentValue = Number(field.value) || 1;
  const increment = useCallback(() => {
    if (currentValue < maxValue) {
      form.setFieldTouched(field.name, true, false);
      form.setFieldValue(field.name, currentValue + 1);
    }
  }, [currentValue, maxValue, field.name, form]);

  const decrement = useCallback(() => {
    if (currentValue > 1) {
      form.setFieldTouched(field.name, true, false);
      form.setFieldValue(field.name, currentValue - 1);
    }
  }, [currentValue, field.name, form]);

  return {
    value: currentValue,
    increment,
    decrement,
  };
};

export default useNumberPicker;