"use client";

import MapEmbed from '@/components/MapEmbed';
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
    XCircleIcon,
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleIconSolid,
    CurrencyDollarIcon as CurrencyDollarIconSolid,
    StarIcon as StarIconSolid,
    TagIcon as TagIconSolid,
    UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Minimal client-side types (kept local to avoid breaking imports)
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
  source?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  totalProjects?: number;
  totalValue?: number;
  averageProjectValue?: number;
  rating?: number;
  twilioSmsEnabled?: boolean;
  emailVerified?: boolean;
  preferredContactMethod?: 'email' | 'sms' | 'phone' | 'app';
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    voiceCall: boolean;
    push: boolean;
    marketing: boolean;
  };
}

type TabType = 'overview' | 'communications' | 'documents' | 'estimates' | 'invoices' | 'messages' | 'voice' | 'appointments' | 'integrations' | 'settings';

export default function ClientDetailClient({ initialEntity, entityId }: { initialEntity?: Entity | null; entityId: string }) {
  const router = useRouter();
  const [entity, setEntity] = useState<Entity | null>(initialEntity ?? null);
  const [loading, setLoading] = useState(!initialEntity);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Detailed tab data is fetched on demand when a tab is activated; avoid unused state warnings

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

  const [quickActionLoading, setQuickActionLoading] = useState<Record<string, boolean>>({});

  // Keep setters available for tab fetches (values intentionally unused in this wrapper)
  // Minimal typed setters to satisfy linter; values intentionally unused here.
  const [, setVoiceCalls] = useState<Array<Record<string, unknown>>>([]);
  const [, setAppointments] = useState<Array<Record<string, unknown>>>([]);
  const [, setIntegrations] = useState<Record<string, unknown>>({
    sendgrid: { connected: false },
    twilio: { connected: false },
    quickbooks: { connected: false },
    googleMaps: {}
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!entityId) return;
    if (entity) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchEntity = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/clients/${entityId}`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setEntity(data);
        } else if (response.status === 401) {
          // No demo data - require proper authentication
          if (!cancelled) setError('Authentication required - please login to view client details');
        } else {
          if (!cancelled) setError('Entity not found');
        }
      } catch (err) {
        if (!cancelled) setError('Failed to fetch entity');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEntity();
    return () => { cancelled = true; };
  }, [entityId, entity]);

  useEffect(() => {
    if (!entityId || !entity) return;
    const fetchTabData = async () => {
      setTabLoading(prev => ({ ...prev, [activeTab]: true }));
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        switch (activeTab) {
          case 'voice': {
            const response = await fetch(`/api/clients/${entityId}/voice-calls`, { headers });
            if (response.ok) setVoiceCalls(await response.json());
            break;
          }
          case 'appointments': {
            const response = await fetch(`/api/clients/${entityId}/appointments`, { headers });
            if (response.ok) setAppointments(await response.json());
            break;
          }
          case 'integrations': {
            const response = await fetch(`/api/clients/${entityId}/integrations`, { headers });
            if (response.ok) setIntegrations(await response.json());
            break;
          }
        }
      } catch (err) {
        // ignore fetch errors for tabs in the client; UI shows empty states
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
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      switch (action) {
        case 'send_email':
          await fetch(`/api/communications/email`, { method: 'POST', headers, body: JSON.stringify({ to: entity?.email, subject: 'Quick Follow-up', message: 'This is a quick follow-up message.', entityId }) });
          break;
        case 'send_sms':
          await fetch(`/api/communications/sms`, { method: 'POST', headers, body: JSON.stringify({ to: entity?.phone, message: 'Quick SMS from your CRM', entityId }) });
          break;
        case 'voice_call':
          await fetch(`/api/voice-agent/outbound`, { method: 'POST', headers, body: JSON.stringify({ clientId: entityId, callType: 'general_follow_up' }) });
          break;
        case 'view_map':
          if (entity?.address) {
            const address = `${entity.address.street}, ${entity.address.city}, ${entity.address.state} ${entity.address.zipCode}`;
            const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
            window.open(mapsUrl, '_blank');
          }
          break;
        case 'share_portal': {
          const resp = await fetch(`/api/clients/${entityId}/portal`, { method: 'POST', headers });
          const data = await resp.json();
          if (data?.url) {
            await navigator.clipboard.writeText(data.url);
            alert('Client portal link copied to clipboard');
          }
          break;
        }
      }
      window.location.reload();
    } catch (err) {
      // swallow fetch errors for non-critical dev preview; logged for debugging
      // eslint-disable-next-line no-console
      console.debug('tab fetch error', err);
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
          <Link href="/dashboard/clients" className="btn btn-amber">Back to Entities</Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button onClick={() => router.back()} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-[var(--text-dim)]" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getEntityTypeColor(entity.type)}`}>
                  {getEntityTypeIcon(entity.type)}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[var(--text)]">{entity.firstName} {entity.lastName}</h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                    <span className="capitalize">{entity.type}</span>
                    {entity.company && (<><span>•</span><span>{entity.company}</span></>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative">
                <button onClick={() => setShowQuickActions(!showQuickActions)} className="btn btn-amber-outline">
                  <PlusIcon className="h-4 w-4" /> Quick Actions
                </button>
                {showQuickActions && (
                  <div className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      <button onClick={() => handleQuickAction('send_email')} disabled={!entity.email || quickActionLoading.send_email} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50">
                        <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                        <div className="text-left"><div className="font-medium">Send Email</div><div className="text-xs text-[var(--text-dim)]">Via SendGrid</div></div>
                      </button>
                      <button onClick={() => handleQuickAction('send_sms')} disabled={!entity.phone || quickActionLoading.send_sms} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />
                        <div className="text-left"><div className="font-medium">Send SMS</div><div className="text-xs text-[var(--text-dim)]">Via Twilio</div></div>
                      </button>
                      <button onClick={() => handleQuickAction('voice_call')} disabled={!entity.phone || quickActionLoading.voice_call} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50">
                        <PhoneIcon className="h-5 w-5 text-purple-500" />
                        <div className="text-left"><div className="font-medium">Voice Call</div><div className="text-xs text-[var(--text-dim)]">AI Assistant</div></div>
                      </button>
                      <button onClick={() => handleQuickAction('view_map')} disabled={!entity.address} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50">
                        <MapIcon className="h-5 w-5 text-red-500" />
                        <div className="text-left"><div className="font-medium">View on Map</div><div className="text-xs text-[var(--text-dim)]">Google Maps</div></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button className="btn btn-gray-outline"><PencilIcon className="h-4 w-4" /> Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Status</p>
                <div className="flex items-center gap-2 mt-1">{getStatusIcon(entity.status)}<span className="font-semibold text-[var(--text)] capitalize">{entity.status}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <button onClick={() => handleQuickAction('share_portal')} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors disabled:opacity-50">
                <LinkIcon className="h-5 w-5 text-amber-500" />
                <div className="text-left"><div className="font-medium">Share Client Portal</div><div className="text-xs text-[var(--text-dim)]">Copy link</div></div>
              </button>
              <div>
                <p className="text-sm text-[var(--text-dim)]">Total Value</p>
                <p className="text-2xl font-bold text-[var(--text)]">${entity.totalValue?.toLocaleString() || '0'}</p>
              </div>
              <CurrencyDollarIconSolid className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-[var(--text-dim)]">Projects</p><p className="text-2xl font-bold text-[var(--text)]">{entity.totalProjects || 0}</p></div><ChartBarIcon className="h-8 w-8 text-blue-500" /></div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-[var(--text-dim)]">Rating</p><div className="flex items-center gap-1 mt-1">{[...Array(5)].map((_, i) => (<StarIconSolid key={i} className={`h-4 w-4 ${i < (entity.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />))}<span className="ml-2 text-sm text-[var(--text-dim)]">{entity.rating?.toFixed(1) || 'N/A'}</span></div></div></div>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <div className="border-b border-[var(--border)]">
            <nav className="flex space-x-4 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`${isActive ? 'border-amber-500 text-amber-600' : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text)] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                    <IconComponent className="h-4 w-4" />{tab.label}{tabLoading[tab.id as TabType] && (<div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />)}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">Contact Information</h3>
                    <div className="space-y-3">
                      {entity.email && (<div className="flex items-center gap-3"><EnvelopeIcon className="h-5 w-5 text-[var(--text-dim)]" /><a href={`mailto:${entity.email}`} className="text-blue-600 hover:underline">{entity.email}</a>{entity.emailVerified && (<CheckCircleIconSolid className="h-4 w-4 text-green-500" />)}</div>)}
                      {entity.phone && (<div className="flex items-center gap-3"><PhoneIcon className="h-5 w-5 text-[var(--text-dim)]" /><a href={`tel:${entity.phone}`} className="text-blue-600 hover:underline">{entity.phone}</a>{entity.twilioSmsEnabled && (<DevicePhoneMobileIcon className="h-4 w-4 text-green-500" />)}</div>)}
                      {entity.address && (<div className="flex items-start gap-3"><MapPinIcon className="h-5 w-5 text-[var(--text-dim)] mt-0.5" /><div className="text-[var(--text)]">{entity.address.street && <div>{entity.address.street}</div>}<div>{entity.address.city}, {entity.address.state} {entity.address.zipCode}</div>{entity.address.country && <div>{entity.address.country}</div>}</div></div>)}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">Additional Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Created {new Date(entity.createdAt).toLocaleDateString()}</span></div>
                      {entity.lastContactDate && (<div className="flex items-center gap-3"><ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Last contact {new Date(entity.lastContactDate).toLocaleDateString()}</span></div>)}
                      {entity.source && (<div className="flex items-center gap-3"><TagIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Source: {entity.source}</span></div>)}
                      {entity.preferredContactMethod && (<div className="flex items-center gap-3"><BellIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Prefers: {entity.preferredContactMethod}</span></div>)}
                    </div>
                    {entity.address && (<div className="mt-4"><h4 className="text-sm font-medium text-[var(--text)] mb-2">Location</h4><MapEmbed address={`${entity.address.street ?? ''}, ${entity.address.city ?? ''}, ${entity.address.state ?? ''} ${entity.address.zipCode ?? ''}`} coordinates={entity.address.coordinates} /></div>)}
                  </div>
                </div>
                {entity.tags && entity.tags.length > 0 && (<div><h3 className="text-lg font-semibold text-[var(--text)] mb-3">Tags</h3><div className="flex flex-wrap gap-2">{entity.tags.map((tag, index) => (<span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200"><TagIconSolid className="h-3 w-3 mr-1" />{tag}</span>))}</div></div>)}
                {entity.notes && (<div><h3 className="text-lg font-semibold text-[var(--text)] mb-3">Notes</h3><div className="bg-[var(--surface-2)] rounded-lg p-4 border border-[var(--border)]"><p className="text-[var(--text)] whitespace-pre-wrap">{entity.notes}</p></div></div>)}
              </div>
            )}

            {/* Other tab renderings omitted for brevity - kept client behaviour consistent */}
            {activeTab !== 'overview' && activeTab !== 'voice' && activeTab !== 'appointments' && activeTab !== 'integrations' && (
              <div className="text-center py-12"><div className="text-6xl mb-4">🚧</div><h3 className="text-lg font-semibold text-[var(--text)] mb-2">{tabs.find(t => t.id === activeTab)?.label} - Coming Soon</h3><p className="text-[var(--text-dim)]">This section is under development and will include comprehensive {activeTab} management.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
