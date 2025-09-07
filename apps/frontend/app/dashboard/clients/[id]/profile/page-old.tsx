'use client';

import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  DocumentTextIcon
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
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  taxId?: string;
  businessLicense?: string;
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    expirationDate?: string;
    coverage?: string;
  };
  certifications?: Array<{
    name: string;
    number?: string;
    issuer?: string;
    expirationDate?: string;
  }>;
  
  // Contact preferences
  preferredContact?: 'email' | 'phone' | 'text' | 'app';
  bestTimeToContact?: string;
  communicationNotes?: string;
  
  // Financial
  creditLimit?: number;
  paymentTerms?: string;
  paymentMethod?: string;
  
  // Residential specific
  homeOwner?: boolean;
  propertyType?: 'single-family' | 'condo' | 'townhouse' | 'apartment' | 'mobile-home';
  occupancy?: 'owner-occupied' | 'rental' | 'vacation';
  
  // Vendor/Sub specific
  specialty?: string[];
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

    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  // Load mock messages
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'sms',
        direction: 'sent',
        content: 'Hi! Thanks for reaching out. When would be a good time to discuss your project?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'delivered'
      },
      {
        id: '2',
        type: 'sms',
        direction: 'received',
        content: 'Tomorrow afternoon works great. Around 2 PM?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
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
        description: 'Company details and website',
        icon: BuildingOfficeIcon,
        required: true,
        completed: !!(contact?.company && contact?.website),
        fields: ['company', 'website', 'taxId', 'businessLicense'],
        contactTypes: ['vendor', 'subcontractor', 'contributor']
      },
      {
        id: 'addresses',
        title: 'Business Addresses',
        description: 'Business, shipping, and billing addresses',
        icon: MapPinIcon,
        required: true,
        completed: !!(contact?.businessAddress?.street && contact?.businessAddress?.city),
        fields: ['businessAddress', 'shippingAddress', 'billingAddress'],
        contactTypes: ['client', 'vendor', 'subcontractor']
      },
      {
        id: 'financial',
        title: 'Financial & Payment',
        description: 'Payment terms and credit information',
        icon: CreditCardIcon,
        required: false,
        completed: !!(contact?.paymentTerms && contact?.paymentMethod),
        fields: ['creditLimit', 'paymentTerms', 'paymentMethod'],
        contactTypes: ['client', 'vendor']
      },
      {
        id: 'insurance',
        title: 'Insurance & Licensing',
        description: 'Insurance policies and professional licenses',
        icon: ShieldCheckIcon,
        required: true,
        completed: !!(contact?.insuranceInfo?.provider && contact?.businessLicense),
        fields: ['insuranceInfo', 'certifications', 'businessLicense'],
        contactTypes: ['subcontractor', 'vendor']
      }
    ];

    const residentialSections: ProfileSection[] = [
      {
        id: 'property',
        title: 'Property Information',
        description: 'Home details and property type',
        icon: BuildingOfficeIcon,
        required: false,
        completed: !!(contact?.propertyType && contact?.occupancy),
        fields: ['homeOwner', 'propertyType', 'occupancy'],
        contactTypes: ['client']
      },
      {
        id: 'address',
        title: 'Address Information',
        description: 'Property address details',
        icon: MapPinIcon,
        required: true,
        completed: !!(contact?.businessAddress?.street),
        fields: ['businessAddress'],
        contactTypes: ['client']
      }
    ];

    const specialtySections: ProfileSection[] = [
      {
        id: 'services',
        title: 'Services & Specialties',
        description: 'Skills, services, and service areas',
        icon: WrenchScrewdriverIcon,
        required: true,
        completed: !!(contact?.specialty?.length && contact?.serviceArea),
        fields: ['specialty', 'serviceArea', 'hourlyRate', 'equipment'],
        contactTypes: ['subcontractor', 'contributor']
      },
      {
        id: 'availability',
        title: 'Availability & Scheduling',
        description: 'Work schedule and availability',
        icon: CalendarIcon,
        required: false,
        completed: !!(contact?.availability),
        fields: ['availability', 'bestTimeToContact'],
        contactTypes: ['subcontractor', 'contributor']
      }
    ];

    const teamSections: ProfileSection[] = [
      {
        id: 'employment',
        title: 'Employment Details',
        description: 'Role, department, and employment info',
        icon: UserGroupIcon,
        required: true,
        completed: !!(contact?.role && contact?.department && contact?.startDate),
        fields: ['role', 'department', 'startDate', 'employeeId'],
        contactTypes: ['team']
      }
    ];

    // Filter sections based on contact type
    const sections = [...baseSections];
    
    if (contactType === 'client') {
      if (contact?.accountType === 'residential') {
        sections.push(...residentialSections);
      } else {
        sections.push(...businessSections.filter(s => s.contactTypes.includes('client')));
      }
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
  const contactType = contact.contactType || 'client';
  const sections = getProfileSections(contactType);
  const completedSections = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const requiredSections = sections.filter(s => s.required);
  const completedRequired = requiredSections.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Modern Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/clients/${contactId}`}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="font-medium">Back to Overview</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Online</span>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Contact Info & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Cover Photo */}
              <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-12 mb-4">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                      {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                    <button className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
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
                  </div>

                  <div className="space-y-2 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Profile Strength</h3>
                <span className="text-2xl font-bold text-orange-600">{completionPercentage}%</span>
              </div>
              
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Completed</span>
                  <span className="font-medium text-slate-900 dark:text-white">{completedSections}/{totalSections}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Required</span>
                  <span className="font-medium text-slate-900 dark:text-white">{completedRequired}/{requiredSections.length}</span>
                </div>
              </div>

              {completionPercentage < 80 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    🎯 Complete profile to unlock advanced insights
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$0</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Tasks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed - Center Column */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Activity Feed</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Profile Created Activity */}
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white">
                        <span className="font-medium">{displayName}</span> profile was created
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>

                {isNewContact && (
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white">
                          Contact added to CRM system
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Ready for engagement and project management
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm">Start engaging with {contact?.firstName || 'this contact'} to see updates here</p>
                </div>
              </div>
            </div>

            {/* Profile Sections */}
            <div className="space-y-4">
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
          </div>

          {/* Right Sidebar - Chat & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Communication */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-orange-600">
                <h3 className="font-bold text-white">Quick Chat</h3>
                <p className="text-orange-100 text-sm">Send instant messages</p>
              </div>

              {/* Communication Type Toggle */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setMessageType('sms')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      messageType === 'sms'
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <PhoneIcon className="h-4 w-4" />
                    SMS
                  </button>
                  <button
                    onClick={() => setMessageType('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      messageType === 'email'
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    Email
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No messages yet</p>
                    <p className="text-xs text-slate-400">Start a conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.direction === 'sent'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.direction === 'sent' ? 'text-orange-100' : 'text-slate-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Send ${messageType === 'sms' ? 'SMS' : 'email'}...`}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Quick Tasks</h3>
              </div>
              <div className="p-4 space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                  <span className="text-slate-900 dark:text-white font-medium">Schedule Meeting</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-900 dark:text-white font-medium">Create Estimate</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span className="text-slate-900 dark:text-white font-medium">Add Task</span>
                </button>
              </div>
            </div>

            {/* Recent Files */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Files</h3>
              </div>
              <div className="p-4">
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files yet</p>
                  <p className="text-xs">Upload documents to get started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

          {/* Contact Header */}
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
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            {isNewContact && completionPercentage < 70 && (
              <div className="mt-3 p-3 bg-orange-500 rounded-xl border border-orange-600">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Complete your contact profile to unlock advanced CRM features!
                    </p>
                    <p className="text-xs text-white mt-1">
                      More data = better insights, automated messages, and personalized workflows.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                  ? 'bg-orange-600 text-white shadow-lg'
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
                  ? 'bg-orange-600 text-white shadow-lg'
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
                    ? 'bg-orange-500 text-white'
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
                    ? 'bg-orange-500 text-white'
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
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No messages yet</p>
                  <p className="text-sm text-slate-400">Start a conversation with {contact?.firstName || 'this contact'}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.direction === 'sent'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.direction === 'sent' ? 'text-orange-100' : 'text-slate-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()} • {message.type.toUpperCase()}
                        {message.status && ` • ${message.status}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send ${messageType === 'sms' ? 'SMS' : 'email'} to ${contact?.firstName || 'contact'}...`}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2"
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

      {/* Profile Sections */}
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
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isEditing) {
      // Initialize form data based on section
      const initialData: Record<string, any> = {};
      section.fields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (!initialData[parent]) initialData[parent] = {};
          initialData[parent][child] = (contact as Record<string, any>)?.[parent]?.[child] || '';
        } else {
          initialData[field] = (contact as Record<string, any>)?.[field] || '';
        }
      });
      setFormData(initialData);
    }
  }, [isEditing, section.fields, contact]);

  const handleSave = () => {
    onSave(formData);
  };

  const renderField = (field: string) => {
    if (field === 'businessAddress' || field === 'shippingAddress' || field === 'billingAddress') {
      return (
        <div className="space-y-3">
          <h5 className="font-medium text-slate-900 dark:text-white capitalize">
            {field.replace('Address', ' Address')}
          </h5>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Street Address"
              value={formData[field]?.street || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], street: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={formData[field]?.city || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field]: { ...prev[field], city: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="State"
                value={formData[field]?.state || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field]: { ...prev[field], state: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData[field]?.zip || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field]: { ...prev[field], zip: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Country"
                value={formData[field]?.country || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field]: { ...prev[field], country: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    // Handle other field types
    const getFieldLabel = (field: string) => {
      const labels: Record<string, string> = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        company: 'Company Name',
        website: 'Website URL',
        taxId: 'Tax ID',
        businessLicense: 'Business License #',
        preferredContact: 'Preferred Contact Method',
        bestTimeToContact: 'Best Time to Contact',
        communicationNotes: 'Communication Notes',
        creditLimit: 'Credit Limit',
        paymentTerms: 'Payment Terms',
        paymentMethod: 'Payment Method',
        propertyType: 'Property Type',
        occupancy: 'Occupancy Type',
        specialty: 'Specialties (comma separated)',
        serviceArea: 'Service Area',
        hourlyRate: 'Hourly Rate',
        availability: 'Availability',
        equipment: 'Equipment',
        role: 'Role/Position',
        department: 'Department',
        startDate: 'Start Date',
        employeeId: 'Employee ID',
      };
      return labels[field] || field;
    };

    const getFieldType = (field: string) => {
      if (field.includes('email')) return 'email';
      if (field.includes('phone')) return 'tel';
      if (field.includes('website')) return 'url';
      if (field.includes('Date')) return 'date';
      if (field.includes('Rate') || field.includes('Limit')) return 'number';
      return 'text';
    };

    if (field === 'preferredContact') {
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {getFieldLabel(field)}
          </label>
          <select
            value={formData[field] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Select preference</option>
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="text">Text Message</option>
            <option value="app">App Notification</option>
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {getFieldLabel(field)}
        </label>
        <input
          type={getFieldType(field)}
          value={formData[field] || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          placeholder={`Enter ${getFieldLabel(field).toLowerCase()}`}
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${section.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {section.completed ? (
                <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
              ) : (
                <section.icon className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {section.title}
                {section.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
                )}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{section.description}</p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={onEdit}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <PencilIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field}>
                {renderField(field)}
              </div>
            ))}
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {section.completed ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                ✅ This section is complete. Click edit to update information.
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                📝 Click edit to add {section.title.toLowerCase()} information.
              </div>
            )}
            
            {/* Show current data if any */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.fields.map(field => {
                const value = (contact as Record<string, any>)?.[field];
                if (!value) return null;
                
                return (
                  <div key={field} className="text-sm">
                    <span className="text-slate-500 dark:text-slate-400 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span className="ml-2 text-slate-900 dark:text-white">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
