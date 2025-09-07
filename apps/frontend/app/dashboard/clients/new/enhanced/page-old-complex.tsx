'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ContactFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Contact Type & Business
  contactType: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  accountType?: string;
  company?: string;
  
  // Additional
  status: string;
  source?: string;
  notes?: string;
  
  // Quick capture fields
  quickCapture?: boolean;
  integrateQuickBooks?: boolean;
}

const contactTypeOptions = [
  { value: 'client', label: '👥 Client' },
  { value: 'subcontractor', label: '🔨 Subcontractor' },
  { value: 'vendor', label: '🚚 Vendor' },
  { value: 'contributor', label: '❤️ Contributor' },
  { value: 'team', label: '👨‍💼 Team Member' }
];

export default function EnhancedContactCreationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard/clients';
  const contactType = (searchParams.get('type') as string) || 'client';

  const [currentStep] = useState<'quick' | 'enhanced' | 'quickbooks'>('quick');
  const [contactId, setContactId] = useState<string | null>(null);
  const [, setQuickBooksEnabled] = useState(false);
  
  // Chat UI state
  const [chatMode, setChatMode] = useState<'sms' | 'email'>('sms');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    message: string;
    sender: 'user' | 'client';
    timestamp: Date;
    type: 'sms' | 'email';
  }>>([]);
  
  // QuickBooks sync status
  const [qbSyncStatus] = useState<'synced' | 'broken' | 'not-working'>('synced');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    defaultValues: {
      contactType: contactType as ContactFormData['contactType'],
      status: 'lead'
    }
  });



  // Check QuickBooks integration status
  useEffect(() => {
    const checkQuickBooksStatus = async () => {
      try {
        const response = await fetch('/api/quickbooks/status');
        if (response.ok) {
          const data = await response.json();
          setQuickBooksEnabled(data.enabled || false);
        }
      } catch (error) {
        // QuickBooks status check failed (expected in development)
      }
    };

    checkQuickBooksStatus();
  }, []);

  const onQuickSubmit = async (data: ContactFormData) => {
    try {
      const authToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...data,
          status: 'lead', // Default status
          type: data.contactType,
          contactRole: data.contactType
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const newContactId = created?._id || created?.id;
        setContactId(newContactId);
        
        // Go to profile completion
        router.push(`/dashboard/clients/${newContactId}/profile?created=true&type=${data.contactType}&quick=true`);
      } else {
        const errorData = await response.text();
        throw new Error(`Create failed (${response.status}): ${errorData}`);
      }
    } catch (error) {
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleQuickBooksSync = async () => {
    if (!contactId) return;

    try {
      const response = await fetch(`/api/clients/${contactId}/sync-quickbooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push(`/dashboard/clients/${contactId}/profile?created=true&synced=true`);
      } else {
        // Continue anyway, just show that sync failed
        router.push(`/dashboard/clients/${contactId}/profile?created=true&sync_failed=true`);
      }
    } catch (error) {
      router.push(`/dashboard/clients/${contactId}/profile?created=true&sync_failed=true`);
    }
  };

  // Chat functions
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      message: chatMessage,
      sender: 'user' as const,
      timestamp: new Date(),
      type: chatMode
    };

    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simulate API call for sending message
    try {
      const endpoint = chatMode === 'sms' ? '/api/communications/sms' : '/api/communications/email';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: chatMode === 'sms' ? watch('phone') : watch('email'),
          message: chatMessage,
          contactId: contactId
        })
      });

      if (response.ok) {
        // Message sent successfully - in a real app, you might get a delivery status
      }
    } catch (error) {
      // Handle error - in development, this is expected
    }
  };

  const toggleChat = () => {
    // Chat is now always visible - this function can be used for future enhancements
  };



  if (currentStep === 'quickbooks' && contactId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/10 p-3">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 pt-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              QuickBooks Integration
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sync this contact to QuickBooks for seamless financial management
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Customer Records</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Sync contact info and addresses</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Financial Tracking</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Track invoices and payments</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">Automated Sync</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Keep data in sync automatically</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleQuickBooksSync}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg"
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              Sync to QuickBooks
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/clients/${contactId}/profile?created=true&skipped_sync=true`)}
              className="w-full px-6 py-3 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Link
            href={returnTo}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border border-white/20 hover:bg-white/30 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-700 dark:text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">New Contact</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create contact profile</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>

        {/* Single Column Layout */}
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Contact Creation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fill out basic information</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Step 1 of 2
              </div>
            </div>
          </div>

            {/* Main Form - Simplified JotForm Style */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl p-8">
              <form onSubmit={handleSubmit(onQuickSubmit)} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Contact Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Please provide your contact details</p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      {...register('firstName', { 
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Minimum 2 characters' }
                      })}
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <input
                      {...register('lastName', { 
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Minimum 2 characters' }
                      })}
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {(errors.firstName || errors.lastName) && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName?.message || errors.lastName?.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    type="tel"
                    placeholder="Please enter a valid phone number."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Contact Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Contact Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('contactType', { required: 'Contact type is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select contact type...</option>
                    {contactTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.contactType && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactType.message}</p>
                  )}
                </div>

                {/* Company Name (Optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Company Name
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    placeholder="ABC Construction (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckIcon className="h-5 w-5" />
                      Create Contact
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Chat Application */}
          <div className="space-y-6">
            {/* Status Indicators */}
            <div className="bg-slate-600 dark:bg-slate-700 rounded-2xl shadow-lg p-4">
              <h3 className="font-semibold text-white mb-3">Integration Status</h3>
              <div className="space-y-2">
                {/* QuickBooks Sync Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">QuickBooks Sync</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      qbSyncStatus === 'synced' ? 'bg-green-400' : 
                      qbSyncStatus === 'broken' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`text-xs font-medium ${
                      qbSyncStatus === 'synced' ? 'text-green-300' : 
                      qbSyncStatus === 'broken' ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {qbSyncStatus === 'synced' ? 'Synced' : 
                       qbSyncStatus === 'broken' ? 'Warning' : 'Error'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Application */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-slate-600 dark:bg-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-500 dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Client Chat</h3>
                      <p className="text-xs text-slate-200">
                        {watch('firstName') && watch('lastName') 
                          ? `${watch('firstName')} ${watch('lastName')}` 
                          : 'New Contact'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Communication Mode Selector */}
                    <div className="flex bg-slate-500 dark:bg-slate-600 rounded-lg p-1">
                      <button
                        onClick={() => setChatMode('sms')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          chatMode === 'sms' 
                            ? 'bg-white text-slate-700 shadow-sm' 
                            : 'text-slate-200 hover:text-white hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        onClick={() => setChatMode('email')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          chatMode === 'email' 
                            ? 'bg-white text-slate-700 shadow-sm' 
                            : 'text-slate-200 hover:text-white hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                      >
                        📧 Email
                      </button>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="h-80 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">Start a conversation</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                      Send a {chatMode === 'sms' ? 'text message' : 'professional email'} to begin communicating with this contact
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs">
                          {msg.sender === 'user' ? (
                            <div className="bg-slate-600 dark:bg-slate-700 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-lg">
                              <div className="flex items-center gap-1 mb-1">
                                {msg.type === 'sms' ? (
                                  <DevicePhoneMobileIcon className="h-3 w-3 opacity-80" />
                                ) : (
                                  <EnvelopeIcon className="h-3 w-3 opacity-80" />
                                )}
                                <span className="text-xs opacity-80 uppercase font-medium">{msg.type}</span>
                              </div>
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <p className="text-xs opacity-80 mt-2">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-slate-200 dark:border-slate-600">
                              <div className="flex items-center gap-1 mb-1">
                                {msg.type === 'sms' ? (
                                  <DevicePhoneMobileIcon className="h-3 w-3 opacity-60" />
                                ) : (
                                  <EnvelopeIcon className="h-3 w-3 opacity-60" />
                                )}
                                <span className="text-xs opacity-60 uppercase font-medium">{msg.type}</span>
                              </div>
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <p className="text-xs opacity-60 mt-2">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 p-4">
                <div className="space-y-3">
                  {/* Contact Info Display */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">To:</span>
                      <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded-full">
                        {chatMode === 'sms' 
                          ? (watch('phone') || 'Enter phone number') 
                          : (watch('email') || 'Enter email address')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="font-medium">
                        {chatMode === 'sms' ? 'SMS Ready' : 'Email Ready'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={chatMode === 'sms' 
                          ? 'Type your message...' 
                          : 'Subject: Email subject\n\nYour email message here...'}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none min-h-[80px] max-h-[120px]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        onFocus={() => {
                          // Auto-focus functionality can be added here
                        }}
                        rows={chatMode === 'email' ? 4 : 2}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500">
                        {chatMode === 'sms' ? 'Enter to send' : 'Shift+Enter for new line'}
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Footer */}
              <div className="bg-slate-600 dark:bg-slate-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>Secure messaging enabled</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <span>{chatHistory.length} messages</span>
                    <span>•</span>
                    <span className="font-medium">CRM Chat v2.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
