'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/useSearch';
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
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  suggestions?: string[];
  meta?: Record<string, unknown>; // tightened from any
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
  const MEMORY_KEY = 'copilot_conversation_v1';
  const PAGE_HISTORY_KEY = 'copilot_page_history_v1';
  const MAX_MEMORY_MESSAGES = 200;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: '', description: '', priority: 'medium', status: 'planning' });
  const [contextSummary, setContextSummary] = useState<{projects?: number; clients?: number}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const baseSuggestions = ['Show me projects','Create a new client','Open calendar','View settings'];
  const [showTools, setShowTools] = useState(true);
  const searchHook = useSearch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load memory on open
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (messages.length === 0) {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (raw) {
          const parsed: AIMessage[] = JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          setMessages(parsed);
        } else {
          const initial: AIMessage[] = [
            { id: 'sys-1', type: 'system', content: 'Copilot session started. Context awareness enabled. Type / for commands.', timestamp: new Date() },
            { id: 'a-1', type: 'assistant', content: 'Hi! I\'m your Construct Copilot. I maintain context of recent chats and pages you visit. Ask naturally or try /recent, /projects, /clients, /new-project, /summary or /help. What\'s next?', timestamp: new Date(), suggestions: [ 'Create a new project','Show me projects','List clients','Open calendar','Help' ]}
          ];
          setMessages(initial);
        }
        fetchContextSummary();
      }
    } catch (err) {
      // ignore parse errors
      void err;
    }
  }, [isOpen, messages.length]);

  // Persist memory when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const trimmed = messages.slice(-MAX_MEMORY_MESSAGES);
      localStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed));
    } catch (err) {
      // ignore persistence errors
      void err;
    }
  }, [messages]);

  const fetchContextSummary = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;
      const authHeaders = { Authorization: `Bearer ${token}` };
      const [projectsRes, clientsRes] = await Promise.all([
        fetch(`${API_BASE}/projects`, { headers: authHeaders }).catch(() => null),
        fetch(`${API_BASE}/clients`, { headers: authHeaders }).catch(() => null),
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

    // Quick search detection: if user prefixes with ? or the phrase 'search '
    if (/^(\?|search\s)/i.test(input)) {
      const q = input.replace(/^\?\s*/, '').replace(/^search\s+/i,'').trim();
      if (q.length) {
        searchHook.search(q);
        const pending: AIMessage = { id: Date.now().toString(), type: 'assistant', content: `Searching for "${q}" ...`, timestamp: new Date() };
        return pending;
      }
    }

    // Slash command handling (priority)
    if (input.startsWith('/')) {
      const parts = input.slice(1).split(/\s+/);
      const command = parts[0];
      const arg = parts.slice(1).join(' ');
      switch (command) {
        case 'recent': {
          // Pull recent pages from localStorage
          let pages: { path: string; lastVisited: number; count: number }[] = [];
          try { pages = JSON.parse(localStorage.getItem(PAGE_HISTORY_KEY) || '[]'); } catch (err) { void err; }
          if (pages.length === 0) {
            responseContent = 'No recent page history yet. Navigate around the dashboard and I\'ll remember.';
          } else {
            const top = pages.slice(0,6).map(p => `${p.path} (${p.count}×)`).join('\n');
            responseContent = `Recent pages:\n${top}`;
            actions = pages.slice(0,4).map(p => ({ type: 'navigate', label: p.path.replace('/dashboard/','') || 'dashboard', description: 'Open page', data: { path: p.path }, icon: ArrowTopRightOnSquareIcon }));
          }
          break; }
        case 'reset': {
          localStorage.removeItem(MEMORY_KEY);
          responseContent = 'Conversation memory cleared. I\'ll still remember pages you visit. Type /help to start fresh.';
          break; }
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
          responseContent = `Unknown command: /${command}. Try /help, /recent, /reset.`;
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

    // Provide light context injection referencing last 3 user messages
    const recentUser = messages.filter(m => m.type==='user').slice(-3).map(m=>m.content);
    if (recentUser.length && responseContent && !responseContent.includes('I can')) {
      responseContent += `\n\n(Context from earlier: ${recentUser.join(' | ')})`;
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

    // Quick intent parse first for commands/search routing
    const immediateIntent = parseUserIntent(input);
    setMessages(prev => [...prev, immediateIntent]);

    // If search pattern, poll results then stop (skip LLM)
    if (/^(\?|search\s)/i.test(input)) {
      const checkInterval = setInterval(() => {
        if (!searchHook.isLoading) {
          clearInterval(checkInterval);
          if (searchHook.results.length) {
            const resultMsg: AIMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `Found ${searchHook.results.length} result(s):\n` + searchHook.results.slice(0,6).map(r=>`• [${r.type}] ${r.title}`).join('\n'),
              timestamp: new Date(),
              actions: searchHook.results.slice(0,6).map(r=>({ type: 'navigate', label: r.title, description: r.description, data: { path: r.url }, icon: ArrowTopRightOnSquareIcon }))
            };
            setMessages(prev => [...prev, resultMsg]);
          } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'No results found. Try refining your search terms.', timestamp: new Date() }]);
          }
          setIsLoading(false);
        }
      }, 150);
      return;
    }

    // If command (starts with /), we already handled; stop loading
    if (input.trim().startsWith('/')) {
      setIsLoading(false);
      return;
    }

    // Fire backend AI call for richer response (Gemini/back-end) in parallel after brief delay to show immediacy of intent routing
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const baseUrl = API_BASE;
      const payload = {
        messages: messages.concat(userMessage).map(m => ({
          role: m.type === 'system' ? 'system' : m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        })).slice(-24) // limit context
      };
      const resp = await fetch(`${baseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: data.reply, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'AI service unavailable (HTTP '+resp.status+').', timestamp: new Date() }]);
      }
    } catch (e:any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: 'AI request failed. Fallback response provided earlier.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
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
      const res = await fetch(`${API_BASE}/projects`, {
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full sm:w-[520px] h-[80vh] sm:h-full sm:max-h-screen surface-1 shadow-2xl sm:rounded-none rounded-t-2xl flex flex-col pointer-events-auto border-l border-t sm:border-t-0 border-token overflow-hidden bg-[var(--surface-1)] text-[var(--text)]">
        {/* Header */}
  <div className={`flex items-center justify-between px-4 py-3 border-b border-token bg-[var(--surface-1)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--surface-1)]/70 sticky top-0 z-10 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>        
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-inner">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Construct Copilot</h2>
              <div className="flex flex-wrap gap-1 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-600/25 text-purple-300 border border-purple-500/30">/ for commands</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-600/25 text-blue-300 border border-blue-500/30">{contextSummary.projects ?? '–'} projects</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-600/25 text-green-300 border border-green-500/30">{contextSummary.clients ?? '–'} clients</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setShowCommands(!showCommands)} className="px-2 py-1 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface-2)] transition-colors" title="Toggle command palette">/{showCommands ? 'hide' : 'cmds'}</button>
            <span className="hidden sm:inline-flex px-2 py-1 text-[10px] rounded-md bg-[var(--surface-2)] text-[var(--text-dim)] border border-[var(--border)]">⌘K</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <XMarkIcon className="h-5 w-5 text-[var(--text-dim)]" />
            </button>
          </div>
        </div>

        {/* Optional command palette */}
        {showCommands && (
          <div className="border-b border-token bg-[var(--surface-1)]/95 backdrop-blur px-4 py-2 text-xs text-[var(--text-dim)] grid grid-cols-2 gap-2">
            {['/projects','/clients','/new-project','/summary','/open dashboard','/help'].map(cmd => (
              <button key={cmd} onClick={() => { setInput(cmd); setShowCommands(false); }} className="text-left px-2 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] transition text-[11px] font-medium">{cmd}</button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[var(--surface-1)]" onScroll={(e)=> setScrolled((e.target as HTMLDivElement).scrollTop > 8)}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm border transition-all ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600/40'
                    : message.type === 'system'
                      ? 'bg-[var(--surface-2)] text-[var(--text-dim)] border-[var(--border)] text-xs'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)] hover:border-[var(--text-dim)]/30'
                }`}
              >
                <p className={`whitespace-pre-wrap leading-relaxed ${message.type==='system' ? 'font-mono' : ''}`}>{message.content}</p>
                <div className="flex items-center justify-end space-x-2 mt-2 opacity-60 group-hover:opacity-90 transition-opacity">
                  <p className={`text-[10px] ${message.type === 'user' ? 'text-blue-100' : 'text-[var(--text-dim)]'}`}>{formatTime(message.timestamp)}</p>
                </div>

                {/* Actions */}
                {message.actions && (
                  <div className="mt-3 flex flex-col gap-2">
                    {message.actions.map((action, index) => {
                      const IconComp = (action.icon && typeof action.icon === 'function') ? action.icon : SparklesIcon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleAction(action)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left border text-xs font-medium transition group/action ${
                              message.type === 'user'
                                ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                                : 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border-[var(--border)] text-[var(--text)]'
                            } ${action.danger ? 'hover:bg-red-600/20 text-red-400 border-red-600/40' : ''}`}
                        >
                          <IconComp className={`h-4 w-4 ${message.type==='user' ? 'text-white' : 'text-[var(--text-dim)] group-hover/action:text-[var(--text)]'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{action.label}</p>
                            <p className="text-[10px] opacity-70 truncate">{action.description}</p>
                          </div>
                          <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0 opacity-40" />
                        </button>
                      );
                    })}
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
                            : 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border-[var(--border)] text-[var(--text)]'
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
              <div className="bg-white dark:bg-[var(--surface-2)] border border-gray-200 dark:border-token rounded-xl px-4 py-3 shadow-sm text-sm text-gray-600 dark:text-[var(--text-dim)] flex items-center gap-3">
                <div className="relative h-4 w-4">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

    {/* Input / Footer */}
  <div className="border-t border-token bg-[var(--surface-2)] px-4 pt-2 pb-3 space-y-2 sticky bottom-0 z-10 shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.4)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={()=> setShowCommands(s=>!s)}
                aria-label="Toggle commands"
                className="h-7 px-2 inline-flex items-center gap-1 rounded-md border border-[var(--border)] text-[11px] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition"
              >/{showCommands ? 'hide' : 'cmds'}</button>
              <button
                onClick={()=> { localStorage.removeItem(MEMORY_KEY); setMessages([]); setShowCreateProject(false); }}
                aria-label="Reset conversation"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var,--text-dim)] hover:text-red-400 hover:border-red-500/50 hover:bg-red-600/10 transition"
                title="Reset conversation"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <button
                onClick={()=> fetchContextSummary()}
                aria-label="Refresh summary"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-600/10 transition"
                title="Refresh counts"
              >
                <SparklesIcon className="h-4 w-4" />
              </button>
              <button
                onClick={()=> setShowTools(t=>!t)}
                aria-label="Toggle helper row"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition"
                title="Toggle helpers"
              >
                {showTools ? <XMarkIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)]">
              <span>{input.length} chars</span>
              <span>{Math.ceil(input.trim().split(/\s+/).filter(Boolean).length * 1.3)} tokens est.</span>
              {isLoading && <span className="flex items-center gap-1"><span className="h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> working</span>}
            </div>
          </div>
          {showCreateProject && (
            <div className="p-3 border border-purple-200 dark:border-purple-600/40 rounded-lg bg-purple-50/70 dark:bg-purple-600/15 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-purple-700">Quick Project</p>
                <button onClick={() => setShowCreateProject(false)} className="text-[11px] text-purple-600 hover:underline">close</button>
              </div>
              <input
                placeholder="Title"
                value={projectDraft.title}
                onChange={e => setProjectDraft({ ...projectDraft, title: e.target.value })}
                className="w-full px-2 py-1 rounded border border-purple-200 dark:border-purple-600/40 focus:ring-2 focus:ring-purple-400 text-xs bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)]"
              />
              <textarea
                placeholder="Description"
                value={projectDraft.description}
                onChange={e => setProjectDraft({ ...projectDraft, description: e.target.value })}
                rows={2}
                className="w-full px-2 py-1 rounded border border-purple-200 dark:border-purple-600/40 focus:ring-2 focus:ring-purple-400 text-xs resize-none bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)]"
              />
              <div className="flex gap-2">
                <select
                  value={projectDraft.priority}
                  onChange={e => setProjectDraft({ ...projectDraft, priority: e.target.value })}
                  className="flex-1 px-2 py-1 rounded border border-purple-200 dark:border-purple-600/40 text-xs bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={projectDraft.status}
                  onChange={e => setProjectDraft({ ...projectDraft, status: e.target.value })}
                  className="flex-1 px-2 py-1 rounded border border-purple-200 dark:border-purple-600/40 text-xs bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)]"
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
          {showTools && !showCreateProject && !input && (
            <div className="flex flex-wrap gap-2 -mt-0.5">
              {baseSuggestions.map(s => (
                <button key={s} onClick={()=> setInput(s)} className="text-[11px] px-2 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)] transition">{s}</button>
              ))}
            </div>
          )}
          <div className="mt-1 group">
            <div className="flex rounded-xl border border-gray-700/70 bg-[#0f0f10] focus-within:border-purple-500/70 transition shadow-sm">
              <div className="flex-1 relative px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (e.target.value.startsWith('/')) setShowCommands(false);
                    const el = textareaRef.current; if (el){ el.style.height='auto'; el.style.height = Math.min(el.scrollHeight,160)+'px'; }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      handleSend();
                    } else if (e.key === '/' && input === '') {
                      setShowCommands(true);
                    }
                  }}
                  placeholder="Ask or type / for commands..."
                  className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed min-h-[42px] max-h-[160px] pr-2 text-gray-200 placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-600 select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>/</span><span>Enter</span>
                </div>
              </div>
              <div className="flex items-stretch">
                <div className="w-px bg-gray-800 my-2" />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="m-1 ml-0 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium flex items-center gap-1 shadow-sm hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
            {showTools && (
              <div className="flex justify-between mt-1 px-1">
                <div className="flex gap-2">
                  <span className="text-[10px] text-gray-500">Ctrl/⌘ + K toggle panel</span>
                  <span className="text-[10px] text-gray-500">/ for commands</span>
                </div>
                <span className="text-[10px] text-gray-600">Enter = send • Shift+Enter = newline</span>
              </div>
            )}
          </div>
  <div className="text-[10px] text-center text-[var(--text-dim)] pt-0.5">Copilot can navigate, create entities, and summarize your workspace.</div>
        </div>
      </div>
    </div>
  );
}
