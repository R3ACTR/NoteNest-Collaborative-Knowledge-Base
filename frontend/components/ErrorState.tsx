import React from "react";
import Button from "@/components/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "error" | "warning" | "info";
  /** Callback when dismiss (X) is clicked; if provided, shows dismiss button */
  onDismiss?: () => void;
}

export default function ErrorState({
  title,
  message,
  action,
  className = "",
  variant = "error",
  onDismiss,
}: ErrorStateProps) {
  const getAriaLive = () => {
    switch (variant) {
      case "error":
        return "assertive";
      case "warning":
        return "polite";
      case "info":
        return "polite";
      default:
        return "polite";
    }
  };

  return (
    <div
      className={`error-state error-state-${variant} animate-scale-in relative ${className}`}
      role="alert"
      aria-live={getAriaLive()}
      aria-atomic="true"
    >
      <div className="error-state-content relative">
        {onDismiss && (
          <Button
            variant="icon"
            size="sm"
            onClick={onDismiss}
            className="error-state-dismiss absolute top-0 right-0 z-10"
            aria-label="Dismiss this message"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
        <div className="error-state-icon" aria-hidden="true">
          {variant === "error" && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {variant === "warning" && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {variant === "info" && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        {title && <h2 className="error-state-title">{title}</h2>}
        <p className="error-state-message">{message}</p>
        {action && <div className="error-state-action">{action}</div>}
      </div>
    </div>
  );
}
