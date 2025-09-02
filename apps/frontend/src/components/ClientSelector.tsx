'use client';

import { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition, Dialog } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface ClientSelectorProps {
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  clients: Client[];
  onRefreshClients?: () => void;
  className?: string;
  placeholder?: string;
  allowCreate?: boolean;
  disabled?: boolean;
  required?: boolean;
}

interface NewClientForm {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function ClientSelector({
  selectedClientId,
  onClientSelect,
  clients,
  onRefreshClients,
  className = '',
  placeholder = 'Search or add client...',
  allowCreate = true,
  disabled = false,
  required = false,
}: ClientSelectorProps) {
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const selectedClient = clients.find(c => c._id === selectedClientId);

  const filteredClients =
    query === ''
      ? clients
      : clients.filter(client => {
          const searchText =
            `${client.firstName} ${client.lastName} ${client.company || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  const handleCreateClient = async () => {
    if (!newClient.firstName.trim() || !newClient.lastName.trim()) {
      return;
    }

    setCreating(true);
    try {
      const clientData = {
        firstName: newClient.firstName.trim(),
        lastName: newClient.lastName.trim(),
        ...(newClient.company.trim() && { company: newClient.company.trim() }),
        ...(newClient.email.trim() && { email: newClient.email.trim() }),
        ...(newClient.phone.trim() && { phone: newClient.phone.trim() }),
        ...((newClient.street.trim() ||
          newClient.city.trim() ||
          newClient.state.trim() ||
          newClient.zipCode.trim()) && {
          address: {
            ...(newClient.street.trim() && { street: newClient.street.trim() }),
            ...(newClient.city.trim() && { city: newClient.city.trim() }),
            ...(newClient.state.trim() && { state: newClient.state.trim() }),
            ...(newClient.zipCode.trim() && { zipCode: newClient.zipCode.trim() }),
          },
        }),
      };

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        const createdClient = await response.json();
        onClientSelect(createdClient._id);
        setShowCreateModal(false);
        setNewClient({
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
        });
        if (onRefreshClients) {
          onRefreshClients();
        }
      } else {
        console.error('Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setCreating(false);
    }
  };

  const getClientDisplayName = (client: Client) => {
    return client.company
      ? `${client.company} (${client.firstName} ${client.lastName})`
      : `${client.firstName} ${client.lastName}`;
  };

  return (
    <>
      <div className={className}>
        <Combobox value={selectedClient} onChange={client => onClientSelect(client?._id || '')}>
          <div className="relative">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
              <Combobox.Input
                className={`w-full border-none py-2.5 pl-10 pr-10 text-sm leading-5 text-gray-900 dark:text-white bg-transparent focus:ring-0 focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                displayValue={(client: Client | null) =>
                  client ? getClientDisplayName(client) : ''
                }
                onChange={event => setQuery(event.target.value)}
                placeholder={placeholder}
                readOnly={disabled}
              />
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {/* Add New Client Option */}
                {allowCreate && query.trim() && (
                  <div
                    className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-700 dark:text-gray-300 hover:bg-brand-600 hover:text-white border-b border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      const nameParts = query.trim().split(' ');
                      setNewClient({
                        ...newClient,
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || '',
                      });
                      setShowCreateModal(true);
                    }}
                  >
                    <PlusIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <span className="font-medium">Add "{query}"</span>
                    <span className="text-xs block">Create new client</span>
                  </div>
                )}

                {filteredClients.length === 0 && query !== '' && !allowCreate && (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                    No clients found.
                  </div>
                )}

                {filteredClients.map(client => (
                  <Combobox.Option
                    key={client._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-brand-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                    value={client}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div
                              className={`block truncate font-medium ${selected ? 'font-semibold' : 'font-normal'}`}
                            >
                              {getClientDisplayName(client)}
                            </div>
                            {(client.email || client.phone) && (
                              <div
                                className={`text-xs flex items-center gap-2 mt-1 ${active ? 'text-brand-200' : 'text-gray-500 dark:text-gray-400'}`}
                              >
                                {client.email && (
                                  <span className="flex items-center gap-1">
                                    <EnvelopeIcon className="w-3 h-3" />
                                    {client.email}
                                  </span>
                                )}
                                {client.phone && (
                                  <span className="flex items-center gap-1">
                                    <PhoneIcon className="w-3 h-3" />
                                    {client.phone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-brand-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>

      {/* Create New Client Modal */}
      <Transition appear show={showCreateModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCreateModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Add New Client
                    </Dialog.Title>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleCreateClient();
                    }}
                    className="space-y-4"
                  >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={newClient.firstName}
                          onChange={e => setNewClient({ ...newClient, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={newClient.lastName}
                          onChange={e => setNewClient({ ...newClient, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={newClient.company}
                        onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newClient.email}
                          onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={newClient.phone}
                          onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={newClient.street}
                        onChange={e => setNewClient({ ...newClient, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={newClient.city}
                          onChange={e => setNewClient({ ...newClient, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={newClient.state}
                          onChange={e => setNewClient({ ...newClient, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={newClient.zipCode}
                          onChange={e => setNewClient({ ...newClient, zipCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          creating || !newClient.firstName.trim() || !newClient.lastName.trim()
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 rounded-lg transition-colors"
                      >
                        {creating ? 'Creating...' : 'Create Client'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
