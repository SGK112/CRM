'use client'

import { useState, useEffect, useCallback } from 'react'
import { listTemplates, listDesigns } from '../lib/designsApi'

interface APIDesignSummary { _id: string; title?: string; name?: string; status?: string; }

interface SearchResult {
  id: string
  type: 'project' | 'client' | 'document' | 'message' | 'user' | 'design' | 'template'
  title: string
  description: string
  url: string
  metadata?: Record<string, any>
}

// Mock data for demonstration
const mockData: SearchResult[] = [
  // Projects
  {
    id: '1',
    type: 'project',
    title: 'Downtown Office Renovation',
    description: 'Complete office renovation for TechCorp',
    url: '/dashboard/projects/1',
    metadata: { status: 'In Progress', budget: '$150,000' }
  },
  {
    id: '2',
    type: 'project',
    title: 'Residential Kitchen Remodel',
    description: 'Modern kitchen remodel for the Johnson family',
    url: '/dashboard/projects/2',
    metadata: { status: 'Planning', budget: '$45,000' }
  },
  {
    id: '3',
    type: 'project',
    title: 'Commercial Warehouse Construction',
    description: 'New warehouse facility for LogisticsPro',
    url: '/dashboard/projects/3',
    metadata: { status: 'Completed', budget: '$2,500,000' }
  },
  
  // Clients
  {
    id: '4',
    type: 'client',
    title: 'TechCorp Industries',
    description: 'Technology company - 500+ employees',
    url: '/dashboard/clients/4',
    metadata: { projects: 3, phone: '(555) 123-4567' }
  },
  {
    id: '5',
    type: 'client',
    title: 'Johnson Family',
    description: 'Residential client - Kitchen remodel',
    url: '/dashboard/clients/5',
    metadata: { projects: 1, phone: '(555) 987-6543' }
  },
  {
    id: '6',
    type: 'client',
    title: 'LogisticsPro Corp',
    description: 'Logistics and warehousing company',
    url: '/dashboard/clients/6',
    metadata: { projects: 2, phone: '(555) 456-7890' }
  },
  
  // Documents
  {
    id: '7',
    type: 'document',
    title: 'Building Permit Application',
    description: 'Permit documents for downtown renovation',
    url: '/dashboard/documents/7',
    metadata: { project: 'Downtown Office Renovation', size: '2.5 MB' }
  },
  {
    id: '8',
    type: 'document',
    title: 'Architectural Blueprints',
    description: 'Complete set of architectural drawings',
    url: '/dashboard/documents/8',
    metadata: { project: 'Warehouse Construction', size: '15.2 MB' }
  },
  {
    id: '9',
    type: 'document',
    title: 'Contract Agreement',
    description: 'Signed contract for kitchen remodel',
    url: '/dashboard/documents/9',
    metadata: { project: 'Kitchen Remodel', size: '450 KB' }
  },
  
  // Messages
  {
    id: '10',
    type: 'message',
    title: 'Project Update from Mike',
    description: 'Status update on warehouse construction',
    url: '/dashboard/chat/10',
    metadata: { sender: 'Mike Thompson', timestamp: '2 hours ago' }
  },
  {
    id: '11',
    type: 'message',
    title: 'Client Feedback',
    description: 'Johnson family feedback on kitchen design',
    url: '/dashboard/chat/11',
    metadata: { sender: 'Sarah Johnson', timestamp: '1 day ago' }
  }
]

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches.slice(0, 4)] // Keep only 5 recent searches
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }, [recentSearches])

  // Perform search
  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery)
    
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))

    // Start with local mock data
    let aggregated: SearchResult[] = mockData.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.metadata && Object.values(item.metadata).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )

    // Attempt to fetch design templates & designs (graceful fail if no API)
    try {
      // Templates
      const templatesResp = await listTemplates({ search: searchQuery })
      if (Array.isArray(templatesResp)) {
        const templateResults: SearchResult[] = templatesResp.map((t: any) => ({
          id: t._id,
          type: 'template',
          title: t.name || t.title || 'Untitled Template',
          description: t.description || 'Design Template',
          url: `/dashboard/designer?template=${t._id}`,
          metadata: { category: t.category, features: t.features?.length, uses: t.usesCount }
        }))
        aggregated = aggregated.concat(templateResults)
      }
      // Designs
      const designsResp = await listDesigns({ search: searchQuery })
      if (Array.isArray(designsResp)) {
        const designResults: SearchResult[] = designsResp.map((d: any) => ({
            id: d._id,
            type: 'design',
            title: d.title || 'Untitled Design',
            description: d.status ? `Design (${d.status})` : 'Design',
            url: `/dashboard/designer/editor?design=${d._id}`,
            metadata: { status: d.status, templateId: d.templateId }
        }))
        aggregated = aggregated.concat(designResults)
      }
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.toLowerCase().includes('unauthorized')) {
        setError('unauthorized')
      }
    }

    // Deduplicate by id+type
    const seen = new Set<string>()
    const filtered = aggregated.filter(r => { const key = `${r.type}:${r.id}`; if (seen.has(key)) return false; seen.add(key); return true; })
    
    // If still no results, provide a soft hint by inserting a pseudo-result (not clickable)
    if (filtered.length === 0) {
      if (error === 'unauthorized') {
        setResults([{
          id: 'auth-needed',
          type: 'message',
          title: 'Sign in required to search live data',
          description: 'Log in again so we can search your templates and designs.',
          url: '/auth/login',
          metadata: { reason: 'unauthorized' }
        }])
      } else {
        setResults([])
      }
    } else {
      setResults(filtered)
    }
    setIsLoading(false)
    
    // Save to recent searches if we have results
    if (filtered.length > 0) {
      saveRecentSearch(searchQuery)
    }
  }, [saveRecentSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }, [])

  return {
    query,
    results,
    isLoading,
    recentSearches,
    error,
    search,
    clearSearch,
    clearRecentSearches
  }
}
