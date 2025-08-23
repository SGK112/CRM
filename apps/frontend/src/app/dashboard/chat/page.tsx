'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/Layout';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  MicrophoneIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    role: 'client' | 'team' | 'ai';
    avatar?: string;
  };
  conversationId: string;
  messageType: 'text' | 'image' | 'document' | 'system';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

interface Conversation {
  _id: string;
  title: string;
  participants: {
    _id: string;
    name: string;
    role: 'client' | 'team' | 'ai';
    avatar?: string;
    lastSeen?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  status: 'active' | 'archived' | 'priority';
  projectId?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

const mockConversations: Conversation[] = [
  {
    _id: '1',
    title: 'Smith Kitchen Project',
    participants: [
      { _id: '1', name: 'John Smith', role: 'client', avatar: '/avatars/john.jpg' },
      { _id: '2', name: 'Construction Team', role: 'team' }
    ],
    lastMessage: {
      _id: 'm1',
      content: 'The kitchen renovation is progressing well. We should have the countertops installed by Friday.',
      sender: { _id: '2', name: 'Construction Team', role: 'team' },
      conversationId: '1',
      messageType: 'text',
      timestamp: '2025-08-14T15:30:00Z',
      status: 'delivered'
    },
    unreadCount: 1,
    status: 'priority',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-14T15:30:00Z'
  },
  {
    _id: '2',
    title: 'Johnson Bathroom Renovation',
    participants: [
      { _id: '3', name: 'Sarah Johnson', role: 'client', avatar: '/avatars/sarah.jpg' },
      { _id: '4', name: 'Mike Wilson', role: 'team' }
    ],
    lastMessage: {
      _id: 'm2',
      content: 'The tiles look amazing! Thank you for the update photos.',
      sender: { _id: '3', name: 'Sarah Johnson', role: 'client' },
      conversationId: '2',
      messageType: 'text',
      timestamp: '2025-08-14T12:15:00Z',
      status: 'read'
    },
    unreadCount: 0,
    status: 'active',
    createdAt: '2025-08-05T14:00:00Z',
    updatedAt: '2025-08-14T12:15:00Z'
  },
  {
    _id: '3',
    title: 'Team Chat - General',
    participants: [
      { _id: '5', name: 'Construction Team', role: 'team' },
      { _id: '6', name: 'Project Manager', role: 'team' }
    ],
    lastMessage: {
      _id: 'm3',
      content: 'Updated the project timeline for next week. All teams please review.',
      sender: { _id: '6', name: 'Project Manager', role: 'team' },
      conversationId: '3',
      messageType: 'text',
      timestamp: '2025-08-14T09:00:00Z',
      status: 'read'
    },
    unreadCount: 0,
    status: 'active',
    createdAt: '2025-08-14T09:00:00Z',
    updatedAt: '2025-08-14T09:00:00Z'
  }
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages for each conversation
  useEffect(() => {
    const initialMessages: { [key: string]: Message[] } = {
      '1': [
        {
          _id: 'm1-1',
          content: 'Hello! I wanted to check on the progress of my kitchen renovation.',
          sender: { _id: '1', name: 'John Smith', role: 'client' },
          conversationId: '1',
          messageType: 'text',
          timestamp: '2025-08-14T14:00:00Z',
          status: 'read'
        },
        {
          _id: 'm1-2',
          content: 'Hi John! The kitchen renovation is going great. We\'ve completed the cabinet installation and are now working on the countertops.',
          sender: { _id: '2', name: 'Construction Team', role: 'team' },
          conversationId: '1',
          messageType: 'text',
          timestamp: '2025-08-14T14:05:00Z',
          status: 'read'
        },
        {
          _id: 'm1-3',
          content: 'That\'s wonderful to hear! Could you send me some progress photos?',
          sender: { _id: '1', name: 'John Smith', role: 'client' },
          conversationId: '1',
          messageType: 'text',
          timestamp: '2025-08-14T14:10:00Z',
          status: 'read'
        },
        {
          _id: 'm1-4',
          content: 'Absolutely! I\'ll have our team take some photos and share them with you shortly.',
          sender: { _id: '2', name: 'Construction Team', role: 'team' },
          conversationId: '1',
          messageType: 'text',
          timestamp: '2025-08-14T14:12:00Z',
          status: 'read'
        }
      ],
      '2': [
        {
          _id: 'm2-1',
          content: 'Good morning! How is the bathroom renovation coming along?',
          sender: { _id: '3', name: 'Sarah Johnson', role: 'client' },
          conversationId: '2',
          messageType: 'text',
          timestamp: '2025-08-14T10:00:00Z',
          status: 'read'
        },
        {
          _id: 'm2-2',
          content: 'Good morning Sarah! We\'ve made excellent progress. The tile work is nearly complete.',
          sender: { _id: '4', name: 'Mike Wilson', role: 'team' },
          conversationId: '2',
          messageType: 'text',
          timestamp: '2025-08-14T10:15:00Z',
          status: 'read'
        },
        {
          _id: 'm2-3',
          content: 'The tiles look amazing! Thank you for the update photos.',
          sender: { _id: '3', name: 'Sarah Johnson', role: 'client' },
          conversationId: '2',
          messageType: 'text',
          timestamp: '2025-08-14T12:15:00Z',
          status: 'read'
        }
      ],
      '3': [
        {
          _id: 'm3-1',
          content: 'Team meeting scheduled for tomorrow at 10 AM. Please confirm attendance.',
          sender: { _id: '6', name: 'Project Manager', role: 'team' },
          conversationId: '3',
          messageType: 'text',
          timestamp: '2025-08-14T08:00:00Z',
          status: 'read'
        },
        {
          _id: 'm3-2',
          content: 'Confirmed! I\'ll be there.',
          sender: { _id: '5', name: 'Construction Team', role: 'team' },
          conversationId: '3',
          messageType: 'text',
          timestamp: '2025-08-14T08:30:00Z',
          status: 'read'
        }
      ]
    };
    setMessages(initialMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConversationData = conversations.find(c => c._id === selectedConversation);
  const conversationMessages = messages[selectedConversation] || [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const messageId = `m-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const message: Message = {
      _id: messageId,
      content: newMessage,
      sender: { _id: 'current-user', name: 'You', role: 'team' },
      conversationId: selectedConversation,
      messageType: 'text',
      timestamp: timestamp,
      status: 'sent'
    };

    // Add the message to the conversation
    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), message]
    }));

    // Update last message in conversation
    setConversations(prev => prev.map(conv => 
      conv._id === selectedConversation 
        ? { ...conv, lastMessage: message, updatedAt: timestamp }
        : conv
    ));

    setNewMessage('');

    // Simulate message being delivered
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedConversation]: prev[selectedConversation].map(msg =>
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      }));
      setIsLoading(false);
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckIcon className="h-4 w-4 text-gray-500" />;
      case 'read':
        return <CheckIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
  <div className="h-[calc(100vh-200px)] flex surface-1 rounded-lg shadow-sm border border-token overflow-hidden">
        {/* Conversations Sidebar */}
  <div className="w-1/3 border-r border-gray-200 dark:border-token flex flex-col surface-1">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-token bg-white dark:bg-[var(--surface-2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">Messages</h2>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[var(--surface-1)]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation._id)}
                className={`p-4 border-b border-gray-100 dark:border-[color-mix(in_oklab,var(--border),transparent_70%)] cursor-pointer hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] transition-colors ${
                  selectedConversation === conversation._id ? 'bg-blue-50 dark:bg-blue-600/15 border-blue-200 dark:border-blue-500/40' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-[var(--text)] truncate">
                        {conversation.title}
                      </p>
                      <div className="flex items-center space-x-1">
                        {conversation.status === 'priority' && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] truncate mt-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-[var(--text-faint)]">
                        {conversation.lastMessage && formatDate(conversation.lastMessage.timestamp)}
                      </p>
                      <div className="flex items-center space-x-1">
                        {conversation.participants.map((participant, index) => (
                          <span
                            key={participant._id}
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              participant.role === 'client'
                                ? 'bg-green-100 text-green-800'
                                : participant.role === 'ai'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {participant.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-token bg-white dark:bg-[var(--surface-2)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)]">
                        {selectedConversationData.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                        {selectedConversationData.participants.map(p => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <VideoCameraIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[var(--surface-1)]">
                {conversationMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === 'current-user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === 'current-user'
                          ? 'bg-blue-600 text-white'
                          : message.sender.role === 'ai'
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-900 dark:from-purple-600/25 dark:to-blue-600/25 dark:text-[var(--text)]'
                          : 'bg-gray-100 text-gray-900 dark:bg-[var(--surface-2)] dark:text-[var(--text)]'
                      } border border-transparent dark:border-[color-mix(in_oklab,var(--border),transparent_50%)]`}
                    >
                      {message.sender._id !== 'current-user' && (
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.sender._id === 'current-user' ? 'text-blue-100' : 'text-gray-500 dark:text-[var(--text-faint)]'
                      }`}>
                        <p className="text-xs">{formatTime(message.timestamp)}</p>
                        {message.sender._id === 'current-user' && (
                          <div className="ml-2">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg opacity-70">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                        <span className="text-sm">Sending...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-token bg-white dark:bg-[var(--surface-2)]">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <PhotoIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <DocumentIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="input"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
      <div className="flex-1 flex items-center justify-center surface-1">
              <div className="text-center">
        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 dark:text-[var(--text-faint)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-2">No conversation selected</h3>
        <p className="text-gray-600 dark:text-[var(--text-dim)]">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
