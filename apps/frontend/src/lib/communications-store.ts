'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Communication types
export type CommunicationType = 'email' | 'notification' | 'message' | 'task';

export interface Communication {
  id: string;
  type: CommunicationType;
  title: string;
  content: string;
  sender: {
    name: string;
    email?: string;
    avatar?: string;
  };
  recipient?: {
    name: string;
    email?: string;
  };
  status: 'unread' | 'read' | 'archived' | 'starred' | 'important';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  folderId: string;
  tags: string[];
  attachments?: {
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    projectId?: string;
    clientId?: string;
    estimateId?: string;
  };
  threadId?: string; // For email threads
  replies?: Communication[];
}

export interface Folder {
  id: string;
  name: string;
  type: 'system' | 'custom';
  icon: string;
  color: string;
  parentId?: string;
  unreadCount: number;
  totalCount: number;
  isExpanded?: boolean;
}

interface CommunicationsState {
  communications: Communication[];
  folders: Folder[];
  selectedCommunication: Communication | null;
  selectedFolder: string | null;
  searchTerm: string;
  filterType: CommunicationType | 'all';
  sortBy: 'date' | 'priority' | 'sender' | 'status';
  sortOrder: 'asc' | 'desc';
  loading: boolean;
  error: string | null;

  // UI State
  viewMode: 'list' | 'grid' | 'compact';
  showCompose: boolean;
  showFilters: boolean;
  selectedCommunications: string[];

  // Actions
  setCommunications: (communications: Communication[]) => void;
  addCommunication: (communication: Communication) => void;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
  deleteCommunication: (id: string) => void;
  setSelectedCommunication: (communication: Communication | null) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: CommunicationType | 'all') => void;
  setSortBy: (sortBy: 'date' | 'priority' | 'sender' | 'status') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // UI Actions
  setViewMode: (viewMode: 'list' | 'grid' | 'compact') => void;
  setShowCompose: (showCompose: boolean) => void;
  setShowFilters: (showFilters: boolean) => void;

  // Folder Management
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  moveCommunication: (communicationId: string, folderId: string) => void;

  // Draft Management
  saveDraft: (draft: Omit<Communication, 'id' | 'metadata'>) => void;
  updateDraft: (id: string, updates: Partial<Communication>) => void;
  deleteDraft: (id: string) => void;
  loadDraft: (id: string) => Communication | null;

  // Computed
  filteredCommunications: () => Communication[];
  unreadCount: () => number;
  folderStats: () => Record<string, { unread: number; total: number }>;
  getCommunicationById: (id: string) => Communication | undefined;
  getFolderById: (id: string) => Folder | undefined;
}

