'use client';

import { useState, useRef, useEffect } from 'react';
import { InformationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'info' | 'help' | 'warning';
  className?: string;
  iconClassName?: string;
  showOnHover?: boolean;
  showOnClick?: boolean;
}

export default function HelpTooltip({
  content,
  title,
  position = 'top',
  size = 'md',
  variant = 'info',
  className = '',
  iconClassName = '',
  showOnHover = true,
  showOnClick = false,
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!iconRef.current || !tooltipRef.current) return;

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = iconRect.top - tooltipRect.height - 8;
        left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = iconRect.bottom + 8;
        left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
        left = iconRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
        left = iconRect.right + 8;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  const getIcon = () => {
    switch (variant) {
      case 'help':
        return (
          <QuestionMarkCircleIcon className={`cursor-help ${getIconSize()} ${iconClassName}`} />
        );
      case 'warning':
        return (
          <InformationCircleIcon
            className={`cursor-help ${getIconSize()} ${iconClassName} text-amber-500`}
          />
        );
      default:
        return (
          <InformationCircleIcon
            className={`cursor-help ${getIconSize()} ${iconClassName} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
          />
        );
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getTooltipSize = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs text-xs';
      case 'lg':
        return 'max-w-md text-base';
      default:
        return 'max-w-sm text-sm';
    }
  };

  const handleMouseEnter = () => {
    if (showOnHover) setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (showOnHover) setIsVisible(false);
  };

  const handleClick = () => {
    if (showOnClick) {
      setIsVisible(!isVisible);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      showOnClick &&
      tooltipRef.current &&
      !tooltipRef.current.contains(e.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(e.target as Node)
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (showOnClick) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOnClick]);

  return (
    <>
      <div
        ref={iconRef}
        className={`inline-flex items-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {getIcon()}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click outside detection */}
          {showOnClick && <div className="fixed inset-0 z-40" />}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`fixed z-50 ${getTooltipSize()} p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700`}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {title && <div className="font-semibold mb-1 text-white">{title}</div>}
            <div className="text-gray-200">{content}</div>

            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 border border-gray-700 transform rotate-45 ${
                position === 'top'
                  ? 'bottom-[-5px] left-1/2 -translate-x-1/2'
                  : position === 'bottom'
                    ? 'top-[-5px] left-1/2 -translate-x-1/2'
                    : position === 'left'
                      ? 'right-[-5px] top-1/2 -translate-y-1/2'
                      : 'left-[-5px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </>
      )}
    </>
  );
}
