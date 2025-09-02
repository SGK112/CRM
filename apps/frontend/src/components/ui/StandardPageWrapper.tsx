'use client';

import React from 'react';
import Link from 'next/link';

/**
 * StandardPageWrapper - Provides consistent layout, spacing, and theming
 * for all dashboard pages in the CRM system
 */
interface StandardPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function StandardPageWrapper({
  children,
  title,
  subtitle,
  icon,
  headerActions,
  className = '',
}: StandardPageWrapperProps) {
  return (
    <div
      className={`
        min-h-screen flex flex-col
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* Header */}
      {(title || headerActions) && (
        <header
          className="sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {icon && (
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                    }}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h1
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: 'var(--text)' }}
                    >
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {headerActions && <div className="flex items-center space-x-3">{headerActions}</div>}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

/**
 * StandardSection - Provides consistent section spacing and layout
 */
interface StandardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function StandardSection({
  children,
  className = '',
  title,
  subtitle,
  actions,
  headerActions,
}: StandardSectionProps) {
  return (
    <div
      className={`
        mb-8 last:mb-0
        ${className}
      `}
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        minHeight: 'calc(100vh - 140px)',
      }}
    >
      {(title || subtitle || actions || headerActions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {(actions || headerActions) && (
            <div className="flex items-center space-x-3">
              {actions}
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * StandardCard - Provides consistent card styling that matches dashboard cards
 */
interface StandardCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  gradient?: boolean;
}

export function StandardCard({
  children,
  className = '',
  padding = 'lg',
  hover = true,
  gradient = false,
}: StandardCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      className={`
        rounded-xl transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:scale-105' : ''}
        ${paddingClasses[padding]}
        ${className}
        relative overflow-hidden
      `}
      style={{
        backgroundColor: 'var(--surface-1)',
        color: 'var(--text)',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={
        hover
          ? e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }
          : undefined
      }
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * StandardGrid - Provides consistent grid layouts for cards and content
 */
interface StandardGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StandardGrid({
  children,
  cols = 3,
  gap = 'md',
  className = '',
}: StandardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>{children}</div>
  );
}

/**
 * StandardButton - Provides consistent button styling with red gradient accent
 */
interface StandardButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  as?: any;
  href?: string;
  [key: string]: any;
}

export function StandardButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  icon,
  as,
  href,
  ...props
}: StandardButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const Component = as || (href ? Link : 'button');
  const componentProps = href
    ? { href, ...props }
    : { onClick: disabled ? undefined : onClick, ...props };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: 'white',
          border: '1px solid var(--accent)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--surface-1)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--error)',
          color: 'white',
          border: '1px solid var(--error)',
          boxShadow: 'var(--shadow-sm)',
        };
      default:
        return {};
    }
  };

  return (
    <Component
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={getVariantStyles()}
      onMouseEnter={(e: any) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.backgroundColor = 'var(--surface-2)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--surface-2)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={(e: any) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--surface-1)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
      {...componentProps}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Component>
  );
}

/**
 * StandardStat - Provides consistent metric/statistic display
 */
interface StandardStatProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function StandardStat({
  label,
  value,
  change,
  trend = 'neutral',
  color,
  icon,
  className = '',
}: StandardStatProps) {
  const trendColors = {
    up: 'var(--success)',
    down: 'var(--error)',
    neutral: 'var(--text-muted)',
  };

  return (
    <div
      className={`rounded-xl border-2 theme-border p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-red-400 dark:hover:border-red-500 relative overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--surface-1)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-orange-50 dark:from-gray-700 dark:via-transparent dark:to-gray-600 opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </p>
            <p className="text-3xl font-bold mt-2 mb-1" style={{ color: 'white' }}>
              {value}
            </p>
            {change && (
              <div className="text-xs mt-1" style={{ color: trendColors[trend] }}>
                {change}
              </div>
            )}
          </div>
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="text-white" style={{ fontSize: '1.5rem' }}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StandardBadge - Provides consistent badge/tag styling with theme support
 */
interface StandardBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StandardBadge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: StandardBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--success)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: 'var(--warning)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          color: 'var(--info)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
        };
      default:
        return {
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };
    }
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      style={getVariantStyles()}
    >
      {children}
    </span>
  );
}
