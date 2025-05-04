import { ValidationTypeProps } from "../types";

/**
 * Form validation rules for common form fields
 */
const validate = (type: string, value: string, validation: ValidationTypeProps): { valid: boolean; error: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]{2,30}$/;
  const messageRegex = /^[\s\S]{10,1000}$/;
  const phoneRegex = /^[0-9+\-\s]{7,15}$/;

  const rules = validation[type];
  
  if (!rules) {
    return { valid: true, error: "" };
  }

  if (rules.required && !value) {
    return { valid: false, error: "This field is required" };
  }

  if (rules.validator && !rules.validator.regEx.test(value)) {
    return { valid: false, error: rules.validator.error };
  }

  return { valid: true, error: "" };
};

export default validate;

// Common validation rules
export const commonValidationRules: ValidationTypeProps = {
  name: {
    required: true,
    validator: {
      regEx: /^[a-zA-Z\s]{2,30}$/,
      error: "Please enter a valid name (2-30 characters)",
    },
  },
  email: {
    required: true,
    validator: {
      regEx: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      error: "Please enter a valid email address",
    },
  },
  message: {
    required: true,
    validator: {
      regEx: /^[\s\S]{10,1000}$/,
      error: "Message must be between 10-1000 characters",
    },
  },
  phone: {
    required: false,
    validator: {
      regEx: /^[0-9+\-\s]{7,15}$/,
      error: "Please enter a valid phone number",
    },
  },
};
