import React, { forwardRef, useId } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      disabled,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [error ? errorId : helperId].filter(Boolean).join(" ") || undefined;

    const baseClasses = "w-full rounded-xl border px-4 py-3.5 text-base outline-none box-border transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400";
    
    const stateClasses = error
      ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
    
    const disabledClasses = disabled
      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
      : "bg-gray-50 dark:bg-gray-900";

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-base font-medium mb-2.5 text-gray-900 dark:text-gray-100"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-disabled={disabled}
          {...props}
        />
        {error && (
          <p id={errorId} className="flex items-center gap-2 mt-2 text-sm text-red-600" role="alert">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx={12} cy={12} r={10} />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
