
import React from 'react';

// Combine Input and Textarea attributes for broader compatibility, though not all are used for both
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement>, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  containerClassName?: string;
  isTextArea?: boolean;
  // rows?: number; // rows is already part of TextareaHTMLAttributes
  // value, onChange, placeholder, disabled, required are common or part of Input/Textarea attributes
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  id,
  type = 'text', // Default for input
  value,
  // Cast onChange to handle both input and textarea event types
  onChange,
  placeholder,
  disabled,
  required,
  error,
  containerClassName = 'mb-4',
  isTextArea = false,
  rows,
  ...props
}) => {
  const describedById = error ? `${id}-error` : undefined;
  const commonInputClassName = `mt-1 block w-full px-3 py-2 border ${error ? 'border-error' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:text-gray-500`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e as any); // Cast to any to satisfy the more specific inherited types if needed, or use a type assertion.
    }
  };


  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows || 3} // Default rows if not specified
          aria-invalid={!!error}
          aria-describedby={describedById}
          className={commonInputClassName}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} // Spread relevant props for textarea
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedById}
          className={commonInputClassName}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)} // Spread relevant props for input
        />
      )}
      {error && (
        <p id={describedById} className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
