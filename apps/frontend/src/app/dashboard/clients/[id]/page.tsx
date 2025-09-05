"use client";

import {
  ArrowLeftIcon,
  BanknotesIcon,
  BellIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkIcon,
  MapIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SpeakerWaveIcon,
  TagIcon,
  UserIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  StarIcon as StarIconSolid,
  TagIcon as TagIconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Enhanced entity interface supporting clients, subcontractors, and vendors
interface Entity {
  _id: string;
  type: 'client' | 'subcontractor' | 'vendor';
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
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  source?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;

  // Business metrics
  totalProjects?: number;
  totalValue?: number;
  averageProjectValue?: number;
  rating?: number;

  // Integration data
  quickbooksId?: string;
  googleMapsPlaceId?: string;
  twilioSmsEnabled?: boolean;
  sendgridContactId?: string;
  emailVerified?: boolean;

  // Entity-specific fields
  contractorLicense?: string;
  insuranceExpiry?: string;
  vendorCategory?: string;
  paymentTerms?: string;
  preferredContactMethod?: 'email' | 'sms' | 'phone' | 'app';

  // Communication preferences
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    voiceCall: boolean;
    push: boolean;
    marketing: boolean;
  };

  // Custom fields
  customFields?: Record<string, any>;

  // Relationships
  parentCompany?: string;
  subsidiaries?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface IntegrationsStatus {
  sendgrid: {
    connected: boolean;
    contactId?: string;
    lastSync?: string;
    emailsSent?: number;
  };
  twilio: {
    connected: boolean;
    phoneVerified?: boolean;
    lastSms?: string;
    smsCount?: number;
  };
  quickbooks: {
    connected: boolean;
    customerId?: string;
    lastSync?: string;
    syncStatus?: 'success' | 'error' | 'pending';
  };
  googleMaps: {
    placeId?: string;
    verified?: boolean;
    coordinates?: { lat: number; lng: number };
  };
}

interface VoiceCall {
  _id: string;
  type: 'inbound' | 'outbound';
  duration: number;
  timestamp: string;
  status: 'completed' | 'missed' | 'failed' | 'busy' | 'no-answer';
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  followUpRequired?: boolean;
  cost?: number;
  provider: 'twilio' | 'elevenlabs';
}

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'site_visit' | 'meeting' | 'call' | 'follow_up';
  location?: string;
  notes?: string;
  reminder?: {
    email: boolean;
    sms: boolean;
    timeBeforeMinutes: number;
  };
}

interface Communication {
  _id: string;
  type: 'email' | 'sms' | 'call' | 'meeting' | 'note' | 'system';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  provider?: 'sendgrid' | 'twilio' | 'manual' | 'system';
  externalId?: string;
  cost?: number;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  metadata?: Record<string, any>;
}

interface Document {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  category: 'contract' | 'insurance' | 'license' | 'photo' | 'drawing' | 'invoice' | 'estimate' | 'other';
  isPublic: boolean;
  tags: string[];
  version?: number;
  parentDocument?: string;
  expiryDate?: string;
  isSignatureRequired?: boolean;
  signatureStatus?: 'pending' | 'signed' | 'expired';
}

interface Estimate {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'converted';
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    category?: string;
  }>;
  quickbooksId?: string;
  pdfUrl?: string;
  viewCount?: number;
  lastViewed?: string;
  notes?: string;
  termsAndConditions?: string;
}

