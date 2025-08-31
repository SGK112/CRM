'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Bell, 
  MessageSquare, 
  Settings, 
  Star, 
  Archive, 
  Search, 
  ChevronDown,
  MoreVertical,
  Reply,
  Forward,
  Clock,
  User,
  Circle,
  Loader,
  Inbox as InboxIcon,
  Send,
  Plus,
  X
} from 'lucide-react';interface InboxMessage {
  _id: string;
  type: 'email' | 'notification' | 'sms' | 'system';
  subject: string;
  content: string;
  sender: string;
  senderName?: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  threadId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: {
    attachments?: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      url: string;
    }>;
    actionUrl?: string;
    actionLabel?: string;
    clientInfo?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  createdAt: string;
  lastActivity: string;
}

interface InboxStats {
  total: number;
  unread: number;
  starred: number;
  archived: number;
  byType: {
    email: number;
    notification: number;
    sms: number;
    system: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    isRead: 'all',
    isStarred: false,
    isArchived: false,
    priority: 'all',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
  });

  // Check for compose parameter and open modal
  useEffect(() => {
    if (searchParams.get('compose') === '1') {
      setShowCompose(true);
    }
  }, [searchParams]);

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.isRead !== 'all') queryParams.append('isRead', filters.isRead);
      if (filters.isStarred) queryParams.append('isStarred', 'true');
      if (filters.isArchived) queryParams.append('isArchived', 'true');
      if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/inbox?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      // Error handled silently for better UX
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSendMessage = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setActionLoading('sending');
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: composeData.type,
          subject: composeData.subject,
          content: composeData.content,
          recipient: composeData.to,
          metadata: {
            to: composeData.to,
            from: 'admin@remodely.ai' // This could be dynamic based on current user
          }
        })
      });

      if (response.ok) {
        // Reset compose form
        setComposeData({
          to: '',
          subject: '',
          content: '',
          type: 'email'
        });
        setShowCompose(false);
        
        // Refresh messages
        fetchMessages();
        fetchStats();
        
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      // Handle error silently and show user-friendly message
      alert('Error sending message');
    } finally {
      setActionLoading(null);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inbox/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      // Error handled silently for better UX
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [fetchMessages]);

  const markAsRead = async (messageId: string) => {
    setActionLoading(messageId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inbox/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        ));
        fetchStats();
      }
    } catch (error) {
      // Error handled silently for better UX
    } finally {
      setActionLoading(null);
    }
  };

  const toggleStar = async (messageId: string) => {
    setActionLoading(messageId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inbox/${messageId}/star`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
        ));
        fetchStats();
      }
    } catch (error) {
      // Error handled silently for better UX
    } finally {
      setActionLoading(null);
    }
  };

  const archiveMessage = async (messageId: string) => {
    setActionLoading(messageId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inbox/${messageId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        fetchStats();
      }
    } catch (error) {
      // Error handled silently for better UX
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inbox/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: filters.type !== 'all' ? filters.type : undefined,
          isArchived: filters.isArchived,
        }),
      });

      if (response.ok) {
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      // Error handled silently for better UX
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <InboxIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Inbox
              </h1>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="px-6 py-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.unread}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.starred}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Starred</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="email">📧 Email</option>
                    <option value="notification">🔔 Notifications</option>
                    <option value="sms">💬 SMS</option>
                    <option value="system">⚙️ System</option>
                  </select>
                </div>

                {/* Read Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.isRead}
                    onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Messages</option>
                    <option value="false">Unread Only</option>
                    <option value="true">Read Only</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>

                {/* Toggle Filters */}
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isStarred}
                      onChange={(e) => setFilters({ ...filters, isStarred: e.target.checked })}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">⭐ Starred only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isArchived}
                      onChange={(e) => setFilters({ ...filters, isArchived: e.target.checked })}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📁 Show archived</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 mt-auto">
            <button
              onClick={markAllAsRead}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Circle className="w-4 h-4" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 flex">
          <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <InboxIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No messages found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) {
                        markAsRead(message._id);
                      }
                    }}
                    className={`border-b border-gray-200 dark:border-gray-700 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedMessage?._id === message._id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                    } ${!message.isRead ? 'bg-blue-25 dark:bg-blue-950/10' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getTypeIcon(message.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {!message.isRead && (
                              <Circle className="w-2 h-2 fill-blue-600 text-blue-600 flex-shrink-0" />
                            )}
                            <p className={`text-sm truncate ${
                              !message.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {message.senderName || message.sender}
                            </p>
                            {message.priority !== 'normal' && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mb-1 truncate ${
                            !message.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        {message.isStarred && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="flex-1 bg-white dark:bg-gray-800">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Message Header */}
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(selectedMessage.type)}
                          <span className="font-medium">{selectedMessage.senderName || selectedMessage.sender}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        </div>
                        {selectedMessage.priority !== 'normal' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                            {selectedMessage.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => toggleStar(selectedMessage._id)}
                        disabled={actionLoading === selectedMessage._id}
                        className={`p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedMessage.isStarred ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${selectedMessage.isStarred ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => archiveMessage(selectedMessage._id)}
                        disabled={actionLoading === selectedMessage._id}
                        className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      className="text-gray-900 dark:text-white leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.content.replace(/\n/g, '<br>') }}
                    />
                  </div>

                  {/* Attachments */}
                  {selectedMessage.metadata?.attachments && selectedMessage.metadata.attachments.length > 0 && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Attachments</h4>
                      <div className="space-y-3">
                        {selectedMessage.metadata.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.fileName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium px-4 py-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/75 transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button for Notifications */}
                  {selectedMessage.metadata?.actionUrl && selectedMessage.metadata?.actionLabel && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <a
                        href={selectedMessage.metadata.actionUrl}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        {selectedMessage.metadata.actionLabel}
                      </a>
                    </div>
                  )}

                  {/* Client Info */}
                  {selectedMessage.metadata?.clientInfo && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Related Client</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedMessage.metadata.clientInfo.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedMessage.metadata.clientInfo.email}
                            </p>
                            {selectedMessage.metadata.clientInfo.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedMessage.metadata.clientInfo.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Actions */}
                {selectedMessage.type === 'email' && (
                  <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <div className="flex space-x-4">
                      <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </button>
                      <button className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all duration-200">
                        <Forward className="w-4 h-4 mr-2" />
                        Forward
                      </button>
                      <button 
                        onClick={() => setShowCompose(true)}
                        className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all duration-200"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Compose New
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <InboxIcon className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a message</h3>
                  <p className="text-gray-500 dark:text-gray-400">Choose a message from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCompose(false)}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Message</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Message Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={composeData.type}
                      onChange={(e) => setComposeData({...composeData, type: e.target.value as 'email' | 'sms'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="email">📧 Email</option>
                      <option value="sms">📱 SMS</option>
                    </select>
                  </div>

                  {/* To Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {composeData.type === 'email' ? 'To (Email)' : 'To (Phone)'}
                    </label>
                    <input
                      type={composeData.type === 'email' ? 'email' : 'tel'}
                      value={composeData.to}
                      onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                      placeholder={composeData.type === 'email' ? 'recipient@example.com' : '+1234567890'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                      placeholder="Enter subject..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Content Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={composeData.content}
                      onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                      placeholder="Type your message here..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={actionLoading === 'sending'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading === 'sending' ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
