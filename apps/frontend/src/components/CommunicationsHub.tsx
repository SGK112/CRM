'use client';

import { useCommunicationsStore, type Communication, type CommunicationType } from '@/lib/communications-store';
import {
    ArchiveBoxIcon,
    Bars3Icon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    CheckIcon,
    ChevronDownIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    FlagIcon,
    FolderIcon,
    FunnelIcon,
    InboxIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import {
    FlagIcon as FlagIconSolid,
    StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ComposeModal from './ComposeModal';

// Mock data for development
const getMockCommunications = (): Communication[] => [
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
];

// Format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    return 'Invalid Date';
  }
};

// Get priority color
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-400';
    case 'high':
      return 'text-orange-400';
    case 'normal':
      return 'text-blue-400';
    case 'low':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};

// Get type icon
const getTypeIcon = (type: CommunicationType) => {
  switch (type) {
    case 'email':
      return <EnvelopeIcon className="h-4 w-4" />;
    case 'notification':
      return <BellIcon className="h-4 w-4" />;
    case 'message':
      return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    case 'task':
      return <FlagIcon className="h-4 w-4" />;
    default:
      return <EnvelopeIcon className="h-4 w-4" />;
  }
};

// Get folder icon
const getFolderIcon = (folderId: string) => {
  switch (folderId) {
    case 'inbox':
      return <InboxIcon className="h-4 w-4" />;
    case 'sent':
      return <PaperAirplaneIcon className="h-4 w-4" />;
    case 'drafts':
      return <PencilSquareIcon className="h-4 w-4" />;
    case 'archive':
      return <ArchiveBoxIcon className="h-4 w-4" />;
    case 'trash':
      return <TrashIcon className="h-4 w-4" />;
    default:
      return <FolderIcon className="h-4 w-4" />;
  }
};

