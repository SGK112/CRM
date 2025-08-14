'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  CommandLineIcon,
  CodeBracketIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  suggestions?: string[];
  meta?: Record<string, any>;
}

interface AIAction {
  type: 'navigate' | 'create' | 'edit' | 'delete' | 'view' | 'execute' | 'command';
  label: string;
  description: string;
  data: any;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  danger?: boolean;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: '', description: '', priority: 'medium', status: 'planning' });
  const [contextSummary, setContextSummary] = useState<{projects?: number; clients?: number}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with system + assistant messages
      setMessages([
        {
          id: 'sys-1',
          type: 'system',
          content: 'Copilot session started. Context awareness enabled. Type / for commands.',
          timestamp: new Date(),
        },
        {
          id: 'a-1',
          type: 'assistant',
          content: 'Hi! I\'m your Construct Copilot. I can navigate, create & edit entities, summarize data, and help you work faster. Try commands like /projects, /clients, /new-project, /open settings, or just ask naturally. What\'s next?',
          timestamp: new Date(),
          suggestions: [
            'Create a new project',
            'Show me projects',
            'List clients',
            'Open calendar',
            'Help'
          ]
        }
      ]);
      fetchContextSummary();
    }
  }, [isOpen, messages.length]);

  const fetchContextSummary = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;
      // Fire requests in parallel (best-effort)
      const [projectsRes, clientsRes] = await Promise.all([
        fetch('http://localhost:3001/projects', { headers: { Authorization: `Bearer ${token}` }}).catch(() => null),
        fetch('http://localhost:3001/clients', { headers: { Authorization: `Bearer ${token}` }}).catch(() => null),
      ]);
      const projectsJson = projectsRes && projectsRes.ok ? await projectsRes.json() : [];
      const clientsJson = clientsRes && clientsRes.ok ? await clientsRes.json() : [];
      setContextSummary({ projects: projectsJson.length, clients: clientsJson.length });
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // refresh summary every 60s
    const id = setInterval(fetchContextSummary, 60000);
    return () => clearInterval(id);
  }, [isOpen]);

  const parseUserIntent = (raw: string): AIMessage => {
    const input = raw.trim();
    const lowerInput = input.toLowerCase();
    let actions: AIAction[] = [];
    let responseContent = '';

    // Slash command handling (priority)
    if (input.startsWith('/')) {
      const parts = input.slice(1).split(/\s+/);
      const command = parts[0];
      const arg = parts.slice(1).join(' ');
      switch (command) {
        case 'help':
          responseContent = 'Available commands:\n\n/projects – list project overview\n/clients – list clients overview\n/new-project – open quick create project form\n/open <page> – navigate to a page (dashboard, projects, clients, calendar, documents, settings, ecommerce, rolladex)\n/summary – show current counts\n/help – show this help';
          actions = [
            { type: 'command', label: 'Create Project', description: 'Open quick project form', data: { cmd: 'new-project' }, icon: PlusIcon },
            { type: 'command', label: 'Show Summary', description: 'Projects & clients counts', data: { cmd: 'summary' }, icon: ClipboardDocumentListIcon },
          ];
          break;
        case 'projects':
          responseContent = 'Project overview ready. Select an action or open projects page.';
          actions.push(
            { type: 'navigate', label: 'Open Projects', description: 'Go to projects page', data: { path: '/dashboard/projects' }, icon: ClipboardDocumentListIcon },
            { type: 'command', label: 'New Project', description: 'Open quick create form', data: { cmd: 'new-project' }, icon: PlusIcon }
          );
          break;
        case 'clients':
          responseContent = 'Client overview ready. Select an action or open clients page.';
          actions.push(
            { type: 'navigate', label: 'Open Clients', description: 'Go to clients page', data: { path: '/dashboard/clients' }, icon: UserGroupIcon },
            { type: 'command', label: 'Add Client', description: 'Open clients page new form', data: { cmd: 'open-new-client' }, icon: PlusIcon }
          );
          break;
        case 'new-project':
          setShowCreateProject(true);
          responseContent = 'Opening quick project creation form...';
          break;
        case 'open':
          if (arg) {
            const map: Record<string, string> = {
              dashboard: '/dashboard',
              projects: '/dashboard/projects',
              clients: '/dashboard/clients',
              calendar: '/dashboard/calendar',
              documents: '/dashboard/documents',
              docs: '/dashboard/documents',
              settings: '/dashboard/settings',
              ecommerce: '/dashboard/ecommerce',
              store: '/dashboard/ecommerce',
              rolladex: '/dashboard/rolladex',
              contacts: '/dashboard/rolladex'
            };
            const target = map[arg.toLowerCase()];
            if (target) {
              actions.push({ type: 'navigate', label: `Go to ${arg}`, description: 'Navigate now', data: { path: target }, icon: ArrowTopRightOnSquareIcon });
              responseContent = `Ready to open ${arg}.`;
            } else {
              responseContent = `I don't recognize the page "${arg}". Try /open projects or /help.`;
            }
          } else {
            responseContent = 'Usage: /open <page>. Example: /open projects';
          }
          break;
        case 'summary':
          responseContent = `Current summary: ${contextSummary.projects ?? '–'} projects, ${contextSummary.clients ?? '–'} clients.`;
          actions.push({ type: 'command', label: 'Refresh Summary', description: 'Update counts', data: { cmd: 'summary' }, icon: SparklesIcon });
          break;
        default:
          responseContent = `Unknown command: /${command}. Type /help for commands.`;
      }
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: actions.length ? actions : undefined
      };
    }

  // Natural language intents
    if (lowerInput.includes('dashboard') || lowerInput.includes('home')) {
      actions.push({
        type: 'navigate',
        label: 'Go to Dashboard',
        description: 'Open the main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      });
      responseContent = 'I can take you to the dashboard where you can see an overview of all your projects and activities.';
    }
    
    else if (lowerInput.includes('project') || lowerInput.includes('projects')) {
      if (lowerInput.includes('create') || lowerInput.includes('new')) {
        actions.push({
          type: 'navigate',
          label: 'Create New Project',
          description: 'Open the new project form',
          data: { path: '/dashboard/projects/new' },
          icon: PlusIcon
        });
        responseContent = 'I can help you create a new project. This will open the project creation form where you can add details like client information, timeline, and budget.';
      } else {
        actions.push({
          type: 'navigate',
          label: 'View All Projects',
          description: 'Go to projects overview',
          data: { path: '/dashboard/projects' },
          icon: ClipboardDocumentListIcon
        });
        responseContent = 'I can show you all your projects. You\'ll be able to see their status, progress, and manage them from there.';
      }
    }
    
    else if (lowerInput.includes('client') || lowerInput.includes('clients')) {
      if (lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('add')) {
        actions.push({
          type: 'navigate',
          label: 'Add New Client',
          description: 'Open the new client form',
          data: { path: '/dashboard/clients/new' },
          icon: PlusIcon
        });
        responseContent = 'I can help you add a new client. This will open the client registration form where you can enter their contact information and project preferences.';
      } else {
        actions.push({
          type: 'navigate',
          label: 'View All Clients',
          description: 'Go to clients overview',
          data: { path: '/dashboard/clients' },
          icon: UserGroupIcon
        });
        responseContent = 'I can show you all your clients. You\'ll be able to view their information, project history, and contact details.';
      }
    }
    
    else if (lowerInput.includes('calendar') || lowerInput.includes('schedule') || lowerInput.includes('appointment')) {
      actions.push({
        type: 'navigate',
        label: 'Open Calendar',
        description: 'View and manage appointments',
        data: { path: '/dashboard/calendar' },
        icon: CalendarDaysIcon
      });
      responseContent = 'I can open your calendar where you can view, schedule, and manage appointments with clients and team members.';
    }
    
    else if (lowerInput.includes('document') || lowerInput.includes('file')) {
      actions.push({
        type: 'navigate',
        label: 'View Documents',
        description: 'Access document management',
        data: { path: '/dashboard/documents' },
        icon: DocumentTextIcon
      });
      responseContent = 'I can take you to the documents section where you can manage contracts, plans, and other project files.';
    }
    
    else if (lowerInput.includes('setting') || lowerInput.includes('config')) {
      actions.push({
        type: 'navigate',
        label: 'Open Settings',
        description: 'Manage system settings',
        data: { path: '/dashboard/settings' },
        icon: CogIcon
      });
      responseContent = 'I can open the settings page where you can configure your account, notifications, and system preferences.';
    }
    
    else if (lowerInput.includes('ecommerce') || lowerInput.includes('store') || lowerInput.includes('shop')) {
      actions.push({
        type: 'navigate',
        label: 'Open Online Store',
        description: 'Manage e-commerce integration',
        data: { path: '/dashboard/ecommerce' },
        icon: ArrowTopRightOnSquareIcon
      });
      responseContent = 'I can open your online store management where you can handle product listings, orders, and integration settings.';
    }
    
    else if (lowerInput.includes('business card') || lowerInput.includes('rolladex') || lowerInput.includes('contacts')) {
      actions.push({
        type: 'navigate',
        label: 'Open Business Cards',
        description: 'View contact rolladex',
        data: { path: '/dashboard/rolladex' },
        icon: UserGroupIcon
      });
      responseContent = 'I can show you your business card rolladex where you can manage professional contacts and networking connections.';
    }
    
    // Demo and trial related
    else if (lowerInput.includes('demo') || lowerInput.includes('trial') || lowerInput.includes('test')) {
      actions.push({
        type: 'navigate',
        label: 'View Demo',
        description: 'Interactive CRM demo',
        data: { path: '/demo' },
        icon: EyeIcon
      });
      actions.push({
        type: 'navigate',
        label: 'Start Free Trial',
        description: 'Begin your free trial',
        data: { path: '/trial' },
        icon: SparklesIcon
      });
      responseContent = 'I can show you our interactive demo or help you start a free trial to explore all features.';
    }

    // Form creation intents
    else if (lowerInput.includes('form') || lowerInput.includes('quote') || lowerInput.includes('estimate')) {
      responseContent = 'I can help you create various forms for your business. You can create project quotes, client intake forms, or custom forms for your workflow.';
      actions.push({
        type: 'create',
        label: 'Create Quote Form',
        description: 'Generate a project quote',
        data: { type: 'quote' },
        icon: DocumentTextIcon
      });
    }

    // General help
    else {
      responseContent = `I understand you're asking about "${input}". I can help you with:
      
• Navigate to different sections of the CRM
• Create new projects, clients, or appointments
• Manage documents and files
• Configure settings and preferences
• View analytics and reports

What specific task would you like me to help you with?`;
      
      actions.push({
        type: 'navigate',
        label: 'View Dashboard',
        description: 'Go to main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      });
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      actions: actions.length > 0 ? actions : undefined,
      suggestions: actions.length === 0 ? [
        'Show me projects',
        'Create a new client',
        'Open calendar',
        'View settings'
      ] : undefined
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Quick response (simulate minor delay)
    setTimeout(() => {
      const aiResponse = parseUserIntent(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 400);
  };

  const handleAction = (action: AIAction) => {
    switch (action.type) {
      case 'navigate':
        router.push(action.data.path);
        onClose(); // Close the assistant after navigation
        break;
      case 'command':
        if (action.data?.cmd === 'new-project') {
          setShowCreateProject(true);
        } else if (action.data?.cmd === 'summary') {
          fetchContextSummary();
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Updated summary: ${contextSummary.projects ?? '–'} projects, ${contextSummary.clients ?? '–'} clients.`,
            timestamp: new Date()
          }]);
        } else if (action.data?.cmd === 'open-new-client') {
          router.push('/dashboard/clients');
          onClose();
        }
        break;
      case 'create':
        // Handle creation actions
        console.log('Create action:', action);
        break;
      case 'edit':
        // Handle edit actions
        console.log('Edit action:', action);
        break;
      default:
        console.log('Action:', action);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const submitQuickProject = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'You are not authenticated. Please log in again.', timestamp: new Date() }]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3001/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: projectDraft.title,
            description: projectDraft.description,
            priority: projectDraft.priority,
            status: projectDraft.status,
            tags: ['quick-copilot'],
            assignedUsers: []
        })
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: `Project "${json.title}" created successfully.`, timestamp: new Date(), actions: [ { type: 'navigate', label: 'Open Project', description: 'View the project detail page', data: { path: `/dashboard/projects/${json._id}` }, icon: EyeIcon } ] }]);
        setShowCreateProject(false);
        setProjectDraft({ title: '', description: '', priority: 'medium', status: 'planning' });
        fetchContextSummary();
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'Failed to create project. Check required fields.', timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'Network error creating project.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full sm:w-[480px] h-[80vh] sm:h-full sm:max-h-screen bg-gradient-to-br from-white via-white to-indigo-50 shadow-2xl sm:rounded-none rounded-t-2xl flex flex-col pointer-events-auto border-l border-t sm:border-t-0 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-inner">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Construct Copilot</h2>
              <p className="text-[11px] text-gray-500">/ for commands • {contextSummary.projects ?? '–'} proj • {contextSummary.clients ?? '–'} clients</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setShowCommands(!showCommands)} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">/{showCommands ? 'hide' : 'cmds'}</button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Optional command palette */}
        {showCommands && (
          <div className="border-b border-gray-200 bg-white/60 backdrop-blur px-4 py-2 text-xs text-gray-600 grid grid-cols-2 gap-2">
            {['/projects','/clients','/new-project','/summary','/open dashboard','/help'].map(cmd => (
              <button key={cmd} onClick={() => { setInput(cmd); setShowCommands(false); }} className="text-left px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition text-[11px] font-medium">{cmd}</button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm border transition-all ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600/30'
                    : message.type === 'system'
                      ? 'bg-gray-50 text-gray-600 border-gray-200 text-xs'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`whitespace-pre-wrap leading-relaxed ${message.type==='system' ? 'font-mono' : ''}`}>{message.content}</p>
                <div className="flex items-center justify-end space-x-2 mt-2 opacity-60 group-hover:opacity-90 transition-opacity">
                  <p className={`text-[10px] ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>{formatTime(message.timestamp)}</p>
                </div>

                {/* Actions */}
                {message.actions && (
                  <div className="mt-3 flex flex-col gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleAction(action)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left border text-xs font-medium transition group/action ${
                          message.type === 'user'
                            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                        } ${action.danger ? 'hover:bg-red-50 text-red-600 border-red-200' : ''}`}
                      >
                        <action.icon className={`h-4 w-4 ${message.type==='user' ? 'text-white' : 'text-gray-500 group-hover/action:text-gray-700'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{action.label}</p>
                          <p className="text-[10px] opacity-70 truncate">{action.description}</p>
                        </div>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0 opacity-40" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(suggestion)}
                        className={`text-[11px] px-2 py-1 rounded border transition ${
                          message.type === 'user'
                            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-sm text-gray-600 flex items-center gap-3">
                <div className="relative h-4 w-4">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white/70 backdrop-blur px-4 py-3 space-y-2">
          {showCreateProject && (
            <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-purple-700">Quick Project</p>
                <button onClick={() => setShowCreateProject(false)} className="text-[11px] text-purple-600 hover:underline">close</button>
              </div>
              <input
                placeholder="Title"
                value={projectDraft.title}
                onChange={e => setProjectDraft({ ...projectDraft, title: e.target.value })}
                className="w-full px-2 py-1 rounded border border-purple-200 focus:ring-2 focus:ring-purple-400 text-xs bg-white"
              />
              <textarea
                placeholder="Description"
                value={projectDraft.description}
                onChange={e => setProjectDraft({ ...projectDraft, description: e.target.value })}
                rows={2}
                className="w-full px-2 py-1 rounded border border-purple-200 focus:ring-2 focus:ring-purple-400 text-xs resize-none bg-white"
              />
              <div className="flex gap-2">
                <select
                  value={projectDraft.priority}
                  onChange={e => setProjectDraft({ ...projectDraft, priority: e.target.value })}
                  className="flex-1 px-2 py-1 rounded border border-purple-200 text-xs bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={projectDraft.status}
                  onChange={e => setProjectDraft({ ...projectDraft, status: e.target.value })}
                  className="flex-1 px-2 py-1 rounded border border-purple-200 text-xs bg-white"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={submitQuickProject}
                disabled={!projectDraft.title || isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" /> Create
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.startsWith('/')) setShowCommands(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  } else if (e.key === '/' && input === '') {
                    setShowCommands(true);
                  }
                }}
                placeholder="Ask or type / for commands..."
                className="w-full pr-10 pl-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Enter</span>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500">Copilot can navigate, create entities, and summarize your workspace.</div>
        </div>
      </div>
    </div>
  );
}
