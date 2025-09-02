'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageCircle,
  Bell,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Receipt,
  FileText,
  Wrench,
  Plus,
  Archive,
  Settings,
} from 'lucide-react';

interface Notification {
  id: string;
  type:
    | 'payment'
    | 'conversation'
    | 'project_update'
    | 'calendar'
    | 'estimate'
    | 'invoice'
    | 'system'
    | 'client_action';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sourceId?: string;
  sourceName?: string;
  actionUrl?: string;
  metadata?: {
    amount?: number;
    clientName?: string;
    projectName?: string;
    paymentStatus?: string;
    estimateValue?: number;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'team' | 'vendor' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'payment' | 'estimate' | 'system';
  timestamp: Date;
  isRead: boolean;
  attachments?: {
    type: string;
    name: string;
    url: string;
  }[];
}

interface Conversation {
  id: string;
  title: string;
  participants: {
    id: string;
    name: string;
    role: 'client' | 'team' | 'vendor';
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'client_project' | 'team_internal' | 'vendor_coordination' | 'payment_discussion';
  projectId?: string;
  clientId?: string;
  priority: 'low' | 'medium' | 'high';
}

const notificationTypeIcons = {
  payment: DollarSign,
  conversation: MessageCircle,
  project_update: Wrench,
  calendar: Calendar,
  estimate: FileText,
  invoice: Receipt,
  system: Settings,
  client_action: Users,
};

const notificationTypeColors = {
  payment: 'text-green-600 bg-green-100',
  conversation: 'text-blue-600 bg-blue-100',
  project_update: 'text-orange-600 bg-orange-100',
  calendar: 'text-purple-600 bg-purple-100',
  estimate: 'text-indigo-600 bg-indigo-100',
  invoice: 'text-yellow-600 bg-yellow-100',
  system: 'text-gray-600 bg-gray-100',
  client_action: 'text-pink-600 bg-pink-100',
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
};

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'messages' | 'payments'>(
    'all'
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);

      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'payment',
          title: 'Payment Received',
          description:
            'Payment of $15,750 received from Smith Family for Kitchen Renovation project',
          timestamp: new Date(2024, 0, 15, 14, 30),
          isRead: false,
          priority: 'high',
          sourceId: 'project-1',
          sourceName: 'Smith Kitchen Renovation',
          metadata: {
            amount: 15750,
            clientName: 'Smith Family',
            projectName: 'Kitchen Renovation',
            paymentStatus: 'completed',
          },
        },
        {
          id: '2',
          type: 'conversation',
          title: 'New Message from Johnson Family',
          description: 'Question about bathroom tile selection and installation timeline',
          timestamp: new Date(2024, 0, 15, 12, 15),
          isRead: false,
          priority: 'medium',
          sourceId: 'conv-2',
          sourceName: 'Johnson Bathroom Project',
          metadata: {
            clientName: 'Johnson Family',
          },
        },
        {
          id: '3',
          type: 'estimate',
          title: 'Estimate Approved',
          description: 'Martinez Kitchen Cabinet Refresh estimate approved - $18,500',
          timestamp: new Date(2024, 0, 15, 10, 45),
          isRead: true,
          priority: 'high',
          sourceId: 'estimate-3',
          sourceName: 'Martinez Kitchen Refresh',
          metadata: {
            estimateValue: 18500,
            clientName: 'Martinez Family',
          },
        },
        {
          id: '4',
          type: 'calendar',
          title: 'Upcoming Appointment',
          description: 'Site measurement for Wilson Bathroom in 2 hours',
          timestamp: new Date(2024, 0, 15, 9, 0),
          isRead: false,
          priority: 'urgent',
          sourceId: 'appt-5',
          sourceName: 'Wilson Bathroom Measurement',
        },
      ];

      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Smith Kitchen Renovation',
          participants: [
            { id: 'client-1', name: 'John Smith', role: 'client' },
            { id: 'team-1', name: 'Construction Team', role: 'team' },
          ],
          unreadCount: 2,
          type: 'client_project',
          projectId: 'project-1',
          clientId: 'client-1',
          priority: 'high',
          lastMessage: {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'client-1',
            senderName: 'John Smith',
            senderRole: 'client',
            content: 'Can we schedule a walk-through for tomorrow morning?',
            messageType: 'text',
            timestamp: new Date(2024, 0, 15, 16, 45),
            isRead: false,
          },
        },
        {
          id: 'conv-2',
          title: 'Johnson Bathroom Project',
          participants: [
            { id: 'client-2', name: 'Sarah Johnson', role: 'client' },
            { id: 'team-2', name: 'Mike Wilson', role: 'team' },
          ],
          unreadCount: 1,
          type: 'client_project',
          projectId: 'project-2',
          clientId: 'client-2',
          priority: 'medium',
          lastMessage: {
            id: 'msg-2',
            conversationId: 'conv-2',
            senderId: 'client-2',
            senderName: 'Sarah Johnson',
            senderRole: 'client',
            content: 'I have questions about the tile selection. Can we discuss options?',
            messageType: 'text',
            timestamp: new Date(2024, 0, 15, 12, 15),
            isRead: false,
          },
        },
        {
          id: 'conv-3',
          title: 'Team Coordination - Weekly',
          participants: [
            { id: 'team-1', name: 'Construction Team', role: 'team' },
            { id: 'team-3', name: 'Project Manager', role: 'team' },
          ],
          unreadCount: 0,
          type: 'team_internal',
          priority: 'low',
          lastMessage: {
            id: 'msg-3',
            conversationId: 'conv-3',
            senderId: 'team-3',
            senderName: 'Project Manager',
            senderRole: 'team',
            content: 'Schedule updated for next week. All teams please review.',
            messageType: 'text',
            timestamp: new Date(2024, 0, 15, 9, 0),
            isRead: true,
          },
        },
      ];

      setNotifications(mockNotifications);
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesSearch =
        !searchTerm ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sourceName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [notifications, filterType, searchTerm]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const matchesSearch =
        !searchTerm ||
        conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.participants.some(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesSearch;
    });
  }, [conversations, searchTerm]);

  const stats = useMemo(() => {
    const unreadNotifications = notifications.filter(n => !n.isRead).length;
    const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const urgentItems = notifications.filter(n => n.priority === 'urgent').length;
    const totalPayments = notifications.filter(n => n.type === 'payment').length;

    return { unreadNotifications, unreadMessages, urgentItems, totalPayments };
  }, [notifications, conversations]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)));
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">
            Communications Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            All your messages, notifications, and communications in one place
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread Notifications</p>
              <p className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread Messages</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unreadMessages}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Urgent Items</p>
              <p className="text-2xl font-bold text-orange-600">{stats.urgentItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Updates</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPayments}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'all', name: 'All Communications', icon: MessageSquare },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'messages', name: 'Messages', icon: MessageCircle },
            { id: 'payments', name: 'Payments', icon: DollarSign },
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search communications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="payment">Payments</option>
              <option value="conversation">Conversations</option>
              <option value="project_update">Project Updates</option>
              <option value="calendar">Calendar</option>
              <option value="estimate">Estimates</option>
              <option value="invoice">Invoices</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Communication Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'all' && 'All Communications'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'payments' && 'Payment Communications'}
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {(activeTab === 'all' || activeTab === 'notifications') &&
                filteredNotifications.map(notification => {
                  const IconComponent = notificationTypeIcons[notification.type];
                  const colors = notificationTypeColors[notification.type];

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-l-4 ${priorityColors[notification.priority]} ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4
                                className={`font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.description}
                              </p>
                              {notification.sourceName && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {notification.sourceName}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                              )}
                            </div>
                          </div>

                          {notification.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {notification.metadata.amount && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-md">
                                  ${notification.metadata.amount.toLocaleString()}
                                </span>
                              )}
                              {notification.metadata.clientName && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                                  {notification.metadata.clientName}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {(activeTab === 'all' || activeTab === 'messages') &&
                filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      conversation.unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`font-medium ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                              {conversation.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {conversation.participants.map(p => p.name).join(', ')}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                <span className="font-medium">
                                  {conversation.lastMessage.senderName}:
                                </span>{' '}
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {conversation.lastMessage &&
                                getTimeAgo(conversation.lastMessage.timestamp)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1 ml-auto">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>

            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Start New Conversation
              </button>

              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4" />
                Schedule Call
              </button>

              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Mail className="w-4 h-4" />
                Send Email Update
              </button>

              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Archive className="w-4 h-4" />
                Archive Old Items
              </button>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Today's Notifications</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {
                    notifications.filter(
                      n => n.timestamp.toDateString() === new Date().toDateString()
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Conversations</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {conversations.filter(c => c.unreadCount > 0).length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Updates</span>
                <span className="font-medium text-green-600">
                  {notifications.filter(n => n.type === 'payment').length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Project Updates</span>
                <span className="font-medium text-blue-600">
                  {notifications.filter(n => n.type === 'project_update').length}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Smart Filters</h3>

            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                🔴 Urgent Items ({notifications.filter(n => n.priority === 'urgent').length})
              </button>

              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                💰 Payment Related (
                {notifications.filter(n => n.type === 'payment' || n.type === 'invoice').length})
              </button>

              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                👥 Client Communications (
                {
                  notifications.filter(n => n.type === 'conversation' || n.type === 'client_action')
                    .length
                }
                )
              </button>

              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                🔧 Project Updates ({notifications.filter(n => n.type === 'project_update').length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
