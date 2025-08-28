'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StandardPageWrapper, StandardCard, StandardSection } from '../../../../components/ui/StandardPageWrapper';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  source?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  title: string;
  status: string;
  budget?: number;
  startDate?: string;
}

interface Invoice {
  _id: string;
  number: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface Appointment {
  _id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  type: string;
  notes?: string;
}

interface Communication {
  _id: string;
  type: string;
  subject: string;
  timestamp: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch client details
      const clientResponse = await fetch(`/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!clientResponse.ok) {
        throw new Error('Failed to fetch client');
      }

      const clientData = await clientResponse.json();
      setClient(clientData);

      // Fetch related data in parallel
      const [projectsRes, invoicesRes, appointmentsRes] = await Promise.allSettled([
        fetch(`/api/projects/client/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/invoices?clientId=${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/appointments?clientId=${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        const projectsData = await projectsRes.value.json();
        setProjects(projectsData);
      }

      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.ok) {
        const invoicesData = await invoicesRes.value.json();
        setInvoices(invoicesData);
      }

      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.ok) {
        const appointmentsData = await appointmentsRes.value.json();
        setAppointments(appointmentsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const deleteClient = async () => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        router.push('/dashboard/clients');
      } else {
        throw new Error('Failed to delete client');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  if (loading) {
    return (
      <StandardPageWrapper>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-red-500"></div>
        </div>
      </StandardPageWrapper>
    );
  }

  if (error || !client) {
    return (
      <StandardPageWrapper>
        <div className="py-32 text-center">
          <h2 className="text-2xl font-bold mb-2">{error || 'Client Not Found'}</h2>
          <p className="text-gray-700 dark:text-gray-300">The requested client could not be located.</p>
          <div className="mt-6">
            <Link href="/dashboard/clients" className="text-red-600 hover:underline font-medium">
              Back to Clients
            </Link>
          </div>
        </div>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/clients" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                  client.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                }`}>
                  {client.status}
                </span>
                {client.source && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Source: {client.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/clients/${client._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Client
            </Link>
            <button
              onClick={deleteClient}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <StandardCard>
              <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                    <div className="font-medium">{client.email}</div>
                  </div>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
                      <div className="font-medium">{client.phone}</div>
                    </div>
                  </div>
                )}
                {client.address && (client.address.city || client.address.street) && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Address</div>
                      <div className="font-medium">
                        {[client.address.street, client.address.city, client.address.state, client.address.zipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {client.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</div>
                  <p className="text-sm whitespace-pre-line">{client.notes}</p>
                </div>
              )}
            </StandardCard>

            {/* Projects */}
            <StandardCard>
              <h3 className="text-lg font-semibold mb-6">Projects</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{project.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{project.status}</span>
                          {project.budget && <span>{formatCurrency(project.budget)}</span>}
                          {project.startDate && <span>{formatDate(project.startDate)}</span>}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </StandardCard>

            {/* Invoices */}
            <StandardCard>
              <h3 className="text-lg font-semibold mb-6">Invoices</h3>
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Invoice #{invoice.number}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{invoice.status}</span>
                          <span>{formatCurrency(invoice.amount)}</span>
                          <span>Due: {formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/invoices/${invoice._id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </StandardCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <StandardCard>
              <h3 className="text-lg font-semibold mb-6">Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Projects</span>
                  <span className="font-medium">{projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoices</span>
                  <span className="font-medium">{invoices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Appointments</span>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Client Since</span>
                  <span className="font-medium">{formatDate(client.createdAt)}</span>
                </div>
              </div>
            </StandardCard>

            {/* Recent Appointments */}
            <StandardCard>
              <h3 className="text-lg font-semibold mb-6">Recent Appointments</h3>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment._id} className="border-l-2 border-red-500 pl-3">
                      <h4 className="font-medium text-sm">{appointment.title}</h4>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(appointment.date)} at {appointment.time}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {appointment.status}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{appointment.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </StandardCard>
          </div>
        </div>
      </div>
    </StandardPageWrapper>
  );
}
