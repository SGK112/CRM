'use client';

import {
    CalendarIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    UserIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

interface Project {
  _id: string;
  title: string;
  clientId?: string;
}

interface WorkflowActionsProps {
  /** Current context - what page/form we're on */
  context: 'client' | 'estimate' | 'invoice' | 'project';
  /** Data for the current context item */
  currentItem?: {
    _id: string;
    clientId?: string;
    projectId?: string;
    client?: Client;
    project?: Project;
  };
  /** Available clients for selection */
  clients?: Client[];
  /** Available projects for selection */
  projects?: Project[];
  /** Additional custom actions */
  customActions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  }>;
  /** Layout style */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show as pills or buttons */
  variant?: 'pills' | 'buttons' | 'cards';
}

export default function WorkflowActions({
  context,
  currentItem,
  customActions = [],
  layout = 'horizontal',
  size = 'md',
  variant = 'buttons',
}: WorkflowActionsProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      orange: 'bg-orange-600 hover:bg-orange-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return sizes[size];
  };

  const getLayoutClasses = () => {
    const layouts = {
      horizontal: 'flex flex-wrap gap-2',
      vertical: 'flex flex-col gap-2',
      grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2',
    };
    return layouts[layout];
  };

  // Generate contextual actions based on current page and available data
  const getContextualActions = () => {
    const actions = [];
    const clientId = currentItem?.clientId || currentItem?.client?._id;
    const projectId = currentItem?.projectId || currentItem?.project?._id;

    switch (context) {
      case 'client':
        if (currentItem?._id) {
          actions.push(
            {
              label: 'Create Estimate',
              icon: DocumentTextIcon,
              href: `/dashboard/estimates/new?clientId=${currentItem._id}`,
              color: 'orange',
            },
            {
              label: 'Create Invoice',
              icon: CurrencyDollarIcon,
              href: `/dashboard/invoices/new?clientId=${currentItem._id}`,
              color: 'green',
            },
            {
              label: 'Create Project',
              icon: WrenchScrewdriverIcon,
              href: `/dashboard/projects/new?clientId=${currentItem._id}`,
              color: 'purple',
            },
            {
              label: 'Schedule Meeting',
              icon: CalendarIcon,
              href: `/dashboard/calendar?clientId=${currentItem._id}`,
              color: 'blue',
            }
          );
        }
        break;

      case 'estimate':
        if (currentItem?._id) {
          actions.push(
            {
              label: 'Convert to Invoice',
              icon: CurrencyDollarIcon,
              href: `/dashboard/invoices/new?fromEstimate=${currentItem._id}`,
              color: 'green',
            }
          );
        }
        if (clientId && !projectId) {
          actions.push({
            label: 'Create Project',
            icon: WrenchScrewdriverIcon,
            href: `/dashboard/projects/new?clientId=${clientId}`,
            color: 'purple',
          });
        }
        if (clientId) {
          actions.push({
            label: 'View Client',
            icon: UserIcon,
            href: `/dashboard/clients/${clientId}?source=workflow`,
            color: 'blue',
          });
        }
        break;

      case 'invoice':
        if (clientId) {
          actions.push(
            {
              label: 'Create Estimate',
              icon: DocumentTextIcon,
              href: `/dashboard/estimates/new?clientId=${clientId}`,
              color: 'orange',
            },
            {
              label: 'View Client',
              icon: UserIcon,
              href: `/dashboard/clients/${clientId}?source=invoice`,
              color: 'blue',
            }
          );
        }
        if (clientId && !projectId) {
          actions.push({
            label: 'Create Project',
            icon: WrenchScrewdriverIcon,
            href: `/dashboard/projects/new?clientId=${clientId}`,
            color: 'purple',
          });
        }
        break;

      case 'project':
        if (clientId) {
          actions.push(
            {
              label: 'Create Estimate',
              icon: DocumentTextIcon,
              href: `/dashboard/estimates/new?clientId=${clientId}&projectId=${currentItem?._id}`,
              color: 'orange',
            },
            {
              label: 'Create Invoice',
              icon: CurrencyDollarIcon,
              href: `/dashboard/invoices/new?clientId=${clientId}&projectId=${currentItem?._id}`,
              color: 'green',
            },
            {
              label: 'View Client',
              icon: UserIcon,
              href: `/dashboard/clients/${clientId}?source=project`,
              color: 'blue',
            }
          );
        }
        break;
    }

    return [...actions, ...customActions];
  };

  const actions = getContextualActions().map(action => ({
    ...action,
    color: action.color || 'blue'
  }));

  if (actions.length === 0) {
    return null;
  }

  interface ActionType {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    color: string;
  }

  const renderAction = (action: ActionType, index: number) => {
    const Icon = action.icon;
    const baseClasses = `inline-flex items-center gap-2 rounded-lg font-medium transition-colors ${getSizeClasses()}`;

    let classes = baseClasses;
    if (variant === 'pills') {
      classes += ` ${getColorClasses(action.color)} rounded-full`;
    } else if (variant === 'cards') {
      classes += ` bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
    } else {
      classes += ` ${getColorClasses(action.color)}`;
    }

    const content = (
      <>
        <Icon className="h-4 w-4" />
        {action.label}
      </>
    );

    if (action.href) {
      return (
        <Link key={index} href={action.href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button key={index} onClick={action.onClick} className={classes}>
        {content}
      </button>
    );
  };

  return (
    <div className="workflow-actions">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Actions
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {actions.length} available
        </span>
      </div>
      <div className={getLayoutClasses()}>
        {actions.map(renderAction)}
      </div>
    </div>
  );
}
