'use client';

import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ActivityItem {
  id: string;
  type: 'client' | 'project' | 'estimate' | 'invoice' | 'appointment' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, string | number | boolean>;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock activity data
    setTimeout(() => {
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'client',
          title: 'New Client Added',
          description: 'Sarah Johnson was added as a new client',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          user: 'You',
        },
        {
          id: '2',
          type: 'estimate',
          title: 'Estimate Created',
          description: 'Kitchen renovation estimate #EST-001 created for $25,000',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          user: 'You',
        },
        {
          id: '3',
          type: 'appointment',
          title: 'Appointment Scheduled',
          description: 'Site visit scheduled with David Chen for tomorrow at 2:00 PM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          user: 'You',
        },
        {
          id: '4',
          type: 'project',
          title: 'Project Updated',
          description: 'Bathroom remodel project status changed to In Progress',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          user: 'You',
        },
        {
          id: '5',
          type: 'invoice',
          title: 'Payment Received',
          description: 'Invoice #INV-001 payment of $5,000 received from John Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          user: 'System',
        },
      ];
      setActivities(mockActivities);
      setLoading(false);
    }, 800);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'client':
        return <UserGroupIcon className="h-5 w-5 text-blue-400" />;
      case 'project':
        return <DocumentTextIcon className="h-5 w-5 text-green-400" />;
      case 'estimate':
        return <ChartBarIcon className="h-5 w-5 text-purple-400" />;
      case 'invoice':
        return <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />;
      case 'appointment':
        return <CalendarDaysIcon className="h-5 w-5 text-amber-400" />;
      case 'system':
        return <ClockIcon className="h-5 w-5 text-slate-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'client':
        return 'bg-blue-900/20 border-blue-600/30';
      case 'project':
        return 'bg-green-900/20 border-green-600/30';
      case 'estimate':
        return 'bg-purple-900/20 border-purple-600/30';
      case 'invoice':
        return 'bg-emerald-900/20 border-emerald-600/30';
      case 'appointment':
        return 'bg-amber-900/20 border-amber-600/30';
      case 'system':
        return 'bg-slate-900/20 border-slate-600/30';
      default:
        return 'bg-slate-900/20 border-slate-600/30';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-lg text-white">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--bg)] backdrop-blur-md border-b border-[var(--border)] z-30">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
              <p className="text-slate-400 mt-1">Track all recent activities and changes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Last updated: just now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Activity List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No recent activity</h3>
              <p className="text-slate-500">Activities will appear here as you use the system</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`bg-black rounded-2xl p-6 border ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-slate-800 rounded-xl">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {activity.title}
                      </h3>
                      <span className="text-sm text-slate-400 flex-shrink-0 ml-4">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 mb-3">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'client' ? 'bg-blue-900 text-blue-300 border border-blue-700' :
                          activity.type === 'project' ? 'bg-green-900 text-green-300 border border-green-700' :
                          activity.type === 'estimate' ? 'bg-purple-900 text-purple-300 border border-purple-700' :
                          activity.type === 'invoice' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' :
                          activity.type === 'appointment' ? 'bg-amber-900 text-amber-300 border border-amber-700' :
                          'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                      
                      {activity.user && (
                        <span className="text-sm text-slate-400">
                          by {activity.user}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