export const useCommunicationsStore = create<CommunicationsState>()(
  persist(
    (set, get) => ({
      communications: [
        {
          id: '1',
          type: 'email',
          title: 'Project Estimate Approved',
          content: 'Great news! Your estimate for the kitchen renovation has been approved. We can proceed with the project next week.',
          sender: {
            name: 'Sarah Johnson',
            email: 'sarah@client.com',
            avatar: 'SJ',
          },
          status: 'unread',
          priority: 'high',
          folderId: 'inbox',
          tags: ['approved', 'kitchen'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            projectId: 'proj-001',
            clientId: 'client-001',
          },
        },
        {
          id: '2',
          type: 'notification',
          title: 'New Message from Team',
          content: 'Mike has updated the project timeline. Please review the changes.',
          sender: {
            name: 'System',
            avatar: 'SYS',
          },
          status: 'read',
          priority: 'normal',
          folderId: 'inbox',
          tags: ['team', 'update'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            projectId: 'proj-001',
          },
        },
        {
          id: '3',
          type: 'message',
          title: 'Quick Question About Materials',
          content: 'Hi, I wanted to ask about the tile options for the bathroom. Do we have samples available?',
          sender: {
            name: 'David Chen',
            email: 'david@client.com',
            avatar: 'DC',
          },
          status: 'unread',
          priority: 'normal',
          folderId: 'inbox',
          tags: ['materials', 'bathroom'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            clientId: 'client-002',
          },
        },
        {
          id: '4',
          type: 'task',
          title: 'Follow up with client',
          content: 'Call John Smith to discuss the final contract details and payment schedule.',
          sender: {
            name: 'You',
            avatar: 'YOU',
          },
          status: 'starred',
          priority: 'urgent',
          folderId: 'inbox',
          tags: ['follow-up', 'contract'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Due tomorrow
            clientId: 'client-003',
          },
        },
      ],
      folders: [
        {
          id: 'inbox',
          name: 'Inbox',
          type: 'system',
          icon: 'inbox',
          color: '#3b82f6',
          unreadCount: 0,
          totalCount: 0,
          isExpanded: true,
        },
        {
          id: 'sent',
          name: 'Sent',
          type: 'system',
          icon: 'send',
          color: '#10b981',
          unreadCount: 0,
          totalCount: 0,
        },
        {
          id: 'drafts',
          name: 'Drafts',
          type: 'system',
          icon: 'file-text',
          color: '#f59e0b',
          unreadCount: 0,
          totalCount: 0,
        },
        {
          id: 'archive',
          name: 'Archive',
          type: 'system',
          icon: 'archive',
          color: '#6b7280',
          unreadCount: 0,
          totalCount: 0,
        },
        {
          id: 'trash',
          name: 'Trash',
          type: 'system',
          icon: 'trash',
          color: '#ef4444',
          unreadCount: 0,
          totalCount: 0,
        },
      ],
      selectedCommunication: null,
      selectedFolder: 'inbox',
      searchTerm: '',
      filterType: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      loading: false,
      error: null,
      viewMode: 'list',
      showCompose: false,
      showFilters: false,
      selectedCommunications: [],

      setCommunications: (communications) => set({ communications }),
      addCommunication: (communication) =>
        set((state) => ({
          communications: [communication, ...state.communications],
        })),
      updateCommunication: (id, updates) =>
        set((state) => ({
          communications: state.communications.map((comm) =>
            comm.id === id ? { ...comm, ...updates } : comm
          ),
        })),
      deleteCommunication: (id) =>
        set((state) => ({
          communications: state.communications.filter((comm) => comm.id !== id),
        })),
      setSelectedCommunication: (selectedCommunication) => set({ selectedCommunication }),
      setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setFilterType: (filterType) => set({ filterType }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      addFolder: (folder) =>
        set((state) => ({
          folders: [...state.folders, folder],
        })),
      updateFolder: (id, updates) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        })),
      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
        })),
      moveCommunication: (communicationId, folderId) =>
        set((state) => ({
          communications: state.communications.map((comm) =>
            comm.id === communicationId ? { ...comm, folderId } : comm
          ),
        })),

      setViewMode: (viewMode: 'list' | 'grid' | 'compact') => set({ viewMode }),
      setShowCompose: (showCompose: boolean) => set({ showCompose }),
      setShowFilters: (showFilters: boolean) => set({ showFilters }),
      toggleCommunicationSelection: (id: string) =>
        set((state) => ({
          selectedCommunications: state.selectedCommunications.includes(id)
            ? state.selectedCommunications.filter((commId) => commId !== id)
            : [...state.selectedCommunications, id],
        })),
      clearSelection: () => set({ selectedCommunications: [] }),

      // Draft Management
      saveDraft: (draft) => {
        const newDraft: Communication = {
          ...draft,
          id: `draft-${Date.now()}`,
          folderId: 'drafts',
          status: 'read', // Drafts are not unread
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        set((state) => ({
          communications: [newDraft, ...state.communications],
        }));
      },

      updateDraft: (id, updates) => {
        set((state) => ({
          communications: state.communications.map((comm) =>
            comm.id === id
              ? {
                  ...comm,
                  ...updates,
                  metadata: {
                    ...comm.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : comm
          ),
        }));
      },

      deleteDraft: (id) => {
        set((state) => ({
          communications: state.communications.filter((comm) => comm.id !== id),
        }));
      },

      loadDraft: (id) => {
        const { communications } = get();
        return communications.find((comm) => comm.id === id && comm.folderId === 'drafts') || null;
      },

      filteredCommunications: () => {
        const { communications, searchTerm, filterType, selectedFolder, sortBy, sortOrder } = get();

        let filtered = communications;

        // Filter by folder
        if (selectedFolder) {
          filtered = filtered.filter((comm) => comm.folderId === selectedFolder);
        }

        // Filter by type
        if (filterType !== 'all') {
          filtered = filtered.filter((comm) => comm.type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filtered = filtered.filter((comm) =>
            comm.title.toLowerCase().includes(search) ||
            comm.content.toLowerCase().includes(search) ||
            comm.sender.name.toLowerCase().includes(search) ||
            comm.tags.some((tag) => tag.toLowerCase().includes(search))
          );
        }

        // Sort
        filtered.sort((a, b) => {
          let aValue: string | number | Date;
          let bValue: string | number | Date;

          switch (sortBy) {
            case 'date': {
              aValue = new Date(a.metadata.createdAt);
              bValue = new Date(b.metadata.createdAt);
              break;
            }
            case 'priority': {
              const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
              aValue = priorityOrder[a.priority];
              bValue = priorityOrder[b.priority];
              break;
            }
            case 'sender': {
              aValue = a.sender.name.toLowerCase();
              bValue = b.sender.name.toLowerCase();
              break;
            }
            case 'status': {
              aValue = a.status;
              bValue = b.status;
              break;
            }
            default: {
              aValue = new Date(a.metadata.createdAt);
              bValue = new Date(b.metadata.createdAt);
            }
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        return filtered;
      },

      unreadCount: () => {
        const { communications } = get();
        return communications.filter((comm) => comm.status === 'unread').length;
      },

      folderStats: () => {
        const { communications, folders } = get();
        const stats: Record<string, { unread: number; total: number }> = {};

        folders.forEach((folder) => {
          const folderComms = communications.filter((comm) => comm.folderId === folder.id);
          stats[folder.id] = {
            unread: folderComms.filter((comm) => comm.status === 'unread').length,
            total: folderComms.length,
          };
        });

        return stats;
      },

      getCommunicationById: (id) => {
        const { communications } = get();
        return communications.find((comm) => comm.id === id);
      },

      getFolderById: (id) => {
        const { folders } = get();
        return folders.find((folder) => folder.id === id);
      },
    }),
    {
      name: 'communications-store',
      partialize: (state) => ({
        selectedFolder: state.selectedFolder,
        searchTerm: state.searchTerm,
        filterType: state.filterType,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
        showFilters: state.showFilters,
      }),
    }
  )
);
