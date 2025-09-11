'use client';

import {
  ArchiveBoxIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Sender {
  name: string;
  email?: string;
  avatar: string;
}

interface InboxMessage {
  id: string;
  type: 'email' | 'notification' | 'message' | 'task';
  title: string;
  content: string;
  sender: Sender;
  status: 'unread' | 'read' | 'starred';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  folderId: string;
  tags: string[];
  createdAt: string;
  projectId?: string;
  clientId?: string;
}

interface InboxStats {
  total: number;
  unread: number;
  starred: number;
  archived: number;
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: number; name: string; firstName?: string; email: string } | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [stats, setStats] = useState<InboxStats>({
    total: 0,
    unread: 0,
    starred: 0,
    archived: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    // Check if compose modal should be open
    const compose = searchParams.get('compose');
    if (compose === '1') {
      setShowCompose(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load mock data
    setTimeout(() => {
      const mockMessages: InboxMessage[] = [
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
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          projectId: 'proj-001',
          clientId: 'client-001',
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
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          projectId: 'proj-001',
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
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          clientId: 'client-002',
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
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          clientId: 'client-003',
        },
        {
          id: '5',
          type: 'email',
          title: 'Payment Confirmation',
          content: 'Your payment of $5,000 has been received. Thank you for your business.',
          sender: {
            name: 'Billing System',
            avatar: 'BS',
          },
          status: 'read',
          priority: 'normal',
          folderId: 'inbox',
          tags: ['payment', 'confirmation'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
      ];

      setMessages(mockMessages);
      setStats({
        total: mockMessages.length,
        unread: mockMessages.filter(m => m.status === 'unread').length,
        starred: mockMessages.filter(m => m.status === 'starred').length,
        archived: 0,
      });
      setLoading(false);
    }, 800);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';

    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

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

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-900 border-red-700';
      case 'high':
        return 'text-orange-400 bg-orange-900 border-orange-700';
      case 'normal':
        return 'text-blue-400 bg-blue-900 border-blue-700';
      case 'low':
        return 'text-gray-400 bg-gray-900 border-gray-700';
      default:
        return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
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

  const handleMessageClick = (message: InboxMessage) => {
    if (message.status === 'unread') {
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, status: 'read' as const } : m
      );
      setMessages(updatedMessages);
      setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
    }
  };

  const handleStar = (messageId: string) => {
    const updatedMessages = messages.map(m => {
      if (m.id === messageId) {
        const newStatus = m.status === 'starred' ? 'read' : 'starred';
        return { ...m, status: newStatus as 'unread' | 'read' | 'starred' };
      }
      return m;
    });
    setMessages(updatedMessages);
    
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setStats(prev => ({
        ...prev,
        starred: message.status === 'starred' ? prev.starred - 1 : prev.starred + 1
      }));
    }
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the message to your API
    setShowCompose(false);
    setComposeForm({ to: '', subject: '', message: '' });
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    // Update URL to remove compose parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('compose');
    window.history.replaceState({}, '', url.toString());
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder = selectedFolder === 'inbox' || 
                         (selectedFolder === 'starred' && message.status === 'starred') ||
                         (selectedFolder === 'unread' && message.status === 'unread');
    
    return matchesSearch && matchesFolder;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-lg text-white">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-black backdrop-blur-md border-b border-slate-700 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {getGreeting()}
                </h1>
                <p className="text-sm text-slate-400">
                  {stats.unread} unread messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors relative"
              >
                <BellIcon className="h-5 w-5 text-white" />
                {stats.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-600 rounded-full"></div>
                )}
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <UserIcon className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900 rounded-xl">
                <InboxIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900 rounded-xl">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Unread</p>
                <p className="text-lg font-bold text-white">{stats.unread}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900 rounded-xl">
                <StarIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Starred</p>
                <p className="text-lg font-bold text-white">{stats.starred}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900 rounded-xl">
                <ArchiveBoxIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Archived</p>
                <p className="text-lg font-bold text-white">{stats.archived}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFolder('inbox')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedFolder === 'inbox'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFolder('unread')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedFolder === 'unread'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setSelectedFolder('starred')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedFolder === 'starred'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Starred
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-black rounded-2xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {selectedFolder === 'inbox' ? 'All Messages' : 
                 selectedFolder === 'unread' ? 'Unread Messages' : 'Starred Messages'}
              </h2>
              <span className="text-sm text-slate-400">
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-slate-700">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <InboxIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No messages found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Your inbox is empty'}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 hover:bg-slate-800 cursor-pointer transition-colors"
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {message.sender.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {message.sender.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(message.type)}
                          {message.status === 'unread' && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 ml-auto">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>

                      <h3 className={`text-sm font-medium mb-1 truncate ${
                        message.status === 'unread' ? 'text-white' : 'text-slate-300'
                      }`}>
                        {message.title}
                      </h3>

                      <p className="text-sm text-slate-400 truncate mb-2">
                        {message.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {message.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStar(message.id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {message.status === 'starred' ? (
                          <StarIconSolid className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Compose Message</h2>
                <button
                  onClick={handleCloseCompose}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">To</label>
                <input
                  type="email"
                  value={composeForm.to}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="Enter recipient email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Subject</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Message</label>
                <textarea
                  value={composeForm.message}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={handleCloseCompose}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
