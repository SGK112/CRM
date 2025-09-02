'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hi! I'm your construction CRM assistant. I can help you with project management, client communications, scheduling, and more. What would you like to do today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'Create a new project',
        'Schedule a client meeting',
        'Check project status',
        'Generate invoice',
        'Find client contact',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // If the user intent is to add/create a new client, suppress this lightweight bot's
    // auto-reply to avoid duplicate answers alongside the advanced Copilot.
    // Regex checks for phrases like "add new client", "create client", "new client", etc.
    const clientIntentPattern = /(add|create|new)\s+client|client\s+(add|create|new)/i;
    if (clientIntentPattern.test(message)) {
      setIsTyping(false);
      return; // Do not generate a local bot response; defer to main AI assistant.
    }

    setIsTyping(true);

    // Simulate bot response
    setTimeout(
      () => {
        const botResponse = generateBotResponse(message);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000
    );
  };

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    let response = '';
    let suggestions: string[] = [];

    if (lowerMessage.includes('project') && lowerMessage.includes('create')) {
      response =
        "I'll help you create a new project! To get started, I'll need some basic information. Would you like me to open the new project form, or would you prefer to provide the details here?";
      suggestions = [
        'Open project form',
        'Provide details here',
        'Show project templates',
        'View existing projects',
      ];
    } else if (
      lowerMessage.includes('client') &&
      (lowerMessage.includes('meeting') || lowerMessage.includes('schedule'))
    ) {
      response =
        "I can help you schedule a client meeting. I'll check your calendar availability and send them a meeting invitation. Which client would you like to meet with?";
      suggestions = [
        'Show client list',
        'Check my calendar',
        'Send meeting invite',
        'View upcoming meetings',
      ];
    } else if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      response =
        'I can show you the status of your projects. You currently have 12 active projects. Would you like to see a detailed breakdown or specific project information?';
      suggestions = [
        'Show all projects',
        'Projects by status',
        'Overdue projects',
        "This week's deadlines",
      ];
    } else if (lowerMessage.includes('invoice')) {
      response =
        'I can help you generate an invoice. Would you like to create a new invoice for a completed project or milestone, or do you need to review existing invoices?';
      suggestions = [
        'Create new invoice',
        'View pending invoices',
        'Invoice templates',
        'Payment status',
      ];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('client')) {
      response =
        'I can help you find client contact information. You have 48 clients in your system. Would you like me to search for a specific client or show you the client directory?';
      suggestions = ['Search clients', 'Show all clients', 'Recent clients', 'Add new client'];
    } else if (lowerMessage.includes('calendar') || lowerMessage.includes('appointment')) {
      response =
        'I can help with your calendar and appointments. You have 3 upcoming appointments this week. Would you like to view your schedule or book a new appointment?';
      suggestions = ['View this week', 'Book appointment', 'Reschedule meeting', 'Send reminders'];
    } else if (lowerMessage.includes('document') || lowerMessage.includes('file')) {
      response =
        'I can help you manage documents and files. You can upload blueprints, contracts, permits, and other project documents. What type of document are you looking for?';
      suggestions = ['Upload blueprint', 'Find contract', 'Project documents', 'Client files'];
    } else if (lowerMessage.includes('blueprint') || lowerMessage.includes('design')) {
      response =
        'For design and blueprints, I can connect you with our integrated designer tool. You can create floor plans, upload CAD files, or collaborate with architects. What would you like to do?';
      suggestions = ['Open designer', 'Upload CAD file', 'View blueprints', 'Share designs'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      response =
        'I can help with payments and billing. You can process payments, send invoices, track expenses, and manage your financial overview. What do you need assistance with?';
      suggestions = ['Process payment', 'Send invoice', 'Track expenses', 'Financial report'];
    } else {
      response =
        "I'm here to help with your construction business! I can assist with projects, clients, scheduling, invoicing, document management, and more. What would you like to do?";
      suggestions = [
        'Manage projects',
        'Handle clients',
        'Schedule appointments',
        'Generate reports',
        'Upload documents',
      ];
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      suggestions,
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 ${isOpen ? 'hidden' : 'block'}`}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">CRM Assistant</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-500 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[280px] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-3">{formatTime(message.timestamp)}</p>

                  {/* Suggestions */}
                  {message.suggestions && message.sender === 'bot' && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block w-full text-left px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`flex-shrink-0 ${message.sender === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                      <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your business..."
                className="input flex-1"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
