'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
  CubeTransparentIcon,
  RectangleGroupIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useSearch } from '@/hooks/useSearch';

interface MobileSearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

const typeIcons = {
  project: ClipboardDocumentListIcon,
  client: UserGroupIcon,
  document: DocumentTextIcon,
  message: ChatBubbleLeftRightIcon,
  user: UserGroupIcon,
  design: CubeTransparentIcon,
  template: RectangleGroupIcon,
} as const;

const typeColors = {
  project: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  client: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  document: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  message: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  user: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
  design: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
  template: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
} as const;

export default function MobileSearchBar({
  className = '',
  placeholder = 'Search projects, clients, documents...',
  onClose,
}: MobileSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { query, results, isLoading, recentSearches, search, clearSearch, clearRecentSearches } =
    useSearch();

  // Auto-focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    search(value);
  };

  // Handle result click
  const handleResultClick = (url: string) => {
    setInputValue('');
    clearSearch();
    router.push(url);
    onClose?.();
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    setInputValue(searchQuery);
    search(searchQuery);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0].url);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-[var(--bg)] ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
          aria-label="Close search"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-faint)]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 bg-[var(--input-bg)] text-[var(--text)] ring-1 ring-inset ring-[var(--border)] placeholder:text-[var(--text-faint)] focus:ring-2 focus:ring-inset focus:ring-[var(--accent)] text-base transition-colors"
            placeholder={placeholder}
          />
          {inputValue && (
            <button
              onClick={() => {
                setInputValue('');
                clearSearch();
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto"></div>
            <p className="text-sm text-[var(--text-dim)] mt-3">Searching...</p>
          </div>
        )}

        {/* No Query - Show Recent Searches */}
        {!query && !isLoading && recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text)]">Recent searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className="flex items-center w-full px-3 py-3 text-sm text-[var(--text-dim)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-[var(--text-faint)] mr-3" />
                  {recentQuery}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && !isLoading && results.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-[var(--text)] mb-4">
              Results for "{query}" ({results.length})
            </h3>
            <div className="space-y-2">
              {results.map(result => {
                const Icon = typeIcons[result.type as keyof typeof typeIcons] || DocumentTextIcon;
                const colorClass =
                  typeColors[result.type as keyof typeof typeColors] ||
                  'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';

                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className="flex items-start w-full px-3 py-4 text-left hover:bg-[var(--surface-2)] rounded-lg group transition-colors"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-md ${colorClass} mr-4 mt-0.5`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                        {result.title}
                      </p>
                      <p className="text-sm text-[var(--text-dim)] mt-1 line-clamp-2">
                        {result.description}
                      </p>
                      {result.metadata && (
                        <div className="flex items-center space-x-4 mt-2">
                          {result.type === 'project' && result.metadata.status && (
                            <span className="text-xs text-[var(--text-faint)] bg-[var(--surface-2)] px-2 py-1 rounded">
                              {result.metadata.status}
                            </span>
                          )}
                          {result.type === 'client' && result.metadata.projects && (
                            <span className="text-xs text-[var(--text-faint)]">
                              {result.metadata.projects} project(s)
                            </span>
                          )}
                          {result.type === 'document' && result.metadata.size && (
                            <span className="text-xs text-[var(--text-faint)]">
                              {result.metadata.size}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {query && !isLoading && results.length === 0 && (
          <div className="p-6 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-[var(--text-faint)] mx-auto mb-4" />
            <p className="text-base text-[var(--text-dim)] mb-2">No results found for "{query}"</p>
            <p className="text-sm text-[var(--text-faint)]">
              Try searching for projects, clients, documents, or messages
            </p>
          </div>
        )}

        {/* Search Tips */}
        {!query && !isLoading && recentSearches.length === 0 && (
          <div className="p-6 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-[var(--text-faint)] mx-auto mb-4" />
            <p className="text-base text-[var(--text-dim)] mb-4">Start typing to search</p>
            <div className="text-sm text-[var(--text-faint)] space-y-2 text-left max-w-sm mx-auto">
              <p>• Search projects by name or status</p>
              <p>• Find clients by company or contact info</p>
              <p>• Look up documents by name or project</p>
              <p>• Browse messages and communications</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
