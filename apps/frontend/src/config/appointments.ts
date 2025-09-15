import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other' | 'google_calendar';

export const STATUS_META: Record<AppointmentStatus, { label: string; color: string; icon: any; solidIcon: any; bg: string; badge: string }> = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-brand-400',
    icon: ClockIcon,
    solidIcon: ClockIcon,
    bg: 'bg-brand-500/20',
    badge: 'bg-brand-500/20 text-brand-400'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-400',
    icon: CheckCircleIcon,
    solidIcon: CheckCircleSolidIcon,
    bg: 'bg-green-500/20',
    badge: 'bg-green-500/20 text-green-400'
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-400',
    icon: CheckCircleIcon,
    solidIcon: CheckCircleIcon,
    bg: 'bg-slate-500/20',
    badge: 'bg-slate-500/20 text-slate-400'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    icon: ExclamationTriangleIcon,
    solidIcon: ExclamationTriangleIcon,
    bg: 'bg-red-500/20',
    badge: 'bg-red-500/20 text-red-400'
  }
};

export const TYPE_ICON: Record<AppointmentType, any> = {
  consultation: UserIcon,
  site_visit: MapPinIcon,
  meeting: UserIcon,
  inspection: CheckCircleIcon,
  other: CalendarDaysIcon,
  google_calendar: CalendarDaysIcon,
};

export function getEventColor(status: AppointmentStatus, isGoogle = false) {
  if (isGoogle) return '#ea4335';
  switch (status) {
    case 'confirmed':
      return '#10b981';
    case 'scheduled':
      return '#f97316'; // brand-500
    case 'completed':
      return '#6b7280';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#f97316';
  }
}
