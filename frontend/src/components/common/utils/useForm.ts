import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { ValidationTypeProps } from "../types";
import validate from "./validationRules";

/**
 * Custom hook for form handling with validation
 * 
 * @param initialValues - Initial form values
 * @param validation - Validation rules
 * @param callback - Function to call on successful form submission
 */
export const useForm = (
  initialValues: { [key: string]: string },
  validation: ValidationTypeProps,
  callback: () => void
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    
    // Update touched state for the field
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate the field
    const validationResult = validate(name, value, validation);
    
    // Update errors
    setErrors({
      ...errors,
      [name]: !validationResult.valid ? validationResult.error : ""
    });
    
    // Update values
    setValues({
      ...values,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    
    setTouched(allTouched);
    
    // Validate all fields
    const formErrors: { [key: string]: string } = {};
    let isValid = true;
    
    Object.keys(values).forEach(key => {
      const validationResult = validate(key, values[key], validation);
      if (!validationResult.valid) {
        formErrors[key] = validationResult.error;
        isValid = false;
      }
    });
    
    setErrors(formErrors);
    
    if (isValid) {
      setIsSubmitting(true);
    }
  };

  // Call the callback when form is valid and submitting
  useEffect(() => {
    if (Object.keys(errors).length === 0 && isSubmitting) {
      callback();
      setIsSubmitting(false);
    }
  }, [errors, isSubmitting, callback]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit
  };
};
