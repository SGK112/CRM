'use client';
import Layout from '../../../components/Layout';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  // Placeholder notifications data
  const notifications = [
    { id: '1', title: 'New Project Assigned', detail: 'Kitchen Remodel for Smith family', time: '5m ago' },
    { id: '2', title: 'Invoice Paid', detail: 'Invoice #1024 was paid ($4,500)', time: '1h ago' },
    { id: '3', title: 'Client Message', detail: 'Johnson: Can we move our meeting?', time: '3h ago' },
  ];
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><BellIcon className="h-7 w-7 text-blue-600"/> Notifications</h1>
        </div>
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className="surface-1 rounded-lg border border-token p-4 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <BellIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-[var(--text)]">{n.title}</p>
                <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">{n.detail}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