export default function CommunicationsHub() {
  const {
    folders,
    selectedCommunication,
    selectedFolder,
    searchTerm,
    filterType,
    sortBy,
    sortOrder,
    loading,
    error,
    viewMode,
    showFilters,
    setCommunications,
    setSelectedCommunication,
    setSelectedFolder,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setSortOrder,
    setLoading,
    setError,
    clearError,
    updateCommunication,
    setViewMode,
    setShowFilters,
    filteredCommunications,
    unreadCount,
    folderStats,
    addCommunication,
  } = useCommunicationsStore();

  const [renderError, setRenderError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Communication | null>(null);

  // Fetch communications using React Query
  const { isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      // For now, use mock data directly to avoid auth issues
      const mockData = getMockCommunications();
      setCommunications(mockData);
      return mockData;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: () => {
      setLoading(false);
      clearError();
    },
    onError: () => {
      // Use mock data as fallback
      const mockData = getMockCommunications();
      const { setCommunications, setLoading } = useCommunicationsStore.getState();
      setCommunications(mockData);
      setError(null); // Clear error since we're using fallback
      setLoading(false);
    },
  });

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Handle render errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setRenderError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const filtered = filteredCommunications();
  const stats = folderStats();
  const totalUnread = unreadCount();

  const handleCommunicationClick = (communication: Communication) => {
    // If it's a draft, open it for editing
    if (communication.folderId === 'drafts') {
      setEditingDraft(communication);
      setShowComposeModal(true);
      return;
    }

    setSelectedCommunication(communication);
    if (communication.status === 'unread') {
      updateCommunication(communication.id, { status: 'read' });
    }
  };

  const handleMarkAsRead = (communicationId: string) => {
    updateCommunication(communicationId, { status: 'read' });
  };

  const handleMarkAsUnread = (communicationId: string) => {
    updateCommunication(communicationId, { status: 'unread' });
  };

  const handleStar = (communicationId: string, currentStatus: string) => {
    updateCommunication(communicationId, {
      status: currentStatus === 'starred' ? 'read' : 'starred'
    });
  };

  const handleSendCommunication = (communication: Communication) => {
    // If it's a draft, it should already be in the store, just refresh the view
    if (communication.folderId === 'drafts') {
      // Force a re-render by updating the store state
      const { setCommunications, communications } = useCommunicationsStore.getState();
      setCommunications([...communications]);
      return;
    }

    // For regular communications, add to store
    addCommunication(communication);
  };

  const handleArchive = (communicationId: string) => {
    updateCommunication(communicationId, { folderId: 'archive' });
  };

  if (renderError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Render Error</h2>
          </div>
          <p className="text-red-300 text-sm">{renderError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Bars3Icon className="h-5 w-5 text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-white">Communications Hub</h1>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 text-slate-400'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'compact' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bars3Icon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setEditingDraft(null);
                setShowComposeModal(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Compose</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 transition-all duration-300`}>
          <div className="p-4">
            {/* Folders */}
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-slate-700 text-white'
                      : 'hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`text-${folder.color.replace('#', '')}`}>
                    {getFolderIcon(folder.id)}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{folder.name}</span>
                      {stats[folder.id]?.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {stats[folder.id].unread}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                    <StarIcon className="h-4 w-4" />
                    <span>Starred</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                    <FlagIcon className="h-4 w-4" />
                    <span>Important</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {showFilters && (
                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as CommunicationType | 'all')}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Types</option>
                    <option value="email">Emails</option>
                    <option value="notification">Notifications</option>
                    <option value="message">Messages</option>
                    <option value="task">Tasks</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'sender' | 'status')}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="date">Date</option>
                    <option value="priority">Priority</option>
                    <option value="sender">Sender</option>
                    <option value="status">Status</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Communications List or Detail View */}
          <div className="flex-1 overflow-hidden">
            {selectedCommunication ? (
              /* Message Detail View - Full Main Content */
              <div className="h-full flex flex-col">
                {/* Detail Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCommunication(null)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronDownIcon className="h-5 w-5 rotate-90" />
                      <span>Back to Messages</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStar(selectedCommunication.id, selectedCommunication.status)}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {selectedCommunication.status === 'starred' ? (
                          <StarIconSolid className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          selectedCommunication.status === 'unread'
                            ? handleMarkAsRead(selectedCommunication.id)
                            : handleMarkAsUnread(selectedCommunication.id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {selectedCommunication.status === 'unread' ? (
                          <CheckIcon className="h-5 w-5 text-slate-400" />
                        ) : (
                          <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleArchive(selectedCommunication.id)}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <ArchiveBoxIcon className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-4xl mx-auto p-8">
                    {/* Message Header */}
                    <div className="mb-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                          {selectedCommunication.sender.avatar || selectedCommunication.sender.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">
                              {selectedCommunication.title}
                            </h1>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(selectedCommunication.type)}
                              {selectedCommunication.priority !== 'normal' && (
                                <FlagIconSolid className={`h-4 w-4 ${getPriorityColor(selectedCommunication.priority)}`} />
                              )}
                              {selectedCommunication.status === 'starred' && (
                                <StarIconSolid className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="font-medium text-white">{selectedCommunication.sender.name}</span>
                            {selectedCommunication.sender.email && (
                              <span>{selectedCommunication.sender.email}</span>
                            )}
                            <span>•</span>
                            <span>{formatDate(selectedCommunication.metadata.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedCommunication.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {selectedCommunication.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                          {selectedCommunication.content}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-8 p-6 bg-slate-800/20 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Message Details</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-400">Type</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getTypeIcon(selectedCommunication.type)}
                            <span className="text-white capitalize">{selectedCommunication.type}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-400">Priority</label>
                          <div className="flex items-center gap-2 mt-1">
                            {selectedCommunication.priority !== 'normal' && (
                              <FlagIconSolid className={`h-4 w-4 ${getPriorityColor(selectedCommunication.priority)}`} />
                            )}
                            <span className="text-white capitalize">{selectedCommunication.priority}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-400">Status</label>
                          <span className="text-white capitalize mt-1 block">{selectedCommunication.status}</span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-400">Folder</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getFolderIcon(selectedCommunication.folderId)}
                            <span className="text-white capitalize">{selectedCommunication.folderId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Metadata */}
                      {selectedCommunication.metadata && (
                        <div className="mt-6 pt-6 border-t border-slate-700">
                          <div className="grid grid-cols-2 gap-6">
                            {selectedCommunication.metadata.projectId && (
                              <div>
                                <label className="text-sm font-medium text-slate-400">Project ID</label>
                                <span className="text-white mt-1 block font-mono text-sm">
                                  {selectedCommunication.metadata.projectId}
                                </span>
                              </div>
                            )}
                            {selectedCommunication.metadata.clientId && (
                              <div>
                                <label className="text-sm font-medium text-slate-400">Client ID</label>
                                <span className="text-white mt-1 block font-mono text-sm">
                                  {selectedCommunication.metadata.clientId}
                                </span>
                              </div>
                            )}
                            {selectedCommunication.metadata.dueDate && (
                              <div>
                                <label className="text-sm font-medium text-slate-400">Due Date</label>
                                <span className="text-white mt-1 block">
                                  {new Date(selectedCommunication.metadata.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Communications List View */
              <>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <span className="ml-3 text-slate-400">Loading communications...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <InboxIcon className="h-16 w-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">No communications found</h3>
                    <p className="text-slate-500">
                      {searchTerm ? 'Try adjusting your search terms' : 'Your inbox is empty'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    {viewMode === 'list' ? (
                      <div className="divide-y divide-slate-700">
                        {filtered.map((communication) => (
                          <div
                            key={communication.id}
                            className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                              (selectedCommunication as Communication | null)?.id === communication.id ? 'bg-slate-800/70' : ''
                            }`}
                            onClick={() => handleCommunicationClick(communication)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                  {communication.sender.avatar || communication.sender.name.charAt(0)}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white truncate">
                                    {communication.sender.name}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {getTypeIcon(communication.type)}
                                    {communication.priority !== 'normal' && (
                                      <FlagIconSolid className={`h-3 w-3 ${getPriorityColor(communication.priority)}`} />
                                    )}
                                    {communication.status === 'starred' && (
                                      <StarIconSolid className="h-3 w-3 text-yellow-400" />
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500 ml-auto">
                                    {formatDate(communication.metadata.createdAt)}
                                  </span>
                                </div>

                                <h3 className={`text-sm font-medium mb-1 ${
                                  communication.status === 'unread' ? 'text-white' : 'text-slate-300'
                                }`}>
                                  {communication.title}
                                </h3>

                                <p className="text-sm text-slate-400 truncate">
                                  {communication.content}
                                </p>

                                {communication.tags.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {communication.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0 flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStar(communication.id, communication.status);
                                  }}
                                  className="p-1 rounded hover:bg-slate-700 transition-colors"
                                >
                                  {communication.status === 'starred' ? (
                                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                  ) : (
                                    <StarIcon className="h-4 w-4 text-slate-400" />
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    communication.status === 'unread'
                                      ? handleMarkAsRead(communication.id)
                                      : handleMarkAsUnread(communication.id);
                                  }}
                                  className="p-1 rounded hover:bg-slate-700 transition-colors"
                                >
                                  {communication.status === 'unread' ? (
                                    <CheckIcon className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(communication.id);
                                  }}
                                  className="p-1 rounded hover:bg-slate-700 transition-colors"
                                >
                                  <ArchiveBoxIcon className="h-4 w-4 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Compact view
                      <div className="p-4 space-y-2">
                        {filtered.map((communication) => (
                          <div
                            key={communication.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              (selectedCommunication as Communication | null)?.id === communication.id
                                ? 'bg-slate-800 border-slate-600'
                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                            }`}
                            onClick={() => handleCommunicationClick(communication)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(communication.type)}
                                {communication.status === 'unread' && (
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white truncate">
                                    {communication.title}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDate(communication.metadata.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">
                                  {communication.sender.name} • {communication.content}
                                </p>
                              </div>

                              {communication.status === 'starred' && (
                                <StarIconSolid className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500/50 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      <ComposeModal
        isOpen={showComposeModal}
        onClose={() => {
          setShowComposeModal(false);
          setEditingDraft(null);
        }}
        onSend={handleSendCommunication}
        draft={editingDraft}
      />
    </div>
  );
}
