'use client';

import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ContactData {
  id: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  accountType?: string;
  source?: string;
  notes?: string;

  // Business/Professional Data
  website?: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
  businessType?: string;
  yearsInBusiness?: number;
  licenseNumber?: string;
  insuranceInfo?: {
    carrier?: string;
    policyNumber?: string;
    expirationDate?: string;
    coverageAmount?: number;
  };

  // Communication preferences
  preferredContact?: 'email' | 'phone' | 'text' | 'mail';
  bestTimeToContact?: string;
  communicationNotes?: string;

  // Payment and billing
  paymentTerms?: string;
  creditLimit?: number;
  creditRating?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };

  // Professional/Service specific
  specialties?: string[];
  serviceArea?: string;
  hourlyRate?: number;
  availability?: string;
  equipment?: string;

  // Team specific
  role?: string;
  department?: string;
  startDate?: string;
  employeeId?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastContact?: string;
  profileCompleteness?: number;
}

interface Message {
  id: string;
  type: 'sms' | 'email';
  direction: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  completed: boolean;
  fields: string[];
  contactTypes: string[];
}

export default function ContactProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contactId = params.id as string;
  const isNewContact = searchParams.get('created') === 'true';

  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'communication'>('profile');

  // Communication state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [sending, setSending] = useState(false);

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

    fetchContact();
  }, [contactId]);

  useEffect(() => {
    // Mock message data - replace with real API call
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'sms',
        direction: 'sent',
        content: 'Hi! Thanks for reaching out. I\'ll have your estimate ready by tomorrow.',
        timestamp: new Date(Date.now() - 86400000),
        status: 'delivered'
      },
      {
        id: '2',
        type: 'email',
        direction: 'received',
        content: 'Looking forward to seeing the estimate. When can we schedule the walkthrough?',
        timestamp: new Date(Date.now() - 43200000),
        status: 'read'
      }
    ];
    setMessages(mockMessages);
  }, []);

  // Calculate profile completeness
  const getProfileSections = (contactType: string): ProfileSection[] => {
    const baseSections: ProfileSection[] = [
      {
        id: 'basic',
        title: 'Basic Information',
        description: 'Essential contact details',
        icon: UserIcon,
        required: true,
        completed: !!(contact?.firstName && contact?.lastName && contact?.email),
        fields: ['firstName', 'lastName', 'email', 'phone'],
        contactTypes: ['client', 'subcontractor', 'vendor', 'contributor', 'team']
      },
      {
        id: 'communication',
        title: 'Communication Preferences',
        description: 'How and when to contact',
        icon: ChatBubbleLeftRightIcon,
        required: false,
        completed: !!(contact?.preferredContact && contact?.bestTimeToContact),
        fields: ['preferredContact', 'bestTimeToContact', 'communicationNotes'],
        contactTypes: ['client', 'subcontractor', 'vendor', 'contributor', 'team']
      }
    ];

    const businessSections: ProfileSection[] = [
      {
        id: 'business',
        title: 'Business Information',
        description: 'Company details and location',
        icon: BuildingOfficeIcon,
        required: true,
        completed: !!(contact?.company && contact?.businessAddress?.city),
        fields: ['company', 'businessAddress', 'businessPhone', 'website'],
        contactTypes: ['client', 'subcontractor', 'vendor']
      },
      {
        id: 'billing',
        title: 'Billing & Payment',
        description: 'Payment terms and billing info',
        icon: CreditCardIcon,
        required: false,
        completed: !!(contact?.paymentTerms && contact?.billingAddress?.city),
        fields: ['paymentTerms', 'creditLimit', 'billingAddress'],
        contactTypes: ['client', 'subcontractor', 'vendor']
      }
    ];

    const specialtySections: ProfileSection[] = [
      {
        id: 'professional',
        title: 'Professional Details',
        description: 'Skills, rates, and availability',
        icon: WrenchScrewdriverIcon,
        required: false,
        completed: !!(contact?.specialties?.length && contact?.hourlyRate),
        fields: ['specialties', 'hourlyRate', 'serviceArea', 'availability'],
        contactTypes: ['subcontractor', 'contributor']
      },
      {
        id: 'licensing',
        title: 'Licensing & Insurance',
        description: 'Professional credentials',
        icon: ShieldCheckIcon,
        required: true,
        completed: !!(contact?.licenseNumber && contact?.insuranceInfo?.carrier),
        fields: ['licenseNumber', 'insuranceInfo'],
        contactTypes: ['subcontractor']
      }
    ];

    const teamSections: ProfileSection[] = [
      {
        id: 'employment',
        title: 'Employment Information',
        description: 'Role and department details',
        icon: UserGroupIcon,
        required: true,
        completed: !!(contact?.role && contact?.department && contact?.startDate),
        fields: ['role', 'department', 'startDate', 'employeeId'],
        contactTypes: ['team']
      }
    ];

    const sections = [...baseSections];

    if (contactType === 'client') {
      sections.push(...businessSections.filter(s => s.contactTypes.includes('client')));
    } else if (contactType === 'subcontractor' || contactType === 'contributor') {
      sections.push(...businessSections.filter(s => s.contactTypes.includes(contactType)));
      sections.push(...specialtySections);
    } else if (contactType === 'vendor') {
      sections.push(...businessSections.filter(s => s.contactTypes.includes('vendor')));
    } else if (contactType === 'team') {
      sections.push(...teamSections);
    }

    return sections.filter(section => section.contactTypes.includes(contactType));
  };

  const updateContact = async (updates: Partial<ContactData>) => {
    if (!contact) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/clients/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        setContact(updated);
        setEditingSection(null);
      } else {
        setError('Failed to update contact');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Mock API call - replace with real implementation
      const message: Message = {
        id: Date.now().toString(),
        type: messageType,
        direction: 'sent',
        content: newMessage,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

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

  if (!contact) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading contact profile...</p>
          </div>
        </div>
      );
    }

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
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
  const contactType = contact.contactType || 'client';
  const sections = getProfileSections(contactType);
  const completedSections = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const requiredSections = sections.filter(s => s.required);
  const completedRequired = requiredSections.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-amber-500 px-4 py-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/clients/${contactId}`}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-white" />
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Contact Profile</h1>
            <p className="text-sm text-white">Complete for better CRM insights</p>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* Contact Header */}
      <div className="px-4 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor(contactType)}`}>
                {getContactTypeIcon(contactType)}
                {contactType}
              </span>
              {contact.accountType && (
                <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {contact.accountType}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {contact.email}
            </p>
          </div>
        </div>

        {/* Profile Completion Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Profile Completion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {completedSections} of {totalSections} sections completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{completionPercentage}%</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {completedRequired}/{requiredSections.length} required
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {isNewContact && completionPercentage < 70 && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Complete your contact profile to unlock advanced CRM features!
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    More data = better insights, automated messages, and personalized workflows.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-medium ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-medium ${
                activeTab === 'communication'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Communication
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="px-4 py-6 space-y-4">
          {sections.map((section) => (
            <ProfileSectionCard
              key={section.id}
              section={section}
              contact={contact}
              isEditing={editingSection === section.id}
              onEdit={() => setEditingSection(section.id)}
              onSave={(updates) => updateContact(updates)}
              onCancel={() => setEditingSection(null)}
              saving={saving}
            />
          ))}
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="px-4 py-6 space-y-6">
          {/* Communication Type Toggle */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setMessageType('sms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  messageType === 'sms'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <PhoneIcon className="h-4 w-4" />
                SMS
              </button>
              <button
                onClick={() => setMessageType('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  messageType === 'email'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <EnvelopeIcon className="h-4 w-4" />
                Email
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Messages Area */}
            <div className="p-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No messages yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Start a conversation with {contact.firstName || contact.name}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.direction === 'sent'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.direction === 'sent' && message.status && (
                            <span className="text-xs opacity-70 capitalize">
                              {message.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send ${messageType === 'sms' ? 'SMS' : 'email'} to ${contact.firstName || contact.name}...`}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Profile Section Card Component
function ProfileSectionCard({
  section,
  contact,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving
}: {
  section: ProfileSection;
  contact: ContactData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<ContactData>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ContactData>>({});

  useEffect(() => {
    if (isEditing) {
      setFormData(contact);
    }
  }, [isEditing, contact]);

  const handleSave = () => {
    onSave(formData);
  };

  const IconComponent = section.icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${section.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <IconComponent className={`h-5 w-5 ${section.completed ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
              {section.required && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                  Required
                </span>
              )}
              {section.completed && (
                <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.description}</p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            <PencilIcon className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {section.id === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {section.id === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Name:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {contact.firstName} {contact.lastName} {!contact.firstName && !contact.lastName && 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {contact.email || 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {contact.phone || 'Not set'}
                </span>
              </div>
            </div>
          )}

          {section.id === 'communication' && (
            <div className="text-sm space-y-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Preferred Contact:</span>
                <span className="ml-2 text-slate-900 dark:text-white capitalize">
                  {contact.preferredContact || 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Best Time:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {contact.bestTimeToContact || 'Not set'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
