'use client';

import {
  UserPlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  category: 'contacts' | 'projects' | 'finance' | 'communication';
}

export default function QuickActionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    {
      id: 'new-contact',
      title: 'Add New Contact',
      description: 'Create a new client or business contact',
      icon: UserPlusIcon,
      href: '/dashboard/onboarding',
      color: 'amber',
      category: 'contacts'
    },
    {
      id: 'new-estimate',
      title: 'Create Estimate',
      description: 'Generate a new project estimate',
      icon: DocumentTextIcon,
      href: '/dashboard/estimates/new',
      color: 'blue',
      category: 'finance'
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Set up a client meeting or consultation',
      icon: CalendarIcon,
      href: '/dashboard/calendar/new',
      color: 'purple',
      category: 'communication'
    },
    {
      id: 'send-email',
      title: 'Send Email',
      description: 'Compose and send email to contacts',
      icon: EnvelopeIcon,
      href: '/dashboard/communications/email',
      color: 'green',
      category: 'communication'
    },
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Generate and send an invoice',
      icon: BanknotesIcon,
      href: '/dashboard/invoices/new',
      color: 'emerald',
      category: 'finance'
    },
    {
      id: 'new-project',
      title: 'Start Project',
      description: 'Create a new project or job',
      icon: ClipboardDocumentListIcon,
      href: '/dashboard/projects/new',
      color: 'orange',
      category: 'projects'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access analytics and reports',
      icon: ChartBarIcon,
      href: '/dashboard/reports',
      color: 'indigo',
      category: 'finance'
    },
    {
      id: 'settings',
      title: 'Manage Settings',
      description: 'Configure CRM preferences',
      icon: CogIcon,
      href: '/dashboard/settings',
      color: 'slate',
      category: 'contacts'
    },
  ];

  const categories = [
    { id: 'all', label: 'All Actions', count: quickActions.length },
    { id: 'contacts', label: 'Contacts', count: quickActions.filter(a => a.category === 'contacts').length },
    { id: 'projects', label: 'Projects', count: quickActions.filter(a => a.category === 'projects').length },
    { id: 'finance', label: 'Finance', count: quickActions.filter(a => a.category === 'finance').length },
    { id: 'communication', label: 'Communication', count: quickActions.filter(a => a.category === 'communication').length },
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      amber: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      blue: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      emerald: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      orange: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
      indigo: 'from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      slate: 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
    };
    return colorMap[color] || colorMap.amber;
  };

  return (
    <div className="bg-[var(--bg)] min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--bg)] backdrop-blur-md border-b border-[var(--border)] z-30">
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Quick Actions</h1>
            <p className="text-slate-400">
              Fast access to common CRM tasks and workflows
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-amber-600 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category.label}
                <span className={`ml-2 text-xs ${
                  selectedCategory === category.id ? 'text-black/70' : 'text-slate-500'
                }`}>
                  ({category.count})
                </span>
              </button>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-black hover:border-slate-600 transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(action.color)} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative p-6">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${getColorClasses(action.color)} mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {action.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600`}>
                      {action.category}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No actions found</h3>
              <p className="text-slate-400 mb-6">
                Try selecting a different category or check back later.
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-amber-600 text-black rounded-xl hover:bg-amber-500 transition-colors font-medium"
              >
                View All Actions
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 p-6 bg-slate-800 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
            <p className="text-slate-400 mb-4">
              Quick actions provide fast access to the most common CRM tasks. Click any action to get started, or browse by category to find what you need.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/help"
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                View Help Docs
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Customize Actions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
