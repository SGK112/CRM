// Theme utility components and functions for consistent theming across all pages

export const ThemeClasses = {
  // Backgrounds
  surface: {
    primary: 'surface-1',
    secondary: 'surface-2',
    tertiary: 'surface-3',
  },

  // Text colors
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
  },

  // Borders
  border: {
    default: 'border-token',
    strong: 'border-strong',
  },

  // Interactive states
  interactive: {
    hover: 'hover:surface-2',
    focus: 'focus-ring',
    active: 'bg-amber-50 dark:bg-amber-900/20',
  },

  // Form elements
  input: {
    base: 'input-base',
    focus: 'focus:border-amber-500 focus:ring-amber-500',
  },
};

// Status pill colors that work in both light and dark themes
export const StatusColors = {
  // Project statuses
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',

  // Client statuses
  lead: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  client: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  inactive: 'surface-2 text-secondary',
  churned: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',

  // Priority levels
  low: 'surface-2 text-secondary',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',

  // General states
  success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  neutral: 'surface-2 text-secondary',
};

// Button variants that work consistently across themes
export const ButtonVariants = {
  primary:
    'bg-amber-600 text-white hover:bg-amber-700 border-amber-600 hover:border-amber-700 shadow-sm',
  secondary: 'surface-1 text-primary border-token hover:surface-2 hover:border-strong',
  outline:
    'bg-transparent text-secondary border-token hover:surface-1 hover:text-primary hover:border-strong',
  ghost: 'bg-transparent text-secondary hover:surface-2 hover:text-primary border-transparent',
  destructive: 'bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700 border-green-600 hover:border-green-700',
};

// Utility function to get status color
export function getStatusColor(
  status: string,
  type: 'project' | 'client' | 'priority' | 'general' = 'general'
): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

  switch (type) {
    case 'project':
      return StatusColors[normalizedStatus as keyof typeof StatusColors] || StatusColors.neutral;
    case 'client':
      return StatusColors[normalizedStatus as keyof typeof StatusColors] || StatusColors.neutral;
    case 'priority':
      return StatusColors[normalizedStatus as keyof typeof StatusColors] || StatusColors.neutral;
    default:
      return StatusColors[normalizedStatus as keyof typeof StatusColors] || StatusColors.neutral;
  }
}

// Utility component for consistent status pills
interface StatusPillProps {
  status: string;
  type?: 'project' | 'client' | 'priority' | 'general';
  className?: string;
}

export function StatusPill({ status, type = 'general', className = '' }: StatusPillProps) {
  const colorClass = getStatusColor(status, type);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Utility component for consistent cards
interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <div
      className={`surface-1 border border-token rounded-lg ${elevated ? 'elevated' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Utility component for consistent page headers
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
        {description && <p className="text-secondary mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center space-x-4">{children}</div>}
    </div>
  );
}
