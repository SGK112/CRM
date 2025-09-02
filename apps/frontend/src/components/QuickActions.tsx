'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  PhotoIcon,
  PhoneIcon,
  EnvelopeIcon,
  CloudArrowUpIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface QuickAction {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
  onClick?: () => void;
}

export default function QuickActions({ isOpen, onToggle }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      name: 'New Project',
      href: '/dashboard/projects/new',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      description: 'Start a new construction project',
    },
    {
      name: 'Add Client',
      href: '/dashboard/clients/new',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      description: 'Register a new client',
    },
    {
      name: 'Schedule Meeting',
      href: '/dashboard/calendar/new',
      icon: CalendarDaysIcon,
      color: 'bg-purple-500',
      description: 'Book a client appointment',
    },
    {
      name: 'Upload Document',
      href: '/dashboard/documents/upload',
      icon: CloudArrowUpIcon,
      color: 'bg-orange-500',
      description: 'Upload blueprints, contracts, permits',
    },
    {
      name: 'Create Design',
      href: '/dashboard/designer/new',
      icon: PencilSquareIcon,
      color: 'bg-pink-500',
      description: 'Design floor plans and layouts',
    },
    {
      name: 'Send Message',
      href: '/dashboard/inbox?compose=1',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-indigo-500',
      description: 'Message a client or team member',
    },
    {
      name: 'Generate Invoice',
      href: '/dashboard/invoices/new',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      description: 'Create project invoice',
    },
    {
      name: 'Take Photo',
      icon: PhotoIcon,
      color: 'bg-red-500',
      description: 'Capture site progress photos',
      onClick: () => {
        // Open camera or file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = e => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            // Handle file upload
            console.log('Photo captured:', file);
          }
        };
        input.click();
      },
    },
    {
      name: 'Call Client',
      icon: PhoneIcon,
      color: 'bg-teal-500',
      description: 'Quick call to client',
      onClick: () => {
        // Open phone dialer or show client list
        window.location.href = 'tel:';
      },
    },
    {
      name: 'Send Email',
      href: '/dashboard/marketing/email',
      icon: EnvelopeIcon,
      color: 'bg-cyan-500',
      description: 'Send email to clients',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    onToggle(); // Close the menu
    if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Quick action items */}
      <div
        className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={action.name}
              className={`transform transition-all duration-300 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              {action.href ? (
                <Link
                  href={action.href}
                  className="group flex items-center space-x-3 bg-white rounded-lg shadow-lg hover:shadow-xl border border-gray-200 p-3 min-w-[240px] transition-all duration-200 hover:scale-105"
                  onClick={onToggle}
                >
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => handleActionClick(action)}
                  className="group flex items-center space-x-3 bg-white rounded-lg shadow-lg hover:shadow-xl border border-gray-200 p-3 min-w-[240px] transition-all duration-200 hover:scale-105 w-full text-left"
                >
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main FAB button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'rotate-45 bg-red-500 hover:bg-red-600' : 'rotate-0'
        }`}
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
      </button>

      {/* Helper text */}
      {!isOpen && (
        <div className="fixed bottom-20 right-6 z-40 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Quick Actions
        </div>
      )}
    </>
  );
}
