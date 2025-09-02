'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PhoneInput from '../../../../components/forms/PhoneInput';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
  ChevronDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
// Use rewrite paths for API calls

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
  tags?: string[];
}

interface CreateProjectData {
  title: string;
  description: string;
  status: 'lead' | 'proposal' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  estimatedHours?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  tags: string[];
}

// Searchable Client Selector Component
interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string | undefined;
  onClientSelect: (clientId: string | undefined) => void;
  onClientCreated?: (client: Client) => void;
}

function ClientSelector({
  clients,
  selectedClientId,
  onClientSelect,
  onClientCreated,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    const filtered = clients.filter(client => {
      const search = searchTerm.toLowerCase();
      if (!search) return true;
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
      const company = client.company?.toLowerCase() || '';
      const email = client.email?.toLowerCase() || '';
      const phone = client.phone?.toLowerCase() || '';
      const addr = [
        client.address?.street,
        client.address?.city,
        client.address?.state,
        client.address?.zipCode,
        client.address?.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const tags = (client.tags || []).join(' ').toLowerCase();
      return (
        fullName.includes(search) ||
        company.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        addr.includes(search) ||
        tags.includes(search)
      );
    });
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedClient = clients.find(client => client._id === selectedClientId);

  const handleClientSelect = (client: Client | null) => {
    onClientSelect(client?._id);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Heuristic: seed create form from searchTerm
  useEffect(() => {
    if (!showCreateForm) return;
    const s = searchTerm.trim();
    if (!s) return;
    const looksLikeEmail = /@/.test(s);
    const looksLikePhone = /\d{3,}/.test(s.replace(/[^\d]/g, ''));
    if (looksLikeEmail) {
      setNewClient(prev => ({ ...prev, email: s }));
    } else if (looksLikePhone) {
      setNewClient(prev => ({ ...prev, phone: s.replace(/[^\d]/g, '') }));
    } else {
      const parts = s.split(/\s+/);
      setNewClient(prev => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateForm]);

  const handleCreate = async () => {
    setCreateError(null);
    // minimal validation
    if (!newClient.firstName || (!newClient.email && !newClient.phone)) {
      setCreateError('First name and either email or phone are required.');
      return;
    }
    try {
      setCreating(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        setCreateError('You are not logged in.');
        return;
      }
      const payload: any = {
        firstName: newClient.firstName,
        lastName: newClient.lastName || '-',
        email: newClient.email?.trim() || undefined,
        phone: newClient.phone?.toString() || undefined,
        company: newClient.company?.trim() || undefined,
        status: 'client',
      };
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to create client');
      }
      const created: Client = await res.json();
      onClientCreated && onClientCreated(created);
      handleClientSelect(created);
      setShowCreateForm(false);
      setNewClient({ firstName: '', lastName: '', email: '', phone: '', company: '' });
    } catch (e: any) {
      setCreateError(e.message || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-[var(--text)] mb-2">
        <UserIcon className="h-4 w-4 inline mr-1" /> Client
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 bg-[var(--surface-1)] text-left flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors"
        >
          <span className={selectedClient ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}>
            {selectedClient
              ? `${selectedClient.firstName} ${selectedClient.lastName}${selectedClient.company ? ` (${selectedClient.company})` : ''}`
              : 'Select a client (optional)'}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-[var(--text-faint)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-[var(--border)]">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-faint)]" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, company, or address..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-md focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm bg-[var(--input-bg)] text-[var(--text)] placeholder-[var(--text-faint)]"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {/* Add new client trigger inside list */}
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(v => !v);
                    setCreateError(null);
                  }}
                  className="w-full inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  {showCreateForm ? 'Close new client form' : 'Add new client'}
                </button>
                {showCreateForm && (
                  <div className="mt-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="col-span-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs"
                        placeholder="First name*"
                        value={newClient.firstName}
                        onChange={e => setNewClient({ ...newClient, firstName: e.target.value })}
                      />
                      <input
                        className="col-span-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs"
                        placeholder="Last name"
                        value={newClient.lastName}
                        onChange={e => setNewClient({ ...newClient, lastName: e.target.value })}
                      />
                      <input
                        className="col-span-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs"
                        placeholder="Email"
                        value={newClient.email}
                        onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                      />
                      <div className="col-span-1">
                        <PhoneInput
                          value={newClient.phone || ''}
                          onChange={value => setNewClient({ ...newClient, phone: value })}
                          placeholder="Phone"
                          className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs"
                        />
                      </div>
                      <input
                        className="col-span-2 px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs"
                        placeholder="Company (optional)"
                        value={newClient.company}
                        onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                      />
                    </div>
                    {createError && <div className="text-xs text-red-400">{createError}</div>}
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateError(null);
                        }}
                        className="px-2 py-1 text-xs rounded border border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface-3)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={creating}
                        onClick={handleCreate}
                        className="px-2 py-1 text-xs rounded bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-60"
                      >
                        {creating ? 'Creating…' : 'Create & select'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="px-3 py-2 hover:bg-[var(--surface-2)] cursor-pointer flex items-center justify-between"
                onClick={() => handleClientSelect(null)}
              >
                <span className="text-[var(--text-dim)]">No client selected</span>
                {!selectedClientId && <CheckIcon className="h-4 w-4 text-amber-600" />}
              </div>

              {filteredClients.length === 0 && searchTerm ? (
                <div className="px-3 py-2 text-[var(--text-dim)] text-sm">
                  <div>No clients found matching "{searchTerm}"</div>
                </div>
              ) : (
                filteredClients.map(client => (
                  <div
                    key={client._id}
                    className="px-3 py-2 hover:bg-[var(--surface-2)] cursor-pointer flex items-center justify-between"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div>
                      <div className="font-medium text-[var(--text)]">
                        {client.firstName} {client.lastName}
                      </div>
                      {(client.company || client.phone) && (
                        <div className="text-sm text-[var(--text-dim)]">
                          {client.company}
                          {client.company && client.phone ? ' • ' : ''}
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="text-xs text-[var(--text-faint)]">{client.email}</div>
                      )}
                    </div>
                    {selectedClientId === client._id && (
                      <CheckIcon className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewDashboardProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/dashboard/projects';
  const preselectedClientId = searchParams?.get('clientId') || '';

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    status: 'lead',
    priority: 'medium',
    tags: [],
    clientId: preselectedClientId,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  // Preselect client from query string if provided
  useEffect(() => {
    const client = searchParams?.get('client');
    if (client) {
      setFormData(prev => ({ ...prev, clientId: client }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const submitData = { ...formData } as any;
      // Remove fields that are not in the backend DTO
      delete submitData.tags;
      delete submitData.estimatedHours;

      if (!submitData.budget) delete submitData.budget;
      if (!submitData.startDate) delete submitData.startDate;
      if (!submitData.endDate) delete submitData.endDate;
      if (!submitData.clientId) delete submitData.clientId;
      if (submitData.address) {
        const hasAddressData = Object.values(
          submitData.address as Record<string, string | undefined>
        )
          .filter((v): v is string => typeof v === 'string')
          .some(v => v.trim() !== '');
        if (!hasAddressData) delete submitData.address;
      }

      const response = await fetch(`/api/projects`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const created = await response.json();
        // Check if we need to redirect back to estimate creation
        if (returnTo.includes('estimates/new')) {
          const url = new URL(returnTo, window.location.origin);
          url.searchParams.set('projectId', created._id);
          if (formData.clientId) {
            url.searchParams.set('clientId', formData.clientId);
          }
          router.push(url.pathname + url.search);
        } else {
          router.push('/dashboard/projects');
        }
      } else {
        const error = await response.json();
        console.error('Failed to create project:', error);
        alert('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          street: prev.address?.street || '',
          city: prev.address?.city || '',
          state: prev.address?.state || '',
          zipCode: prev.address?.zipCode || '',
          country: prev.address?.country || '',
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]:
          name === 'budget' || name === 'estimatedHours'
            ? value === ''
              ? undefined
              : Number(value)
            : value,
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Link
          href={returnTo}
          className="inline-flex items-center text-secondary hover:text-primary mr-4 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">Create New Project</h1>
          <p className="text-secondary mt-1">Fill in the details to create a new project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="surface-1 rounded-lg shadow-sm border border-token p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter project title"
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="input"
                placeholder="Describe the project goals, requirements, and deliverables"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value="lead">Lead</option>
                <option value="proposal">Proposal</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <ClientSelector
              clients={clients}
              selectedClientId={formData.clientId}
              onClientSelect={clientId => setFormData(prev => ({ ...prev, clientId }))}
              onClientCreated={client => {
                setClients(prev => [client, ...prev]);
                setFormData(prev => ({ ...prev, clientId: client._id }));
              }}
            />
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <CurrencyDollarIcon className="h-5 w-5 inline mr-2" /> Budget & Timeline
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                min="0"
                step="0.01"
                value={formData.budget || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label
                htmlFor="estimatedHours"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                min="0"
                value={formData.estimatedHours || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" /> End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ''}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <MapPinIcon className="h-5 w-5 inline mr-2" /> Project Location
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label
                htmlFor="address.street"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address?.street || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label
                htmlFor="address.city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address?.city || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="City"
              />
            </div>
            <div>
              <label
                htmlFor="address.state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State/Province
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address?.state || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="State"
              />
            </div>
            <div>
              <label
                htmlFor="address.zipCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="12345"
              />
            </div>
            <div>
              <label
                htmlFor="address.country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address?.country || ''}
                onChange={handleInputChange}
                className="input"
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <TagIcon className="h-5 w-5 inline mr-2" /> Tags
          </h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input flex-1"
                placeholder="Enter a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add Tag
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            href={returnTo}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
