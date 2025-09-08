'use client';

import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface ClientData {
  id: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  location?: string;
  type: string;
  projectsCount?: number;
  totalValue?: number;
}

interface ClientCardProps {
  client: ClientData;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
}

export default function ClientCard({ client, viewMode, onViewDetails }: ClientCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'subcontractor':
        return <WrenchScrewdriverIcon className="h-4 w-4 text-green-600" />;
      case 'vendor':
        return <BuildingOfficeIcon className="h-4 w-4 text-purple-600" />;
      case 'lead':
        return <StarIcon className="h-4 w-4 text-amber-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'subcontractor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'vendor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'lead':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const openMaps = () => {
    if (client.location) {
      const query = encodeURIComponent(client.location);
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {(client.name || client.companyName || 'U').charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
                  {client.name || client.companyName}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(client.type)}`}>
                  {getTypeIcon(client.type)}
                  {client.type}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{client.phone}</span>
                  </div>
                )}
                {client.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{client.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {client.location && (
              <button
                onClick={openMaps}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                title="View on Maps"
              >
                <MapPinIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {(client.name || client.companyName || 'U').charAt(0).toUpperCase()}
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(client.type)}`}>
          {getTypeIcon(client.type)}
          {client.type}
        </span>
      </div>

      {/* Name */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
          {client.name || client.companyName}
        </h3>
        {client.companyName && client.name && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{client.name}</p>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        {client.email && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <EnvelopeIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <PhoneIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">{client.phone}</span>
          </div>
        )}
        {client.location && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">{client.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View Details
        </button>
        {client.location && (
          <button
            onClick={openMaps}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
            title="View on Maps"
          >
            <MapPinIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Stats (if available) */}
      {(client.projectsCount || client.totalValue) && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {client.projectsCount && (
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{client.projectsCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Projects</p>
            </div>
          )}
          {client.totalValue && (
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                ${(client.totalValue / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Value</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
