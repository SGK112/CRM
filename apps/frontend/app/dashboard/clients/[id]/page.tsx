'use client';

import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  CalendarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ContactData {
  id: string;
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  projectsCount?: number;
  totalProjects?: number;
  totalValue?: number;
  lastContact?: string;
  updatedAt?: string;
  unreadNotifications?: number;
  quickbooksSynced?: boolean;
  estimatesSent?: number;
  estimatesViewed?: number;
  accountType?: string;
  source?: string;
  notes?: string;
}

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/clients/${contactId}`);
        
        if (response.ok) {
          const data = await response.json();
          setContact(data);
        } else if (response.status === 404) {
          setError('Contact not found');
        } else {
          setError('Failed to load contact');
        }
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const getContactTypeIcon = (type?: string) => {
    switch (type) {
      case 'client': return <UserIcon className="h-5 w-5" />;
      case 'subcontractor': return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'vendor': return <TruckIcon className="h-5 w-5" />;
      case 'contributor': return <HeartIcon className="h-5 w-5" />;
      case 'team': return <UserGroupIcon className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  const getContactTypeColor = (type?: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800';
      case 'subcontractor': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800';
      case 'contributor': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800';
      case 'team': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-4 w-4 text-green-500" />;
      case 'lead': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <ClockIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContactActions = (type?: string) => {
    const baseActions = [
      { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
      { label: 'Call/SMS', icon: ChatBubbleLeftRightIcon, action: () => {}, color: 'green' },
    ];

    switch (type) {
      case 'client':
        return [
          ...baseActions,
          { label: 'Schedule Meeting', icon: CalendarIcon, action: () => {}, color: 'purple' },
          { label: 'Create Estimate', icon: DocumentTextIcon, action: () => {}, color: 'orange' },
        ];
      case 'subcontractor':
        return [
          ...baseActions,
          { label: 'Assign Project', icon: WrenchScrewdriverIcon, action: () => {}, color: 'green' },
          { label: 'View Contracts', icon: DocumentTextIcon, action: () => {}, color: 'purple' },
        ];
      case 'vendor':
        return [
          ...baseActions,
          { label: 'New Order', icon: TruckIcon, action: () => {}, color: 'purple' },
          { label: 'View Catalog', icon: DocumentTextIcon, action: () => {}, color: 'orange' },
        ];
      case 'contributor':
        return [
          ...baseActions,
          { label: 'Assign Task', icon: PlusIcon, action: () => {}, color: 'orange' },
          { label: 'View Portfolio', icon: StarIcon, action: () => {}, color: 'yellow' },
        ];
      case 'team':
        return [
          ...baseActions,
          { label: 'HR Dashboard', icon: UserGroupIcon, action: () => {}, color: 'indigo' },
          { label: 'Performance', icon: ChartBarIcon, action: () => {}, color: 'purple' },
        ];
      default:
        return baseActions;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {error || 'Contact not found'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The contact you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
  const actions = getContactActions(contact.contactType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/clients"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/clients/${contactId}/edit`}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Link>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>

          {/* Contact Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusIcon(contact.status)}
                <span className={`text-sm font-medium capitalize ${
                  contact.status === 'active' ? 'text-green-600' :
                  contact.status === 'lead' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {contact.status}
                </span>
                {contact.contactType && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor(contact.contactType)}`}>
                    {getContactTypeIcon(contact.contactType)}
                    {contact.contactType}
                  </span>
                )}
              </div>
              {contact.company && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{contact.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Projects</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {contact.projectsCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  ${(contact.totalValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <StarIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rating</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-3 w-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm font-bold text-slate-900 dark:text-white ml-1">4.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <BellIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Notifications</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {contact.unreadNotifications || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-${action.color}-200 dark:border-${action.color}-800 hover:border-${action.color}-300 dark:hover:border-${action.color}-700 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all group`}
              >
                <div className={`p-2 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-lg group-hover:bg-${action.color}-200 dark:group-hover:bg-${action.color}-900/50 transition-colors`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <span className={`text-sm font-medium text-${action.color}-700 dark:text-${action.color}-300`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex overflow-x-auto">
              {['overview', 'activity', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {(contact.accountType || contact.source || contact.lastContact) && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.accountType && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <UserIcon className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Type</p>
                            <p className="font-medium text-slate-900 dark:text-white capitalize">
                              {contact.accountType}
                            </p>
                          </div>
                        </div>
                      )}
                      {contact.lastContact && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <ClockIcon className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Last Contact</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {new Date(contact.lastContact).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contact.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes</h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Activity timeline coming soon</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Documents management coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
