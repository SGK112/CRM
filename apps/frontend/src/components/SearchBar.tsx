'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
  CubeTransparentIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline'
import { useSearch } from '@/hooks/useSearch'
import MobileSearchBar from './MobileSearchBar'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

const typeIcons = {
  project: ClipboardDocumentListIcon,
  client: UserGroupIcon,
  document: DocumentTextIcon,
  message: ChatBubbleLeftRightIcon,
  user: UserGroupIcon,
  design: CubeTransparentIcon,
  template: RectangleGroupIcon
} as const

const typeColors = {
  project: 'text-blue-600 bg-blue-100',
  client: 'text-green-600 bg-green-100',
  document: 'text-orange-600 bg-orange-100',
  message: 'text-purple-600 bg-purple-100',
  user: 'text-gray-600 bg-gray-100',
  design: 'text-indigo-600 bg-indigo-100',
  template: 'text-pink-600 bg-pink-100'
} as const

export default function SearchBar({ className = '', placeholder = 'Search projects, clients, documents...' }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const { query, results, isLoading, recentSearches, search, clearSearch, clearRecentSearches } = useSearch()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value)
    search(value)
    setIsOpen(true)
  }

  // Handle result click
  const handleResultClick = (url: string) => {
    setIsOpen(false)
    setInputValue('')
    clearSearch()
    router.push(url)
  }

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    setInputValue(searchQuery)
    search(searchQuery)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0].url)
    }
  }

  // Handle mobile search focus
  const handleMobileFocus = () => {
    if (isMobile) {
      setIsMobileSearchOpen(true)
      inputRef.current?.blur()
    } else {
      setIsOpen(true)
    }
  }

  // Mobile search overlay
  if (isMobileSearchOpen) {
    return (
      <MobileSearchBar
        placeholder={placeholder}
        onClose={() => setIsMobileSearchOpen(false)}
        className={className}
      />
    )
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
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleMobileFocus}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-lg border-0 py-2 pl-10 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-colors"
          placeholder={placeholder}
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('')
              clearSearch()
              setIsOpen(false)
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown (Desktop Only) - Enhanced with solid background */}
      {!isMobile && isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-center bg-white dark:bg-gray-800">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          )}

          {/* No Query - Show Recent Searches */}
          {!query && !isLoading && recentSearches.length > 0 && (
            <div className="p-3 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="flex items-center w-full px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    {recentQuery}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && !isLoading && results.length > 0 && (
            <div className="p-3 bg-white dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Results for "{query}" ({results.length})
              </h3>
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons] || DocumentTextIcon
                  const colorClass = typeColors[result.type as keyof typeof typeColors] || 'text-gray-600 bg-gray-100'
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className="flex items-start w-full px-2 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group transition-colors"
                    >
                      <div className={`flex-shrink-0 p-1.5 rounded-md ${colorClass} mr-3 mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex items-center space-x-4 mt-1">
                            {result.type === 'project' && result.metadata.status && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Status: {result.metadata.status}
                              </span>
                            )}
                            {result.type === 'client' && result.metadata.projects && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.metadata.projects} project(s)
                              </span>
                            )}
                            {result.type === 'document' && result.metadata.size && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.metadata.size}
                              </span>
                            )}
                            {result.type === 'design' && result.metadata.status && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{result.metadata.status}</span>
                            )}
                            {result.type === 'template' && result.metadata.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{result.metadata.category}</span>
                            )}
                            {result.type === 'template' && typeof result.metadata.uses === 'number' && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{result.metadata.uses} uses</span>
                            )}
                            {result.type === 'message' && result.metadata.timestamp && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.metadata.timestamp}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && results.length === 0 && (
            <div className="px-4 py-6 text-center bg-white dark:bg-gray-800">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Try searching for projects, clients, documents, or messages
              </p>
            </div>
          )}

          {/* Search Tips */}
          {!query && !isLoading && recentSearches.length === 0 && (
            <div className="px-4 py-6 text-center bg-white dark:bg-gray-800">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Start typing to search</p>
              <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
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
  )
}