interface Invoice {
  _id: string;
  clientId: string;
  estimateId?: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  createdAt: string;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  quickbooksId?: string;
  pdfUrl?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
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
  type: 'internal' | 'client' | 'system' | 'automated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

type TabType = 'overview' | 'communications' | 'documents' | 'estimates' | 'invoices' | 'messages' | 'voice' | 'appointments' | 'integrations' | 'settings';

export default function EnhancedEntityDetailPage() {
  const router = useRouter();
  const { id: entityId } = useParams();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // State for each tab's data
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationsStatus>({
    sendgrid: { connected: false },
    twilio: { connected: false },
    quickbooks: { connected: false },
    googleMaps: {}
  });

  // Loading states for each tab
  const [tabLoading, setTabLoading] = useState<Record<TabType, boolean>>({
    overview: false,
    communications: false,
    documents: false,
    estimates: false,
    invoices: false,
    messages: false,
    voice: false,
    appointments: false,
    integrations: false,
    settings: false
  });

  // Quick actions state
  const [quickActionLoading, setQuickActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!entityId) return;

    const fetchEntity = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/clients/${entityId}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setEntity(data);
        } else {
          setError('Entity not found');
        }
      } catch (error) {
        setError('Failed to fetch entity');
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [entityId]);

  // Fetch data for active tab
  useEffect(() => {
    if (!entityId || !entity) return;

    const fetchTabData = async () => {
      setTabLoading(prev => ({ ...prev, [activeTab]: true }));

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
            const response = await fetch(`/api/clients/${entityId}/estimates`, { headers });
            if (response.ok) {
              const data = await response.json();
              setEstimates(data);
            }
            break;
          }
          case 'invoices': {
            const response = await fetch(`/api/clients/${entityId}/invoices`, { headers });
            if (response.ok) {
              const data = await response.json();
              setInvoices(data);
            }
            break;
          }
          case 'communications': {
            const response = await fetch(`/api/clients/${entityId}/communications`, { headers });
            if (response.ok) {
              const data = await response.json();
              setCommunications(data);
            }
            break;
          }
          case 'documents': {
            const response = await fetch(`/api/clients/${entityId}/documents`, { headers });
            if (response.ok) {
              const data = await response.json();
              setDocuments(data);
            }
            break;
          }
          case 'messages': {
            const response = await fetch(`/api/clients/${entityId}/messages`, { headers });
            if (response.ok) {
              const data = await response.json();
              setMessages(data);
            }
            break;
          }
          case 'voice': {
            const response = await fetch(`/api/clients/${entityId}/voice-calls`, { headers });
            if (response.ok) {
              const data = await response.json();
              setVoiceCalls(data);
            }
            break;
          }
          case 'appointments': {
            const response = await fetch(`/api/clients/${entityId}/appointments`, { headers });
            if (response.ok) {
              const data = await response.json();
              setAppointments(data);
            }
            break;
          }
          case 'integrations': {
            const response = await fetch(`/api/clients/${entityId}/integrations`, { headers });
            if (response.ok) {
              const data = await response.json();
              setIntegrations(data);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching tab data:', error);
      } finally {
        setTabLoading(prev => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchTabData();
  }, [activeTab, entityId, entity]);

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'client': return <UserIcon className="h-5 w-5" />;
      case 'subcontractor': return <UserGroupIconSolid className="h-5 w-5" />;
      case 'vendor': return <BuildingOfficeIcon className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'subcontractor': return 'bg-green-100 text-green-800 border-green-200';
      case 'vendor': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-5 w-5 text-green-500" />;
      case 'inactive': return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'suspended': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleQuickAction = async (action: string) => {
    setQuickActionLoading(prev => ({ ...prev, [action]: true }));

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      switch (action) {
        case 'send_email':
          // Trigger SendGrid email
          await fetch(`/api/communications/email`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: entity?.email,
              subject: 'Quick Follow-up',
              message: 'This is a quick follow-up message.',
              entityId: entityId
            })
          });
          break;

        case 'send_sms':
          // Trigger Twilio SMS
          await fetch(`/api/communications/sms`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: entity?.phone,
              message: 'Quick SMS from your CRM',
              entityId: entityId
            })
          });
          break;

        case 'voice_call':
          // Trigger Twilio voice call
          await fetch(`/api/voice-agent/outbound`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              clientId: entityId,
              callType: 'general_follow_up'
            })
          });
          break;

        case 'sync_quickbooks':
          // Sync with QuickBooks
          await fetch(`/api/clients/${entityId}?action=sync-quickbooks`, {
            method: 'POST',
            headers
          });
          break;

        case 'view_map':
          // Open Google Maps
          if (entity?.address) {
            const address = `${entity.address.street}, ${entity.address.city}, ${entity.address.state} ${entity.address.zipCode}`;
            const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
            window.open(mapsUrl, '_blank');
          }
          break;
      }

      // Refresh data after action
      window.location.reload();
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setQuickActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="text-[var(--text-dim)] text-sm">Loading entity details...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">Entity Not Found</h1>
          <p className="text-[var(--text-dim)] mb-6">{error}</p>
          <Link href="/dashboard/clients" className="btn btn-amber">
            Back to Entities
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: InformationCircleIcon },
    { id: 'communications', label: 'Communications', icon: ChatBubbleLeftRightIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'estimates', label: 'Estimates', icon: DocumentDuplicateIcon },
    { id: 'invoices', label: 'Invoices', icon: BanknotesIcon },
    { id: 'messages', label: 'Messages', icon: EnvelopeIcon },
    { id: 'voice', label: 'Voice Calls', icon: SpeakerWaveIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-[var(--text-dim)]" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getEntityTypeColor(entity.type)}`}>
                  {getEntityTypeIcon(entity.type)}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[var(--text)]">
                    {entity.firstName} {entity.lastName}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                    <span className="capitalize">{entity.type}</span>
                    {entity.company && (
                      <>
                        <span>•</span>
                        <span>{entity.company}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="btn btn-amber-outline"
                >
                  <PlusIcon className="h-4 w-4" />
                  Quick Actions
                </button>

                {showQuickActions && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      <button
                        onClick={() => handleQuickAction('send_email')}
                        disabled={!entity.email || quickActionLoading.send_email}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Send Email</div>
                          <div className="text-xs text-[var(--text-dim)]">Via SendGrid</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleQuickAction('send_sms')}
                        disabled={!entity.phone || quickActionLoading.send_sms}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />
                        <div className="text-left">
                          <div className="font-medium">Send SMS</div>
                          <div className="text-xs text-[var(--text-dim)]">Via Twilio</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleQuickAction('voice_call')}
                        disabled={!entity.phone || quickActionLoading.voice_call}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <PhoneIcon className="h-5 w-5 text-purple-500" />
                        <div className="text-left">
                          <div className="font-medium">Voice Call</div>
                          <div className="text-xs text-[var(--text-dim)]">AI Assistant</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleQuickAction('sync_quickbooks')}
                        disabled={quickActionLoading.sync_quickbooks}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <LinkIcon className="h-5 w-5 text-orange-500" />
                        <div className="text-left">
                          <div className="font-medium">Sync QuickBooks</div>
                          <div className="text-xs text-[var(--text-dim)]">Update accounting</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleQuickAction('view_map')}
                        disabled={!entity.address}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MapIcon className="h-5 w-5 text-red-500" />
                        <div className="text-left">
                          <div className="font-medium">View on Map</div>
                          <div className="text-xs text-[var(--text-dim)]">Google Maps</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="btn btn-gray-outline">
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entity Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(entity.status)}
                  <span className="font-semibold text-[var(--text)] capitalize">{entity.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Total Value</p>
                <p className="text-2xl font-bold text-[var(--text)]">
                  ${entity.totalValue?.toLocaleString() || '0'}
                </p>
              </div>
              <CurrencyDollarIconSolid className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Projects</p>
                <p className="text-2xl font-bold text-[var(--text)]">{entity.totalProjects || 0}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-4 w-4 ${i < (entity.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-[var(--text-dim)]">
                    {entity.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <div className="border-b border-[var(--border)]">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`${
                      isActive
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text)] hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                    {tabLoading[tab.id as TabType] && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">Contact Information</h3>
                    <div className="space-y-3">
                      {entity.email && (
                        <div className="flex items-center gap-3">
                          <EnvelopeIcon className="h-5 w-5 text-[var(--text-dim)]" />
                          <a href={`mailto:${entity.email}`} className="text-blue-600 hover:underline">
                            {entity.email}
                          </a>
                          {entity.emailVerified && (
                            <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                      {entity.phone && (
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="h-5 w-5 text-[var(--text-dim)]" />
                          <a href={`tel:${entity.phone}`} className="text-blue-600 hover:underline">
                            {entity.phone}
                          </a>
                          {entity.twilioSmsEnabled && (
                            <DevicePhoneMobileIcon className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                      {entity.address && (
                        <div className="flex items-start gap-3">
                          <MapPinIcon className="h-5 w-5 text-[var(--text-dim)] mt-0.5" />
                          <div className="text-[var(--text)]">
                            {entity.address.street && <div>{entity.address.street}</div>}
                            <div>
                              {entity.address.city}, {entity.address.state} {entity.address.zipCode}
                            </div>
                            {entity.address.country && <div>{entity.address.country}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">Additional Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ClockIcon className="h-5 w-5 text-[var(--text-dim)]" />
                        <span className="text-[var(--text)]">
                          Created {new Date(entity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {entity.lastContactDate && (
                        <div className="flex items-center gap-3">
                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--text-dim)]" />
                          <span className="text-[var(--text)]">
                            Last contact {new Date(entity.lastContactDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {entity.source && (
                        <div className="flex items-center gap-3">
                          <TagIcon className="h-5 w-5 text-[var(--text-dim)]" />
                          <span className="text-[var(--text)]">Source: {entity.source}</span>
                        </div>
                      )}
                      {entity.preferredContactMethod && (
                        <div className="flex items-center gap-3">
                          <BellIcon className="h-5 w-5 text-[var(--text-dim)]" />
                          <span className="text-[var(--text)]">
                            Prefers: {entity.preferredContactMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {entity.tags && entity.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {entity.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200"
                        >
                          <TagIconSolid className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {entity.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Notes</h3>
                    <div className="bg-[var(--surface-2)] rounded-lg p-4 border border-[var(--border)]">
                      <p className="text-[var(--text)] whitespace-pre-wrap">{entity.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Voice Calls Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Voice Calls History</h2>
                  <button className="btn btn-amber">
                    <PhoneIcon className="h-4 w-4" />
                    Make Call
                  </button>
                </div>

                {tabLoading.voice ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {voiceCalls.map((call) => (
                      <div key={call._id} className="bg-[var(--surface-2)] rounded-lg p-4 border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${call.type === 'outbound' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {call.type === 'outbound' ? <PhoneIcon className="h-5 w-5" /> : <DevicePhoneMobileIcon className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text)]">
                                {call.type === 'outbound' ? 'Outbound Call' : 'Inbound Call'}
                              </p>
                              <p className="text-sm text-[var(--text-dim)]">
                                {new Date(call.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              call.status === 'completed' ? 'bg-green-100 text-green-800' :
                              call.status === 'no-answer' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {call.status}
                            </span>
                            {call.duration > 0 && (
                              <span className="text-sm text-[var(--text-dim)]">
                                {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>

                        {call.transcript && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-[var(--text)] mb-1">Transcript</h4>
                            <p className="text-sm text-[var(--text-dim)] bg-[var(--surface)] p-3 rounded border">
                              {call.transcript}
                            </p>
                          </div>
                        )}

                        {call.summary && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-[var(--text)] mb-1">Summary</h4>
                            <p className="text-sm text-[var(--text-dim)]">{call.summary}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                          <div className="flex items-center gap-4">
                            <span>Provider: {call.provider}</span>
                            <span>Cost: ${call.cost?.toFixed(3) || '0.000'}</span>
                          </div>
                          {call.followUpRequired && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Follow-up Required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {voiceCalls.length === 0 && (
                      <div className="text-center py-8">
                        <SpeakerWaveIcon className="h-12 w-12 text-[var(--text-dim)] mx-auto mb-3" />
                        <p className="text-[var(--text-dim)]">No voice calls yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Appointments</h2>
                  <button className="btn btn-amber">
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Appointment
                  </button>
                </div>

                {tabLoading.appointments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="bg-[var(--surface-2)] rounded-lg p-4 border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-[var(--text)]">{appointment.title}</h3>
                            <p className="text-sm text-[var(--text-dim)]">{appointment.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-[var(--text-dim)]">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {new Date(appointment.startTime).toLocaleDateString()} at {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {appointment.endTime && ` - ${new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                            </span>
                          </div>

                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              <span>{appointment.location}</span>
                            </div>
                          )}

                          {appointment.type && (
                            <div className="flex items-center gap-2">
                              <TagIcon className="h-4 w-4" />
                              <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)]">
                            <p className="text-sm text-[var(--text-dim)]">{appointment.notes}</p>
                          </div>
                        )}

                        {appointment.reminder && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)]">
                            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                              <BellIcon className="h-4 w-4" />
                              <span>
                                Reminders: {appointment.reminder.timeBeforeMinutes} min before
                                {appointment.reminder.email && ' • Email'}
                                {appointment.reminder.sms && ' • SMS'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {appointments.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-[var(--text-dim)] mx-auto mb-3" />
                        <p className="text-[var(--text-dim)]">No appointments scheduled</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Integrations</h2>
                  <button className="btn btn-amber">
                    <LinkIcon className="h-4 w-4" />
                    Manage Integrations
                  </button>
                </div>

                {tabLoading.integrations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SendGrid Integration */}
                    <div className="bg-[var(--surface-2)] rounded-lg p-6 border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <EnvelopeIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--text)]">SendGrid</h3>
                            <p className="text-sm text-[var(--text-dim)]">Email Marketing</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integrations.sendgrid?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {integrations.sendgrid?.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>

                      {integrations.sendgrid?.connected && (
                        <div className="space-y-2 text-sm text-[var(--text-dim)]">
                          <div>Contact ID: {integrations.sendgrid.contactId}</div>
                          <div>Emails Sent: {integrations.sendgrid.emailsSent}</div>
                          <div>Last Sync: {integrations.sendgrid.lastSync ? new Date(integrations.sendgrid.lastSync).toLocaleDateString() : 'Never'}</div>
                          {integrations.sendgrid.listIds && (
                            <div>Lists: {integrations.sendgrid.listIds.join(', ')}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Twilio Integration */}
                    <div className="bg-[var(--surface-2)] rounded-lg p-6 border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <DevicePhoneMobileIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--text)]">Twilio</h3>
                            <p className="text-sm text-[var(--text-dim)]">SMS & Voice</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integrations.twilio?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {integrations.twilio?.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>

                      {integrations.twilio?.connected && (
                        <div className="space-y-2 text-sm text-[var(--text-dim)]">
                          <div>Phone: {integrations.twilio.phoneNumber}</div>
                          <div>SMS Count: {integrations.twilio.smsCount}</div>
                          <div>Last SMS: {integrations.twilio.lastSms ? new Date(integrations.twilio.lastSms).toLocaleDateString() : 'Never'}</div>
                          <div>Verified: {integrations.twilio.phoneVerified ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                    </div>

                    {/* QuickBooks Integration */}
                    <div className="bg-[var(--surface-2)] rounded-lg p-6 border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <BanknotesIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--text)]">QuickBooks</h3>
                            <p className="text-sm text-[var(--text-dim)]">Accounting</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integrations.quickbooks?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {integrations.quickbooks?.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>

                      {integrations.quickbooks?.connected && integrations.quickbooks.accountingData && (
                        <div className="space-y-2 text-sm text-[var(--text-dim)]">
                          <div>Customer ID: {integrations.quickbooks.customerId}</div>
                          <div>Total Invoiced: ${integrations.quickbooks.accountingData.totalInvoiced?.toLocaleString()}</div>
                          <div>Total Paid: ${integrations.quickbooks.accountingData.totalPaid?.toLocaleString()}</div>
                          <div>Outstanding: ${integrations.quickbooks.accountingData.outstanding?.toLocaleString()}</div>
                          <div>Last Sync: {integrations.quickbooks.lastSync ? new Date(integrations.quickbooks.lastSync).toLocaleDateString() : 'Never'}</div>
                        </div>
                      )}
                    </div>

                    {/* Google Maps Integration */}
                    <div className="bg-[var(--surface-2)] rounded-lg p-6 border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <MapIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--text)]">Google Maps</h3>
                            <p className="text-sm text-[var(--text-dim)]">Location Services</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integrations.googleMaps?.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {integrations.googleMaps?.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>

                      {integrations.googleMaps?.verified && (
                        <div className="space-y-2 text-sm text-[var(--text-dim)]">
                          <div>Place ID: {integrations.googleMaps.placeId}</div>
                          {integrations.googleMaps.coordinates && (
                            <div>
                              Coordinates: {integrations.googleMaps.coordinates.lat}, {integrations.googleMaps.coordinates.lng}
                            </div>
                          )}
                          {integrations.googleMaps.businessHours && (
                            <div className="mt-3">
                              <div className="font-medium mb-1">Business Hours:</div>
                              {Object.entries(integrations.googleMaps.businessHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                  <span className="capitalize">{day}:</span>
                                  <span>{String(hours)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs - keeping the existing "Coming Soon" for now */}
            {activeTab !== 'overview' && activeTab !== 'voice' && activeTab !== 'appointments' && activeTab !== 'integrations' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {tabs.find(t => t.id === activeTab)?.label} - Coming Soon
                </h3>
                <p className="text-[var(--text-dim)]">
                  This section is under development and will include comprehensive {activeTab} management.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
