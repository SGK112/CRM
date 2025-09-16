'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { useClients, type Client } from '../hooks/useClients';

interface ClientSelectorProps {
  value?: string | null;
  onSelect: (clientId: string | null, clientName: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export default function ClientSelector({
  value,
  onSelect,
  placeholder = "Select a client",
  allowClear = true,
  className = ""
}: ClientSelectorProps) {
  const { clients, loading, searchClients } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected client when value changes
  useEffect(() => {
    if (value) {
      const client = clients.find(c => c._id === value || c.id === value);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [value, clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    onSelect(client._id || client.id || null, client.name || null);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedClient(null);
    onSelect(null, null);
    setSearchQuery('');
  };

  const filteredClients = searchQuery ? searchClients(searchQuery) : clients;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          relative w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-500
          transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500
          focus-within:border-blue-500
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

            {selectedClient ? (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {selectedClient.name}
                </div>
                {selectedClient.company && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedClient.company}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            {allowClear && selectedClient && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Client List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading clients...
              </div>
            ) : filteredClients.length > 0 ? (
              <>
                {filteredClients.map((client) => (
                  <button
                    key={client._id || client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800
                      border-b border-gray-100 dark:border-gray-700 last:border-b-0
                      transition-colors duration-150
                      ${selectedClient?._id === client._id || selectedClient?.id === client.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {client.name?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {client.name}
                        </div>
                        {client.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {client.company}
                          </div>
                        )}
                        {client.email && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {client.email}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${client.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : client.status === 'lead'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }
                        `}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No clients found' : 'No clients available'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Navigate to create client page
                    window.open('/dashboard/clients?action=create', '_blank');
                  }}
                  className="mt-2 inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create New Client
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
