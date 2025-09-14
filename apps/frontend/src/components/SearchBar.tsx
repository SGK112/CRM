'use client';

import { useSearch } from '@/hooks/useSearch';
import {
    ChatBubbleLeftRightIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    CubeTransparentIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    RectangleGroupIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import MobileSearchBar from './MobileSearchBar';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
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
  project: 'text-blue-600 bg-blue-100',
  client: 'text-green-600 bg-green-100',
  document: 'text-orange-600 bg-orange-100',
  message: 'text-purple-600 bg-purple-100',
  user: 'text-gray-600 bg-gray-100',
  design: 'text-indigo-600 bg-indigo-100',
  template: 'text-pink-600 bg-pink-100',
} as const;

export default function SearchBar({
  className = '',
  placeholder = 'Search projects, clients, documents...',
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { query, results, isLoading, recentSearches, search, clearSearch, clearRecentSearches } =
    useSearch();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setInputValue(value);
    search(value);
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  // Handle result click
  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setInputValue('');
    clearSearch();
    router.push(url);
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
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0].url);
    }
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      // Focus first result (could be enhanced with keyboard navigation)
    }
  };

  // Handle mobile search focus
  const handleMobileFocus = () => {
    if (isMobile) {
      setIsMobileSearchOpen(true);
      inputRef.current?.blur();
    } else {
      setIsOpen(true);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!isMobile) {
      setIsOpen(true);
    }
  };

  // Mobile search overlay
  if (isMobileSearchOpen) {
    return (
      <MobileSearchBar
        placeholder={placeholder}
        onClose={() => setIsMobileSearchOpen(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-faint)]" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={handleMobileFocus}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-lg border-0 py-2 pl-10 pr-10 bg-[var(--input-bg)] text-[var(--text)] ring-1 ring-inset ring-[var(--border)] placeholder:text-[var(--text-faint)] focus:ring-2 focus:ring-inset focus:ring-[var(--accent)] sm:text-sm sm:leading-6 transition-colors"
          placeholder={placeholder}
          autoComplete="off"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              clearSearch();
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown (Desktop Only) - Enhanced positioning and theme */}
      {!isMobile && isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-[999] mt-1 bg-[var(--surface-1)] rounded-lg shadow-xl ring-1 ring-[var(--border)] max-h-96 overflow-y-auto border border-[var(--border)] backdrop-blur-sm"
          style={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 999 
          }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-center bg-[var(--surface-1)]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-sm text-[var(--text-dim)] mt-2">Searching...</p>
            </div>
          )}

          {/* No Query - Show Recent Searches */}
          {!query && !isLoading && recentSearches.length > 0 && (
            <div className="p-3 bg-[var(--surface-1)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--text)]">
                  Recent searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="flex items-center w-full px-2 py-2 text-sm text-[var(--text-dim)] hover:bg-[var(--surface-2)] rounded-md transition-colors"
                  >
                    <ClockIcon className="h-4 w-4 text-[var(--text-faint)] mr-2" />
                    {recentQuery}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && !isLoading && results.length > 0 && (
            <div className="p-3 bg-[var(--surface-1)]">
              <h3 className="text-sm font-medium text-[var(--text)] mb-2">
                Results for "{query}" ({results.length})
              </h3>
              <div className="space-y-1">
                {results.map(result => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons] || DocumentTextIcon;
                  const colorClass =
                    typeColors[result.type as keyof typeof typeColors] ||
                    'text-gray-600 bg-gray-100';

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className="flex items-start w-full px-2 py-3 text-left hover:bg-[var(--surface-2)] rounded-md group transition-colors"
                    >
                      <div className={`flex-shrink-0 p-1.5 rounded-md ${colorClass} mr-3 mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                          {result.title}
                        </p>
                        <p className="text-sm text-[var(--text-dim)] truncate">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex items-center space-x-4 mt-1">
                            {result.type === 'project' && result.metadata.status && (
                              <span className="text-xs text-[var(--text-faint)]">
                                Status: {result.metadata.status}
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
                            {result.type === 'design' && result.metadata.status && (
                              <span className="text-xs text-[var(--text-faint)]">
                                {result.metadata.status}
                              </span>
                            )}
                            {result.type === 'template' && result.metadata.category && (
                              <span className="text-xs text-[var(--text-faint)]">
                                {result.metadata.category}
                              </span>
                            )}
                            {result.type === 'template' &&
                              typeof result.metadata.uses === 'number' && (
                                <span className="text-xs text-[var(--text-faint)]">
                                  {result.metadata.uses} uses
                                </span>
                              )}
                            {result.type === 'message' && result.metadata.timestamp && (
                              <span className="text-xs text-[var(--text-faint)]">
                                {result.metadata.timestamp}
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
            <div className="px-4 py-6 text-center bg-[var(--surface-1)]">
              <MagnifyingGlassIcon className="h-12 w-12 text-[var(--text-faint)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-dim)]">
                No results found for "{query}"
              </p>
              <p className="text-xs text-[var(--text-faint)] mt-1">
                Try searching for projects, clients, documents, or messages
              </p>
            </div>
          )}

          {/* Search Tips */}
          {!query && !isLoading && recentSearches.length === 0 && (
            <div className="px-4 py-6 text-center bg-[var(--surface-1)]">
              <MagnifyingGlassIcon className="h-12 w-12 text-[var(--text-faint)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-dim)] mb-2">
                Start typing to search
              </p>
              <div className="text-xs text-[var(--text-faint)] space-y-1">
                <p>• Search projects by name or status</p>
                <p>• Find clients by company or contact info</p>
                <p>• Look up documents by name or project</p>
                <p>• Browse messages and communications</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
