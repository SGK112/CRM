'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserIconSolid,
  PhoneIcon as PhoneIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  SpeakerWaveIcon as SpeakerIconSolid,
} from '@heroicons/react/24/solid';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'lead' | 'prospect' | 'active' | 'completed' | 'inactive';
  projectType?: string;
  budget?: number;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  budget: number;
  startDate: string;
  endDate?: string;
  progress: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  title: string;
  date: string;
  time: string;
  type: 'consultation' | 'site-visit' | 'meeting' | 'call';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface Communication {
  _id: string;
  type: 'email' | 'sms' | 'call' | 'meeting';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client details
      const clientResponse = await fetch(`http://localhost:3001/clients/${clientId}`);
      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        setClient(clientData);
      } else {
        setError('Client not found');
      }

      // Fetch projects for this client
      const projectsResponse = await fetch(`http://localhost:3001/projects/client/${clientId}`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }

      // Mock data for demo (replace with actual API calls)
      setInvoices([
        {
          _id: '1',
          invoiceNumber: 'INV-2025-001',
          amount: 5500,
          status: 'paid',
          dueDate: '2025-01-15',
          createdAt: '2025-01-01',
        },
        {
          _id: '2',
          invoiceNumber: 'INV-2025-002',
          amount: 3200,
          status: 'sent',
          dueDate: '2025-02-15',
          createdAt: '2025-02-01',
        },
      ]);

      setAppointments([
        {
          _id: '1',
          title: 'Initial Consultation',
          date: '2025-08-25',
          time: '10:00 AM',
          type: 'consultation',
          status: 'scheduled',
          notes: 'Discuss kitchen renovation project',
        },
        {
          _id: '2',
          title: 'Site Visit',
          date: '2025-08-30',
          time: '2:00 PM',
          type: 'site-visit',
          status: 'scheduled',
          notes: 'Measure space and assess current conditions',
        },
      ]);

      setCommunications([
        {
          _id: '1',
          type: 'email',
          subject: 'Welcome to Remodely!',
          content: 'Thank you for choosing Remodely for your renovation project...',
          direction: 'outbound',
          timestamp: '2025-08-18T10:30:00Z',
          status: 'sent',
        },
        {
          _id: '2',
          type: 'call',
          content: 'Initial project discussion - 15 minutes',
          direction: 'inbound',
          timestamp: '2025-08-17T14:15:00Z',
        },
      ]);
    } catch (err) {
      setError('Failed to load client data');
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCall = async () => {
    try {
      const response = await fetch('http://localhost:3001/voice-agent/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: client?.phone,
          clientId: clientId,
          purpose: 'follow-up',
        }),
      });

      if (response.ok) {
        alert('Voice call initiated successfully!');
      } else {
        alert('Failed to initiate voice call');
      }
    } catch (error) {
      console.error('Error initiating voice call:', error);
      alert('Error initiating voice call');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800',
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'on-hold': 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon, activeIcon: UserIconSolid },
    {
      id: 'projects',
      name: 'Projects',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardIconSolid,
    },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon, activeIcon: CreditCardIconSolid },
    { id: 'scheduling', name: 'Scheduling', icon: CalendarIcon, activeIcon: CalendarIconSolid },
    {
      id: 'communications',
      name: 'Communications',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatIconSolid,
    },
    { id: 'voice-agent', name: 'AI Voice', icon: SpeakerWaveIcon, activeIcon: SpeakerIconSolid },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h2>
          <p className="text-gray-600">{error || 'The requested client could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.firstName} {client.lastName}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                  >
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Client since {formatDate(client.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Client
              </button>
              <button
                onClick={handleVoiceCall}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <SpeakerWaveIcon className="w-4 h-4 mr-2" />
                AI Voice Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                {client.email}
              </a>
            </div>
            {client.phone && (
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                  {client.phone}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>
                  {client.address}, {client.city}, {client.state} {client.zipCode}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = isActive ? tab.activeIcon : tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Client Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Project Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {client.projectType || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {client.budget ? formatCurrency(client.budget) : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Source</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {client.source || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(client.updatedAt)}</dd>
                  </div>
                </dl>
                {client.notes && (
                  <div className="mt-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.notes}</dd>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Projects</span>
                    <span className="text-sm font-medium text-gray-900">
                      {projects.filter(p => p.status === 'in-progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Invoiced</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Upcoming Appointments</span>
                    <span className="text-sm font-medium text-gray-900">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Contact</span>
                    <span className="text-sm font-medium text-gray-900">
                      {communications.length > 0
                        ? formatDate(communications[0].timestamp)
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {communications.slice(0, 3).map(comm => (
                    <div key={comm._id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {comm.type === 'email' ? comm.subject : comm.content}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(comm.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Projects & Estimates</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Project
              </button>
            </div>

            <div className="grid gap-6">
              {projects.map(project => (
                <div key={project._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Budget: {formatCurrency(project.budget)}
                        </span>
                        <span className="text-sm text-gray-500">Progress: {project.progress}%</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new project.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Invoice
              </button>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map(invoice => (
                      <tr key={invoice._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                          >
                            {invoice.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                            <button className="text-blue-600 hover:text-blue-900">Send</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Appointments & Schedule</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Schedule Appointment
              </button>
            </div>

            <div className="grid gap-4">
              {appointments.map(appointment => (
                <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{appointment.title}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          {formatDate(appointment.date)} at {appointment.time}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {appointment.type.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Schedule your first appointment with this client.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Communications History</h2>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Send Email
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Send SMS
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Communication Timeline</h3>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {communications.map((comm, index) => (
                      <li key={comm._id}>
                        <div className="relative pb-8">
                          {index !== communications.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  comm.type === 'email'
                                    ? 'bg-blue-500'
                                    : comm.type === 'sms'
                                      ? 'bg-green-500'
                                      : comm.type === 'call'
                                        ? 'bg-purple-500'
                                        : 'bg-gray-500'
                                }`}
                              >
                                {comm.type === 'email' ? (
                                  <EnvelopeIcon className="h-5 w-5 text-white" />
                                ) : comm.type === 'sms' ? (
                                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                                ) : (
                                  <PhoneIcon className="h-5 w-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {comm.direction === 'outbound' ? 'Sent' : 'Received'} {comm.type}
                                  <span className="ml-2 text-gray-400">
                                    {formatDate(comm.timestamp)}
                                  </span>
                                </p>
                              </div>
                              <div className="mt-2">
                                {comm.subject && (
                                  <p className="text-sm font-medium text-gray-900">
                                    {comm.subject}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600">{comm.content}</p>
                                {comm.status && (
                                  <span
                                    className={`mt-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(comm.status)}`}
                                  >
                                    {comm.status.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice-agent' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Voice Agent</h2>
              <button
                onClick={handleVoiceCall}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <SpeakerWaveIcon className="w-4 h-4 mr-2" />
                Initiate Call
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Voice Agent Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Call Purpose</label>
                    <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                      <option>Follow-up call</option>
                      <option>Project update</option>
                      <option>Appointment reminder</option>
                      <option>Payment reminder</option>
                      <option>Custom message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Voice Tone</label>
                    <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Casual</option>
                      <option>Formal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Message
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter a custom message for the AI to communicate..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Call History</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Follow-up Call</p>
                        <p className="text-sm text-gray-600">Duration: 3:45</p>
                        <p className="text-xs text-gray-500">August 17, 2025 at 2:15 PM</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        COMPLETED
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Client confirmed interest in kitchen renovation. Scheduling site visit for
                      next week.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appointment Reminder</p>
                        <p className="text-sm text-gray-600">Duration: 1:20</p>
                        <p className="text-xs text-gray-500">August 15, 2025 at 10:30 AM</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        NO ANSWER
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Left voicemail reminder about upcoming consultation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
