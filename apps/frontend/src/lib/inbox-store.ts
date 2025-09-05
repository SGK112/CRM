'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Estimate {
  _id: string;
  number: string;
  status: string;
  clientId?: string;
  subtotalSell: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  client?: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  project?: {
    title: string;
  };
}

interface InboxState {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedEstimate: Estimate | null;

  // Actions
  setEstimates: (estimates: Estimate[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedEstimate: (estimate: Estimate | null) => void;
  clearError: () => void;

  // Computed
  filteredEstimates: () => Estimate[];
  totalValue: () => number;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      estimates: [],
      loading: false,
      error: null,
      searchTerm: '',
      selectedEstimate: null,

      setEstimates: (estimates) => set({ estimates }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSelectedEstimate: (selectedEstimate) => set({ selectedEstimate }),
      clearError: () => set({ error: null }),

      filteredEstimates: () => {
        const { estimates, searchTerm } = get();
        if (!searchTerm) return estimates;

        const search = searchTerm.toLowerCase();
        return estimates.filter((estimate) =>
          estimate.number.toLowerCase().includes(search) ||
          estimate.client?.firstName?.toLowerCase().includes(search) ||
          estimate.client?.lastName?.toLowerCase().includes(search) ||
          estimate.client?.company?.toLowerCase().includes(search) ||
          estimate.status.toLowerCase().includes(search)
        );
      },

      totalValue: () => {
        const filtered = get().filteredEstimates();
        return filtered.reduce((sum, estimate) => sum + estimate.total, 0);
      },
    }),
    {
      name: 'inbox-store',
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        selectedEstimate: state.selectedEstimate,
      }),
    }
  )
);
