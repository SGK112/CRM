'use client';

import {
  UserIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  MapPinIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  MapIcon,
  VideoCameraIcon,
  LinkIcon,
  EllipsisVerticalIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { useState } from 'react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  contactType: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'lead' | 'partner';
  status: 'active' | 'inactive' | 'pending' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  rating?: number; // 1-5 stars
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  lastContact?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  type: 'text' | 'notification' | 'scheduling' | 'location';
  metadata?: {
    notificationSent?: boolean;
    schedulingData?: any;
    location?: { lat: number; lng: number; address: string };
  };
}

interface ProfileSectionData {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  color: string;
  icon: React.ReactNode;
  fields?: Array<{
    key: string;
    label: string;
    type: string;
    placeholder: string;
  }>;
}

export default function ContactProfilePage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact>({
    id: params.id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'ABC Corporation',
    jobTitle: 'Operations Manager',
    contactType: 'client',
    status: 'active',
    priority: 'high',
    rating: 4,
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    website: 'https://abccorp.com',
    notes: 'Reliable client, prefers email communication. Budget range $50k-$100k.',
    tags: ['VIP', 'Priority', 'Contractor'],
    createdAt: '2024-01-15',
    lastContact: '2024-09-01'
  });

  // Chat state management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displayName = `${contact.firstName} ${contact.lastName}`;

  // Enhanced chat services
  const sendNotification = async (type: 'email' | 'sms', content: string) => {
    try {
      if (type === 'email' && contact.email) {
        // SendGrid integration
        const response = await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            subject: `Message from CRM - ${displayName}`,
            content: content,
            contactId: contact.id
          })
        });
        return response.ok;
      } else if (type === 'sms' && contact.phone) {
        // Twilio integration
        const response = await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.phone,
            message: content,
            contactId: contact.id
          })
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  };

  const scheduleAppointment = async (dateTime: string, duration: number = 60) => {
    try {
      const response = await fetch('/api/scheduling/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          dateTime,
          duration,
          title: `Meeting with ${displayName}`,
          type: 'consultation'
        })
      });
      return response.json();
    } catch (error) {
      console.error('Scheduling error:', error);
      return null;
    }
  };

  const getLocationInfo = async (address: string) => {
    try {
      const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
      return response.json();
    } catch (error) {
      console.error('Maps error:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Auto-detect and handle special commands
    await handleMessageCommands(currentMessage);

    // Simulate response (in real app, this would be AI or live chat)
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thank you for your message! I'll get back to you soon.`,
        sender: 'contact',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleMessageCommands = async (message: string) => {
    const lowerMessage = message.toLowerCase();

    // Email notification command
    if (lowerMessage.includes('/notify email')) {
      const content = message.replace(/\/notify email\s*/i, '');
      const success = await sendNotification('email', content);
      addSystemMessage(success ? 'Email notification sent!' : 'Failed to send email notification');
    }

    // SMS notification command
    else if (lowerMessage.includes('/notify sms')) {
      const content = message.replace(/\/notify sms\s*/i, '');
      const success = await sendNotification('sms', content);
      addSystemMessage(success ? 'SMS notification sent!' : 'Failed to send SMS notification');
    }

    // Schedule appointment command
    else if (lowerMessage.includes('/schedule')) {
      const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const appointment = await scheduleAppointment(dateMatch[1]);
        addSystemMessage(appointment ? 'Appointment scheduled!' : 'Failed to schedule appointment');
      } else {
        addSystemMessage('Please specify date in format: /schedule YYYY-MM-DD');
      }
    }

    // Location command
    else if (lowerMessage.includes('/location')) {
      const address = contact.address ? `${contact.address}, ${contact.city}, ${contact.state}` : '';
      if (address) {
        const locationData = await getLocationInfo(address);
        addSystemMessage(locationData ? `Location found: ${address}` : 'Location not found');
      } else {
        addSystemMessage('No address available for this contact');
      }
    }
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'notification'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendQuickAction = async (action: string) => {
    setShowQuickActions(false);
    
    switch (action) {
      case 'schedule':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await handleMessageCommands(`/schedule ${dateStr}`);
        break;
      
      case 'location':
        await handleMessageCommands('/location');
        break;
        
      case 'email':
        await handleMessageCommands('/notify email Follow up on our recent conversation');
        break;
        
      case 'sms':
        await handleMessageCommands('/notify sms Quick check-in message');
        break;
    }
  };

  // Helper functions for contact type display
  const getContactTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'client':
        return <UserIcon className="h-4 w-4" />;
      case 'subcontractor':
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'vendor':
        return <TruckIcon className="h-4 w-4" />;
      case 'contributor':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'lead':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'partner':
        return <HeartIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'client':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'subcontractor':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'vendor':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'contributor':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'lead':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'partner':
        return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Professional profile sections
  const profileSections: ProfileSectionData[] = [
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Primary contact details and communication preferences',
      completed: !!(contact.firstName && contact.lastName && contact.email),
      color: 'bg-blue-100 dark:bg-blue-900/30',
      icon: <UserIcon className="h-5 w-5 text-blue-600" />,
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name' },
        { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter email address' },
        { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' }
      ]
    },
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Company details and role information',
      completed: !!(contact.company && contact.jobTitle),
      color: 'bg-green-100 dark:bg-green-900/30',
      icon: <BuildingOfficeIcon className="h-5 w-5 text-green-600" />,
      fields: [
        { key: 'company', label: 'Company', type: 'text', placeholder: 'Enter company name' },
        { key: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Enter job title' },
        { key: 'website', label: 'Website', type: 'url', placeholder: 'Enter website URL' }
      ]
    },
    {
      id: 'address-info',
      title: 'Address Information',
      description: 'Location and address details',
      completed: !!(contact.address && contact.city && contact.state),
      color: 'bg-purple-100 dark:bg-purple-900/30',
      icon: <MapPinIcon className="h-5 w-5 text-purple-600" />,
      fields: [
        { key: 'address', label: 'Address', type: 'text', placeholder: 'Enter street address' },
        { key: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
        { key: 'state', label: 'State', type: 'text', placeholder: 'Enter state' },
        { key: 'zipCode', label: 'ZIP Code', type: 'text', placeholder: 'Enter ZIP code' }
      ]
    }
  ];

  const handleSave = (sectionId: string, updates: Partial<Contact>) => {
    setSaving(true);
    setTimeout(() => {
      setContact(prev => ({ ...prev, ...updates }));
      setEditingSection(null);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile-First Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="px-4 sm:px-6 pt-6 pb-4">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl p-1 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold">
                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getContactTypeColor(contact.contactType)}`}>
                  {getContactTypeIcon(contact.contactType)}
                  {contact.contactType.charAt(0).toUpperCase() + contact.contactType.slice(1)}
                </span>
                {contact.status && (
                  <span className="text-xs text-white/80 capitalize bg-white/10 px-2 py-1 rounded-full">
                    {contact.status}
                  </span>
                )}
                {contact.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contact.priority === 'urgent' ? 'bg-red-500/20 text-red-200' :
                    contact.priority === 'high' ? 'bg-orange-500/20 text-orange-200' :
                    contact.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                    'bg-green-500/20 text-green-200'
                  }`}>
                    {contact.priority} priority
                  </span>
                )}
              </div>
              
              {/* Contact Details */}
              <div className="space-y-1 text-sm text-white/90">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-3 w-3 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">
                {contact.rating ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>{contact.rating}</span>
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  </div>
                ) : (
                  <span className="text-white/60">N/A</span>
                )}
              </div>
              <div className="text-xs text-white/80">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">{contact.tags?.length || 0}</div>
              <div className="text-xs text-white/80">Tags</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">
                {contact.createdAt ? new Date(contact.createdAt).getFullYear() : 'N/A'}
              </div>
              <div className="text-xs text-white/80">Since</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-lg sm:text-xl font-bold">
                {contact.lastContact ? (() => {
                  const days = Math.floor((new Date().getTime() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24));
                  return `${days}d`;
                })() : 'N/A'}
              </div>
              <div className="text-xs text-white/80">Last Contact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Integrated Chat */}
      <div className="p-4 sm:p-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
          
          {/* Contact Profile Section - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-orange-200 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Contact Profile</h2>
                  <p className="text-orange-100 text-sm">Manage contact information and details</p>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-lg flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            {/* Profile Sections Grid */}
            <div className="p-4 sm:p-6">
              <div className="grid gap-6">
                {profileSections.map((section) => (
                  <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{section.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{section.description}</p>
                      </div>
                      {section.completed && (
                        <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    {editingSection === section.id ? (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 h-full">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {section.fields?.map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {field.label}
                              </label>
                              <input
                                type={field.type || 'text'}
                                value={(() => {
                                  const value = contact[field.key as keyof Contact];
                                  if (typeof value === 'string' || typeof value === 'number') {
                                    return value;
                                  }
                                  return '';
                                })()}
                                onChange={(e) => setContact(prev => ({ 
                                  ...prev, 
                                  [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                                }))}
                                placeholder={field.placeholder}
                                className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => handleSave(section.id, contact)}
                            disabled={saving}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 h-full flex items-center">
                        {section.completed ? (
                          <div className="flex items-center gap-3">
                            <CheckCircleIconSolid className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-900 dark:text-green-100">
                                Section completed
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                All required information has been provided
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-900 dark:text-amber-100">
                                Incomplete section
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                Some information is missing or needs to be updated
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setEditingSection(section.id)}
                          className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes Section */}
              {contact.notes && (
                <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Notes</h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{contact.notes}</p>
                </div>
              )}

              {/* Tags Section */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <TagIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Integrated Chat UI - Takes 1/3 width on large screens */}
          <div className="lg:col-span-1 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col min-h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Chat with {contact.firstName}</h3>
                    <p className="text-xs text-blue-100">AI Assistant • Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Actions Panel */}
              {showQuickActions && (
                <div className="mt-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendQuickAction('schedule')}
                      className="flex items-center gap-2 p-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      Schedule
                    </button>
                    <button
                      onClick={() => sendQuickAction('location')}
                      className="flex items-center gap-2 p-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <MapIcon className="h-3 w-3" />
                      Location
                    </button>
                    <button
                      onClick={() => sendQuickAction('email')}
                      className="flex items-center gap-2 p-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <EnvelopeIcon className="h-3 w-3" />
                      Email
                    </button>
                    <button
                      onClick={() => sendQuickAction('sms')}
                      className="flex items-center gap-2 p-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <PhoneIcon className="h-3 w-3" />
                      SMS
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-800">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm mb-2">No messages yet</p>
                  <p className="text-xs mb-4">Start a conversation or try commands:</p>
                  <div className="text-xs space-y-1 text-left bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p><code>/notify email [message]</code> - Send email</p>
                    <p><code>/notify sms [message]</code> - Send SMS</p>
                    <p><code>/schedule YYYY-MM-DD</code> - Schedule meeting</p>
                    <p><code>/location</code> - Get location info</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'notification'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Chat Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {/* Attachment Options */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => sendQuickAction('schedule')}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Schedule Appointment"
                >
                  <CalendarIcon className="h-3 w-3" />
                  Schedule
                </button>
                <button
                  onClick={() => sendQuickAction('location')}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  title="Share Location"
                >
                  <MapIcon className="h-3 w-3" />
                  Location
                </button>
                <button
                  onClick={() => {
                    if (contact.phone) {
                      window.open(`tel:${contact.phone}`);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  title="Start Video Call"
                >
                  <VideoCameraIcon className="h-3 w-3" />
                  Call
                </button>
              </div>
              
              {/* Message Input */}
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <PaperClipIcon className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message or command..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Notification Status */}
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <BellIcon className="h-3 w-3" />
                  <span>Notifications: {contact.email && contact.phone ? 'Email & SMS' : contact.email ? 'Email' : contact.phone ? 'SMS' : 'None'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
