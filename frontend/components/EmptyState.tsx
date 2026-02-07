import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div 
      className={`empty-state ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="empty-state-content">
        {icon && (
          <div className="empty-state-icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 className="empty-state-title">{title}</h3>
        {description && (
          <p className="empty-state-description">{description}</p>
        )}
        {action && (
          <div className="empty-state-action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
