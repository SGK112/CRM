"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { simple } from '@/lib/simple-ui';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TagIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  LinkIcon,
  CloudArrowUpIcon,
  PlayIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  TagIcon as TagIconSolid,
  BellIcon as BellIconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  tags: string[];
  status: string;
  source?: string;
  socialProfiles: {
    platform: string;
    username: string;
    url: string;
  }[];
  projects: string[];
  createdAt: string;
  updatedAt: string;
}

interface Estimate {
  _id: string;
  title: string;
  status: string;
  total: number;
  createdAt: string;
  viewedAt?: string;
}

interface Invoice {
  _id: string;
  title: string;
  status: string;
  total: number;
  dueDate: string;
  createdAt: string;
}

interface Communication {
  _id: string;
  type: 'email' | 'sms' | 'call';
  direction: 'inbound' | 'outbound';
  subject?: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface Document {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  threadId?: string;
}

type TabType = 'overview' | 'communications' | 'documents' | 'estimates' | 'invoices' | 'messages';

export default function ClientDetailPage() {
  const { id: clientId } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // State for each tab's data
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Loading states for each tab
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/clients/${clientId}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError('Client not found');
        }
      } catch (error) {
        setError('Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  // Fetch data for active tab
  useEffect(() => {
    if (!clientId || !client) return;

    const fetchTabData = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        switch (activeTab) {
          case 'estimates': {
            setEstimatesLoading(true);
            const estimatesResponse = await fetch(`/api/clients/${clientId}/estimates`, { headers });
            if (estimatesResponse.ok) {
              const estimatesData = await estimatesResponse.json();
              setEstimates(estimatesData);
            }
            setEstimatesLoading(false);
            break;
          }
          case 'invoices': {
            setInvoicesLoading(true);
            const invoicesResponse = await fetch(`/api/clients/${clientId}/invoices`, { headers });
            if (invoicesResponse.ok) {
              const invoicesData = await invoicesResponse.json();
              setInvoices(invoicesData);
            }
            setInvoicesLoading(false);
            break;
          }
          case 'communications': {
            setCommunicationsLoading(true);
            const communicationsResponse = await fetch(`/api/clients/${clientId}/communications`, { headers });
            if (communicationsResponse.ok) {
              const communicationsData = await communicationsResponse.json();
              setCommunications(communicationsData);
            }
            setCommunicationsLoading(false);
            break;
          }
          case 'documents': {
            setDocumentsLoading(true);
            const documentsResponse = await fetch(`/api/clients/${clientId}/documents`, { headers });
            if (documentsResponse.ok) {
              const documentsData = await documentsResponse.json();
              setDocuments(documentsData);
            }
            setDocumentsLoading(false);
            break;
          }
          case 'messages': {
            setMessagesLoading(true);
            const messagesResponse = await fetch(`/api/clients/${clientId}/messages`, { headers });
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              setMessages(messagesData);
            }
            setMessagesLoading(false);
            break;
          }
        }
      } catch (error) {
        // Handle error silently
      }
    };

    fetchTabData();
  }, [activeTab, clientId, client]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-5 w-5 text-green-500" />;
      case 'lead': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'inactive': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'lead': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: UserIcon },
    { id: 'communications' as TabType, label: 'Communications', icon: ChatBubbleLeftRightIcon },
    { id: 'documents' as TabType, label: 'Documents', icon: DocumentTextIcon },
    { id: 'estimates' as TabType, label: 'Estimates', icon: CurrencyDollarIcon },
    { id: 'invoices' as TabType, label: 'Invoices', icon: DocumentTextIcon },
    { id: 'messages' as TabType, label: 'Messages', icon: EnvelopeIcon },
  ];

  if (loading) {
    return (
      <div className={simple.loading.page}>
        <div className={`${simple.loading.spinner} h-12 w-12`} />
        <p className={simple.text.body('mt-4')}>Loading client details...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={simple.page()}>
        <div className={simple.empty.container}>
          <ExclamationTriangleIcon className={simple.empty.icon} />
          <h3 className={simple.empty.title}>{error || 'Client Not Found'}</h3>
          <p className={simple.empty.description}>
            The requested client could not be located.
          </p>
          <Link
            href="/dashboard/clients"
            className={simple.button('primary', 'inline-flex items-center gap-2')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/clients"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <h1 className={simple.text.title('mb-1')}>
                {client.firstName} {client.lastName}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                  {getStatusIcon(client.status)}
                  {client.status}
                </span>
                <span className={simple.text.small()}>
                  Client since {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className={simple.button('secondary', 'flex items-center gap-2')}>
            <PaperAirplaneIcon className="h-4 w-4" />
            Send Message
          </button>
          <button className={simple.button('secondary', 'flex items-center gap-2')}>
            <PhoneIcon className="h-4 w-4" />
            Call
          </button>
          <Link
            href={`/dashboard/clients/${clientId}/edit`}
            className={simple.button('primary', 'flex items-center gap-2')}
          >
            <PencilIcon className="h-4 w-4" />
            Edit Client
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className={simple.grid.cols2}>
            {/* Contact Information */}
            <div className={simple.card()}>
              <div className={simple.section()}>
                <h2 className={simple.text.subtitle('mb-6 flex items-center gap-2')}>
                  <UserIcon className="h-5 w-5" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {client.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.email}</p>
                        <p className={simple.text.small()}>Email Address</p>
                      </div>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.phone}</p>
                        <p className={simple.text.small()}>Phone Number</p>
                      </div>
                    </div>
                  )}
                  {client.company && (
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.company}</p>
                        <p className={simple.text.small()}>Company</p>
                      </div>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {client.address.street && `${client.address.street}, `}
                          {client.address.city && `${client.address.city}, `}
                          {client.address.state && `${client.address.state} `}
                          {client.address.zipCode && client.address.zipCode}
                        </p>
                        <p className={simple.text.small()}>Address</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={simple.card()}>
              <div className={simple.section()}>
                <h2 className={simple.text.subtitle('mb-6 flex items-center gap-2')}>
                  <CurrencyDollarIconSolid className="h-5 w-5" />
                  Quick Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={simple.text.body()}>Total Projects</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{client.projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={simple.text.body()}>Active Estimates</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{estimates.filter(e => e.status === 'sent').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={simple.text.body()}>Total Value</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${estimates.reduce((sum, e) => sum + e.total, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={simple.text.body()}>Last Contact</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(client.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags & Notes */}
            {client.tags.length > 0 && (
              <div className={simple.card()}>
                <div className={simple.section()}>
                  <h2 className={simple.text.subtitle('mb-4 flex items-center gap-2')}>
                    <TagIconSolid className="h-5 w-5" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {client.notes && (
              <div className={simple.card()}>
                <div className={simple.section()}>
                  <h2 className={simple.text.subtitle('mb-4 flex items-center gap-2')}>
                    <DocumentTextIcon className="h-5 w-5" />
                    Notes
                  </h2>
                  <p className={simple.text.body()}>{client.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'communications' && (
          <div className={simple.card()}>
            <div className={simple.section()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={simple.text.subtitle('flex items-center gap-2')}>
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Communication History
                </h2>
                <button className={simple.button('primary', 'flex items-center gap-2')}>
                  <PlusIcon className="h-4 w-4" />
                  New Communication
                </button>
              </div>

              {communicationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`${simple.loading.spinner} h-8 w-8`} />
                  <p className={simple.text.body('ml-3')}>Loading communications...</p>
                </div>
              ) : communications.length > 0 ? (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm._id} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        comm.type === 'email' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        comm.type === 'sms' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {comm.type === 'email' && <EnvelopeIcon className="h-4 w-4 text-blue-600" />}
                        {comm.type === 'sms' && <DevicePhoneMobileIcon className="h-4 w-4 text-green-600" />}
                        {comm.type === 'call' && <PhoneIcon className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {comm.direction} {comm.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              comm.status === 'read' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              comm.status === 'delivered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {comm.status}
                            </span>
                          </div>
                          <span className={simple.text.small()}>
                            {new Date(comm.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {comm.subject && (
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">{comm.subject}</h3>
                        )}
                        <p className={simple.text.body()}>{comm.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={simple.empty.container}>
                  <ChatBubbleLeftRightIcon className={simple.empty.icon} />
                  <h3 className={simple.empty.title}>No communications yet</h3>
                  <p className={simple.empty.description}>
                    Start communicating with this client to track your interactions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={simple.card()}>
            <div className={simple.section()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={simple.text.subtitle('flex items-center gap-2')}>
                  <DocumentTextIcon className="h-5 w-5" />
                  Documents & Images
                </h2>
                <button className={simple.button('primary', 'flex items-center gap-2')}>
                  <PlusIcon className="h-4 w-4" />
                  Upload Document
                </button>
              </div>

              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`${simple.loading.spinner} h-8 w-8`} />
                  <p className={simple.text.body('ml-3')}>Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {doc.type.startsWith('image/') ? (
                            <PhotoIcon className="h-6 w-6 text-gray-600" />
                          ) : (
                            <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</h3>
                          <p className={simple.text.small()}>
                            {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              View
                            </button>
                            <button className="text-gray-600 hover:text-gray-700 text-sm">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={simple.empty.container}>
                  <DocumentTextIcon className={simple.empty.icon} />
                  <h3 className={simple.empty.title}>No documents yet</h3>
                  <p className={simple.empty.description}>
                    Upload documents and images related to this client's projects.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'estimates' && (
          <div className={simple.card()}>
            <div className={simple.section()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={simple.text.subtitle('flex items-center gap-2')}>
                  <CurrencyDollarIcon className="h-5 w-5" />
                  Estimates
                </h2>
                <Link
                  href={`/dashboard/clients/${clientId}/estimates/new`}
                  className={simple.button('primary', 'flex items-center gap-2')}
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Estimate
                </Link>
              </div>

              {estimatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`${simple.loading.spinner} h-8 w-8`} />
                  <p className={simple.text.body('ml-3')}>Loading estimates...</p>
                </div>
              ) : estimates.length > 0 ? (
                <div className="space-y-4">
                  {estimates.map((estimate) => (
                    <div key={estimate._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{estimate.title}</h3>
                          <p className={simple.text.small()}>
                            Created {new Date(estimate.createdAt).toLocaleDateString()}
                            {estimate.viewedAt && ` • Viewed ${new Date(estimate.viewedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${estimate.total.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            estimate.status === 'viewed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            estimate.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {estimate.status === 'viewed' && <EyeIcon className="h-3 w-3" />}
                            {estimate.status}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/estimates/${estimate._id}`}
                          className={simple.button('secondary', 'text-sm')}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={simple.empty.container}>
                  <CurrencyDollarIcon className={simple.empty.icon} />
                  <h3 className={simple.empty.title}>No estimates yet</h3>
                  <p className={simple.empty.description}>
                    Create estimates for this client's projects to track pricing and proposals.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className={simple.card()}>
            <div className={simple.section()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={simple.text.subtitle('flex items-center gap-2')}>
                  <DocumentTextIcon className="h-5 w-5" />
                  Invoices
                </h2>
                <Link
                  href={`/dashboard/clients/${clientId}/invoices/new`}
                  className={simple.button('primary', 'flex items-center gap-2')}
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Invoice
                </Link>
              </div>

              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`${simple.loading.spinner} h-8 w-8`} />
                  <p className={simple.text.body('ml-3')}>Loading invoices...</p>
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <DocumentTextIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{invoice.title}</h3>
                          <p className={simple.text.small()}>
                            Created {new Date(invoice.createdAt).toLocaleDateString()} •
                            Due {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${invoice.total.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/invoices/${invoice._id}`}
                          className={simple.button('secondary', 'text-sm')}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={simple.empty.container}>
                  <DocumentTextIcon className={simple.empty.icon} />
                  <h3 className={simple.empty.title}>No invoices yet</h3>
                  <p className={simple.empty.description}>
                    Create invoices for completed work and track payments from this client.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className={simple.card()}>
            <div className={simple.section()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={simple.text.subtitle('flex items-center gap-2')}>
                  <EnvelopeIcon className="h-5 w-5" />
                  Message Inbox
                </h2>
                <button className={simple.button('primary', 'flex items-center gap-2')}>
                  <PlusIcon className="h-4 w-4" />
                  Compose Message
                </button>
              </div>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`${simple.loading.spinner} h-8 w-8`} />
                  <p className={simple.text.body('ml-3')}>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message._id} className={`p-4 border rounded-lg ${
                      message.read
                        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!message.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <h3 className="font-medium text-gray-900 dark:text-white">{message.subject}</h3>
                        </div>
                        <span className={simple.text.small()}>
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={simple.text.small()}>From:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{message.from}</span>
                      </div>
                      <p className={simple.text.body()}>{message.message}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Reply
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm">
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={simple.empty.container}>
                  <EnvelopeIcon className={simple.empty.icon} />
                  <h3 className={simple.empty.title}>No messages yet</h3>
                  <p className={simple.empty.description}>
                    Messages from this client will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
