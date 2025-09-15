"use client";

import {
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  _id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'project_update' | 'estimate' | 'payment';
  title: string;
  description: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const activityTypeConfig = {
  call: { 
    icon: PhoneIcon, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10'
  },
  email: { 
    icon: EnvelopeIcon, 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/10'
  },
  meeting: { 
    icon: UserIcon, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10'
  },
  note: { 
    icon: DocumentTextIcon, 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10'
  },
  task: { 
    icon: CheckCircleIcon, 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10'
  },
  project_update: { 
    icon: BuildingOfficeIcon, 
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/10'
  },
  estimate: { 
    icon: DocumentTextIcon, 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/10'
  },
  payment: { 
    icon: InformationCircleIcon, 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/10'
  },
};

const statusConfig = {
  pending: { color: 'text-yellow-600 dark:text-yellow-400', icon: ClockIcon },
  completed: { color: 'text-green-600 dark:text-green-400', icon: CheckCircleIcon },
  cancelled: { color: 'text-red-600 dark:text-red-400', icon: ExclamationTriangleIcon },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Mock data for development
      const mockActivities: Activity[] = [
        {
          _id: '1',
          type: 'call',
          title: 'Follow-up call with John Smith',
          description: 'Discussed kitchen renovation timeline and budget adjustments',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          clientName: 'John Smith',
          status: 'completed'
        },
        {
          _id: '2',
          type: 'email',
          title: 'Sent estimate to Sarah Johnson',
          description: 'Bathroom remodel estimate - $15,500',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          clientName: 'Sarah Johnson',
          status: 'pending'
        },
        {
          _id: '3',
          type: 'project_update',
          title: 'Kitchen Renovation progress update',
          description: 'Cabinets installed, plumbing inspection completed',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          projectName: 'Kitchen Renovation',
          status: 'completed'
        },
        {
          _id: '4',
          type: 'meeting',
          title: 'Site visit scheduled',
          description: 'Initial consultation for basement finishing project',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          clientName: 'Mike Wilson',
          status: 'pending'
        },
        {
          _id: '5',
          type: 'payment',
          title: 'Payment received',
          description: 'Deposit payment of $5,000 for bathroom project',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          clientName: 'Emily Davis',
          status: 'completed'
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          <p className="text-gray-600 dark:text-gray-400">Track all your business activities and interactions</p>
        </div>
      </div>

      {/* Activity Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Activities
        </button>
        {Object.entries(activityTypeConfig).map(([type]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => {
                  const activityDate = new Date(a.createdAt);
                  const today = new Date();
                  return activityDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => {
                  const activityDate = new Date(a.createdAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return activityDate >= weekAgo;
                }).length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const typeConfig = activityTypeConfig[activity.type];
            const TypeIcon = typeConfig.icon;
            const statusInfo = activity.status ? statusConfig[activity.status] : null;
            const StatusIcon = statusInfo?.icon;

            return (
              <div
                key={activity._id}
                className={`${typeConfig.bgColor} rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {activity.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {getRelativeTime(activity.createdAt)}
                          </span>

                          {activity.clientName && (
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {activity.clientName}
                            </span>
                          )}

                          {activity.projectName && (
                            <span className="flex items-center gap-1">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              {activity.projectName}
                            </span>
                          )}

                          {activity.status && statusInfo && StatusIcon && (
                            <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${typeConfig.color}`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No activities yet' : `No ${filter.replace('_', ' ')} activities`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? 'Start interacting with clients and projects to see your activity feed'
              : `No ${filter.replace('_', ' ')} activities found. Try selecting a different filter.`
            }
          </p>
        </div>
      )}
    </div>
  );
}