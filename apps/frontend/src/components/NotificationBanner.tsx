'use client';

import {
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export interface NotificationProps {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-emerald-400" />;
    case 'error':
      return <XCircleIcon className="h-6 w-6 text-red-400" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" />;
    case 'info':
      return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    default:
      return <BellIcon className="h-6 w-6 text-slate-400" />;
  }
};

const CustomNotification = ({
  title,
  message,
  type = 'info',
  action,
  onDismiss
}: NotificationProps & { onDismiss?: () => void }) => {
  return (
    <div className="flex items-start gap-3 p-4 max-w-md">
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(type)}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1">
          {title}
        </h4>
        {message && (
          <p className="text-sm text-slate-300 leading-relaxed">
            {message}
          </p>
        )}

        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
          >
            {action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Enhanced notification functions
export const showNotification = {
  success: (props: Omit<NotificationProps, 'type'>) => {
    return toast.custom(
      (t) => (
        <CustomNotification
          {...props}
          type="success"
          onDismiss={props.persistent ? undefined : () => toast.dismiss(t.id)}
        />
      ),
      {
        duration: props.persistent ? Infinity : (props.duration || 5000),
        position: 'top-right',
      }
    );
  },

  error: (props: Omit<NotificationProps, 'type'>) => {
    return toast.custom(
      (t) => (
        <CustomNotification
          {...props}
          type="error"
          onDismiss={props.persistent ? undefined : () => toast.dismiss(t.id)}
        />
      ),
      {
        duration: props.persistent ? Infinity : (props.duration || 7000),
        position: 'top-right',
      }
    );
  },

  warning: (props: Omit<NotificationProps, 'type'>) => {
    return toast.custom(
      (t) => (
        <CustomNotification
          {...props}
          type="warning"
          onDismiss={props.persistent ? undefined : () => toast.dismiss(t.id)}
        />
      ),
      {
        duration: props.persistent ? Infinity : (props.duration || 6000),
        position: 'top-right',
      }
    );
  },

  info: (props: Omit<NotificationProps, 'type'>) => {
    return toast.custom(
      (t) => (
        <CustomNotification
          {...props}
          type="info"
          onDismiss={props.persistent ? undefined : () => toast.dismiss(t.id)}
        />
      ),
      {
        duration: props.persistent ? Infinity : (props.duration || 5000),
        position: 'top-right',
      }
    );
  },

  loading: (title: string, message?: string) => {
    return toast.loading(
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">
            {title}
          </h4>
          {message && (
            <p className="text-sm text-slate-300 mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              {loading}
            </h4>
          </div>
        </div>
      ),
      success: (data) => (
        <CustomNotification
          title={typeof success === 'function' ? success(data) : success}
          type="success"
        />
      ),
      error: (err) => (
        <CustomNotification
          title={typeof error === 'function' ? error(err) : error}
          type="error"
        />
      ),
    });
  },
};

// Utility functions
export const dismissAllNotifications = () => toast.dismiss();
export const dismissNotification = (id: string) => toast.dismiss(id);

export default CustomNotification;
