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
  HeartIcon,
  MapPinIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Dynamically import GoogleMap to avoid SSR issues
import GoogleMap from '../../../../components/GoogleMap';

interface ContactData {
  id: string;
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  orderPortalUrl?: string;
  catalogUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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
  specialties?: string[];
  certifications?: string[];
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

  const getContactTypeColor = () => {
    return 'bg-slate-800 text-white border border-slate-700';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-4 w-4 text-white" />;
      case 'lead': return <ClockIcon className="h-4 w-4 text-white" />;
      case 'inactive': return <ClockIcon className="h-4 w-4 text-slate-400" />;
      default: return <ClockIcon className="h-4 w-4 text-white" />;
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
          { label: 'Schedule Meeting', icon: CalendarIcon, action: () => {}, color: 'purple' },
          { label: 'Create Estimate', icon: DocumentTextIcon, action: () => {}, color: 'orange' },
          { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
        ];
      case 'subcontractor':
        return [
          { label: 'Assign Project', icon: WrenchScrewdriverIcon, action: () => {}, color: 'green' },
          { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
          { label: 'View Contracts', icon: DocumentTextIcon, action: () => {}, color: 'purple' },
        ];
      case 'vendor':
        return [
          { label: 'Visit Website', icon: GlobeAltIcon, action: () => contact?.website ? window.open(contact.website, '_blank') : {}, color: 'blue', disabled: !contact?.website },
          { label: 'Order Portal', icon: ShoppingCartIcon, action: () => contact?.orderPortalUrl ? window.open(contact.orderPortalUrl, '_blank') : {}, color: 'green', disabled: !contact?.orderPortalUrl },
          { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
        ];
      case 'contributor':
        return [
          { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
          { label: 'Assign Task', icon: PlusIcon, action: () => {}, color: 'orange' },
          { label: 'Schedule Review', icon: CalendarIcon, action: () => {}, color: 'purple' },
        ];
      case 'team':
        return [
          { label: 'Send Email', icon: EnvelopeIcon, action: () => {}, color: 'blue' },
          { label: 'Schedule 1:1', icon: CalendarIcon, action: () => {}, color: 'green' },
          { label: 'Performance', icon: ChartBarIcon, action: () => {}, color: 'purple' },
        ];
      default:
        return baseActions;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-lg text-white">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || 'Contact not found'}
          </h2>
          <p className="text-slate-400 mb-6">
            The contact you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
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
    <div className="min-h-screen bg-slate-900">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-black backdrop-blur-md border-b border-slate-700 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/clients"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/clients/${contactId}/profile`}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Complete Profile"
              >
                <UserIcon className="h-4 w-4 text-white" />
              </Link>
              <Link
                href={`/dashboard/clients/${contactId}/edit`}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 text-white" />
              </Link>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <TrashIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Contact Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusIcon(contact.status)}
                <span className={`text-sm font-medium capitalize ${
                  contact.status === 'active' ? 'text-white' :
                  contact.status === 'lead' ? 'text-white' : 'text-slate-400'
                }`}>
                  {contact.status}
                </span>
                {contact.contactType && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor()}`}>
                    {getContactTypeIcon(contact.contactType)}
                    {contact.contactType}
                  </span>
                )}
              </div>
              {contact.company && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{contact.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Profile Completion Prompt */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-700 rounded-xl flex-shrink-0">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                Enhance Your CRM Experience
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Complete {displayName}'s profile to unlock personalized insights, automated workflows, and better customer management.
              </p>
              <Link
                href={`/dashboard/clients/${contactId}/profile`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                Complete Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Projects</p>
                <p className="text-lg font-bold text-white">
                  {contact.projectsCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Value</p>
                <p className="text-lg font-bold text-white">
                  ${(contact.totalValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">
                <StarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Rating</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-3 w-3 ${i < 4 ? 'text-white' : 'text-slate-600'}`}
                    />
                  ))}
                  <span className="text-sm font-bold text-white ml-1">4.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">
                <BellIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Notifications</p>
                <p className="text-lg font-bold text-white">
                  {contact.unreadNotifications || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black rounded-2xl p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={action.disabled}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all group ${
                  action.disabled 
                    ? 'border-slate-800 bg-slate-900 cursor-not-allowed opacity-50' 
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  action.disabled 
                    ? 'bg-slate-800' 
                    : 'bg-slate-800 group-hover:bg-slate-700'
                }`}>
                  <action.icon className={`h-5 w-5 ${
                    action.disabled ? 'text-slate-500' : 'text-white'
                  }`} />
                </div>
                <span className={`text-sm font-medium text-center ${
                  action.disabled ? 'text-slate-500' : 'text-white'
                }`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-black rounded-2xl border border-slate-700">
          {/* Tabs */}
          <div className="border-b border-slate-700 p-4">
            <nav className="flex gap-3 mx-2">
              {['overview', 'activity', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                  <h4 className="text-lg font-semibold text-white mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                        <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-white hover:underline font-medium"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Phone</p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-white hover:underline font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website & Links */}
                {(contact.website || contact.orderPortalUrl || contact.catalogUrl) && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Online Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.website && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                          <GlobeAltIcon className="h-5 w-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400">Website</p>
                            <a
                              href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:underline font-medium"
                            >
                              {contact.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {contact.orderPortalUrl && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                          <ShoppingCartIcon className="h-5 w-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400">Order Portal</p>
                            <a
                              href={contact.orderPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:underline font-medium"
                            >
                              Access Orders
                            </a>
                          </div>
                        </div>
                      )}
                      {contact.catalogUrl && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                          <ClipboardDocumentListIcon className="h-5 w-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400">Catalog</p>
                            <a
                              href={contact.catalogUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:underline font-medium"
                            >
                              View Catalog
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address & Location */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Location</h4>
                  {(contact.address || contact.city || contact.state || contact.zipCode) ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl">
                        <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-400 mb-1">Address</p>
                          <div className="text-white">
                            {contact.address && (
                              <p className="font-medium">{contact.address}</p>
                            )}
                            {(contact.city || contact.state || contact.zipCode) && (
                              <p className="text-sm">
                                {contact.city && contact.city}
                                {contact.city && contact.state && ', '}
                                {contact.state && contact.state}
                                {contact.zipCode && ` ${contact.zipCode}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Google Map */}
                      <GoogleMap 
                        address={`${contact.address || ''} ${contact.city || ''} ${contact.state || ''} ${contact.zipCode || ''}`.trim() || 'New York, NY'}
                        className="w-full h-64 rounded-xl overflow-hidden"
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-800 rounded-xl text-center">
                      <MapPinIcon className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No address information available</p>
                      <p className="text-slate-500 text-xs mt-1">Add address to see location on map</p>
                    </div>
                  )}
                </div>

                {/* Specialties & Certifications */}
                {(contact.contactType === 'subcontractor' || contact.contactType === 'contributor') && (contact.specialties?.length || contact.certifications?.length) && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Professional Information</h4>
                    <div className="space-y-4">
                      {contact.specialties?.length && (
                        <div className="p-4 bg-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <WrenchScrewdriverIcon className="h-5 w-5 text-slate-400" />
                            <p className="text-sm text-slate-400 font-medium">Specialties</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {contact.specialties.map((specialty, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-slate-700 text-white text-sm rounded-full border border-slate-600"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {contact.certifications?.length && (
                        <div className="p-4 bg-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <AcademicCapIcon className="h-5 w-5 text-slate-400" />
                            <p className="text-sm text-slate-400 font-medium">Certifications</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {contact.certifications.map((cert, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-green-900 text-green-100 text-sm rounded-full border border-green-700"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {(contact.accountType || contact.source || contact.lastContact) && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Additional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.accountType && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                          <UserIcon className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-400">Type</p>
                            <p className="font-medium text-white capitalize">
                              {contact.accountType}
                            </p>
                          </div>
                        </div>
                      )}
                      {contact.lastContact && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                          <ClockIcon className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-400">Last Contact</p>
                            <p className="font-medium text-white">
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
                    <h4 className="text-lg font-semibold text-white mb-4">Notes</h4>
                    <div className="p-4 bg-slate-800 rounded-xl">
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Activity timeline coming soon</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Documents management coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
