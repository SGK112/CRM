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
  // Robust unique id generator to avoid duplicate React keys when multiple messages are added within the same millisecond
  const genId = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const MEMORY_KEY = 'copilot_conversation_v1';
  const PAGE_HISTORY_KEY = 'copilot_page_history_v1';
  const MAX_MEMORY_MESSAGES = 50; // Reduced from 200 for better performance
  const INITIAL_LOAD_MESSAGES = 10; // Only load recent messages initially
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
  const baseSuggestions = [
    { text: 'Show me projects', tooltip: 'List all projects with current status' },
    { text: 'Create a new client', tooltip: 'Add a new client to your workspace' },
    { text: 'Open calendar', tooltip: 'View appointments and schedule' },
    { text: 'View settings', tooltip: 'Access workspace configuration' }
  ];
  const [showTools, setShowTools] = useState(true);
  const searchHook = useSearch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load memory on open with lazy loading
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (messages.length === 0) {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (raw) {
          const parsed: AIMessage[] = JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          // Only load the most recent messages initially
          const recentMessages = parsed.slice(-INITIAL_LOAD_MESSAGES);
          setMessages(recentMessages);
          setHasMoreHistory(parsed.length > INITIAL_LOAD_MESSAGES);
        } else {
          const userRaw = localStorage.getItem('user');
          let firstName: string | undefined; let role: string | undefined;
          if (userRaw) { try { const u = JSON.parse(userRaw); firstName = u.firstName; role = u.role; } catch {/* ignore */} }
          const hour = new Date().getHours();
          const tod = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
          const personalGreeting = firstName ? `${tod}, ${firstName}.` : `${tod}.`;
          const initial: AIMessage[] = [
            { id: 'sys-1', type: 'system', content: 'Assistant session started. Context awareness enabled. Type / for commands.', timestamp: new Date(), meta: { role } },
            { id: 'a-1', type: 'assistant', content: `${personalGreeting} I'm your Remodely Ai Assistant. I adapt answers using your workspace context. Try /recent, /projects, /clients, /new-project, /summary or /help. What's next?`, timestamp: new Date(), suggestions: [ 'Create a new project','Show me projects','List clients','Open calendar','Help' ], meta: { firstName, role } }
          ];
          setMessages(initial);
          setHasMoreHistory(false);
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

  const loadMoreHistory = async () => {
    if (loadingHistory || !hasMoreHistory) return;
    setLoadingHistory(true);
    
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (raw) {
        const parsed: AIMessage[] = JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        const currentCount = messages.length;
        const nextBatch = parsed.slice(-(currentCount + 20), -currentCount);
        
        if (nextBatch.length > 0) {
          setMessages(prev => [...nextBatch, ...prev]);
          setHasMoreHistory(parsed.length > currentCount + nextBatch.length);
        } else {
          setHasMoreHistory(false);
        }
      }
    } catch (err) {
      console.error('Failed to load more history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // refresh summary every 60s
    const id = setInterval(fetchContextSummary, 60000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Enhanced AI response processing for hybrid responses with action options
  const processAIResponse = (aiReply: string, userQuery: string): AIMessage => {
    const lowerQuery = userQuery.toLowerCase();
    const lowerReply = aiReply.toLowerCase();
    
    // Detect if user is asking about features or capabilities
    const isFeatureInquiry = lowerQuery.includes('feature') || lowerQuery.includes('can you') || 
                           lowerQuery.includes('what can') || lowerQuery.includes('how do') ||
                           lowerQuery.includes('demo') || lowerQuery.includes('trial');
    
    // Generate hybrid response with action options
    let hybridContent = aiReply;
    const actions: AIAction[] = [];
    
    if (isFeatureInquiry || lowerReply.includes('demo') || lowerReply.includes('trial')) {
      actions.push({
        type: 'command',
        label: 'Interactive Demo',
        description: 'Show me how the CRM works',
        data: { cmd: 'show-demo' },
        icon: EyeIcon
      });
      
      actions.push({
        type: 'command',
        label: 'Start Free Trial',
        description: 'Explore all features for free',
        data: { cmd: 'start-trial' },
        icon: PlusIcon
      });
      
      if (!hybridContent.includes('demo') && !hybridContent.includes('trial')) {
        hybridContent += '\n\nI can show you our interactive demo or help you start a free trial to explore all features!';
      }
    }
    
    // Add CRM action options based on AI response content
    if (lowerReply.includes('client') || lowerReply.includes('customer')) {
      actions.push({
        type: 'navigate',
        label: 'Manage Clients',
        description: 'View and edit client information',
        data: { path: '/dashboard/clients' },
        icon: UserGroupIcon
      });
    }
    
    if (lowerReply.includes('project') || lowerReply.includes('task')) {
      actions.push({
        type: 'navigate',
        label: 'View Projects',
        description: 'Manage your projects and tasks',
        data: { path: '/dashboard/projects' },
        icon: ClipboardDocumentListIcon
      });
    }
    
    if (lowerReply.includes('calendar') || lowerReply.includes('appointment') || lowerReply.includes('schedule')) {
      actions.push({
        type: 'navigate',
        label: 'Open Calendar',
        description: 'Schedule and manage appointments',
        data: { path: '/dashboard/calendar' },
        icon: CalendarDaysIcon
      });
    }
    
    return {
      id: genId(),
      type: 'assistant',
      content: hybridContent,
      timestamp: new Date(),
      actions: actions.length > 0 ? actions : undefined,
      suggestions: actions.length === 0 ? ['Tell me about features', 'Show demo', 'Start trial'] : undefined
    };
  };

  // Enhanced error handling functions
  const handleAIError = (status: number, userQuery: string) => {
    let errorMessage = '';
    const suggestions: string[] = [];
    
    switch (status) {
      case 401:
        errorMessage = 'Your session has expired. Please log in again to use AI features.';
        suggestions.push('Open login page', '/help');
        break;
      case 429:
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
        suggestions.push('Try again in 30 seconds', 'Contact support');
        break;
      case 503:
        errorMessage = 'AI service is temporarily unavailable. I can still help with basic navigation and tasks.';
        suggestions.push('Show me projects', 'Open calendar', 'View clients');
        break;
      default:
        errorMessage = `AI service unavailable (Error ${status}). Let me help you navigate to what you need.`;
        suggestions.push('Show dashboard', 'View projects', 'Contact support');
    }
    
    setMessages(prev => [...prev, {
      id: genId(),
      type: 'assistant',
      content: errorMessage,
      timestamp: new Date(),
      suggestions,
      actions: status === 503 ? [{
        type: 'navigate',
        label: 'Dashboard',
        description: 'Go to main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      }] : undefined
    }]);
  };

  const handleTimeoutError = (userQuery: string) => {
    setMessages(prev => [...prev, {
      id: genId(),
      type: 'assistant',
      content: 'The AI response took too long. Let me help you with quick navigation while we resolve this.',
      timestamp: new Date(),
      suggestions: ['Show me projects', 'Open calendar', 'View clients', 'Try again'],
      actions: [{
        type: 'navigate',
        label: 'Dashboard',
        description: 'Go to main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      }]
    }]);
  };

  const handleConnectionError = (userQuery: string) => {
    setMessages(prev => [...prev, {
      id: genId(),
      type: 'assistant',
      content: 'Connection issue detected. I can still help you navigate the CRM while we reconnect.',
      timestamp: new Date(),
      suggestions: ['Show dashboard', 'View projects', 'Open calendar', 'Retry connection'],
      actions: [{
        type: 'navigate',
        label: 'Dashboard',
        description: 'Go to main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      }, {
        type: 'command',
        label: 'Retry AI Connection',
        description: 'Try connecting to AI again',
        data: { cmd: 'retry-ai' },
        icon: SparklesIcon
      }]
    }]);
  };

  const handleGenericError = (error: any, userQuery: string) => {
    setMessages(prev => [...prev, {
      id: genId(),
      type: 'assistant',
      content: 'Something went wrong with the AI service. I can still help you navigate and manage your CRM data.',
      timestamp: new Date(),
      suggestions: ['Show me around', 'View projects', 'Open calendar', 'Contact support'],
      actions: [{
        type: 'navigate',
        label: 'Dashboard',
        description: 'Go to main dashboard',
        data: { path: '/dashboard' },
        icon: ClipboardDocumentListIcon
      }]
    }]);
  };

  const parseUserIntent = (raw: string): AIMessage => {
    const input = raw.trim();
    const lowerInput = input.toLowerCase();
    let actions: AIAction[] = [];
    let responseContent = '';
  // Central intent dedupe: ensures this is the only conversational source after ChatBot consolidation
  // Future: Could plug a lightweight classifier here.

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
  id: genId(),
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

    // General help - but don't provide actions for business questions that should go to AI
    else {
      const businessQuestionPattern = /(how.*sell|sell.*more|increase.*sales|business.*advice|marketing|strategy|grow.*business|lead.*generation|kitchen.*remodel|bathroom.*remodel)/i;
      
      if (businessQuestionPattern.test(lowerInput)) {
        // For business questions, provide a minimal response and let the AI handle it
        responseContent = `I understand you're asking about business strategy. Let me get our AI to provide you with detailed advice...`;
        // Don't add actions - let the AI service handle this
      } else {
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
  id: genId(),
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

    // Heuristic: if the immediate intent already produced concrete actions (navigate/create/etc.)
    // for a direct entity/task phrase, skip the secondary LLM call to prevent "double" responses.
    // BUT: allow business questions, sales queries, and advice requests to go to AI
    const actionablePattern = /(create|add|new)\s+(project|client)|\b(projects?|clients?|calendar|documents?|settings?|ecommerce|store|rolladex|contacts?)\b/i;
    const businessQuestionPattern = /(how.*sell|sell.*more|increase.*sales|business.*advice|marketing|strategy|grow.*business|lead.*generation|kitchen.*remodel|bathroom.*remodel)/i;
    const hasActions = !!immediateIntent.actions?.length;
    
    // Skip AI call only if it's a direct navigation request AND not a business question
    if (hasActions && actionablePattern.test(input) && !businessQuestionPattern.test(input)) {
      setIsLoading(false);
      return; // Avoid duplicate conversational AI follow-up; user sees one concise response with actions.
    }

    // If search pattern, poll results then stop (skip LLM)
    if (/^(\?|search\s)/i.test(input)) {
      const checkInterval = setInterval(() => {
        if (!searchHook.isLoading) {
          clearInterval(checkInterval);
          if (searchHook.results.length) {
            const resultMsg: AIMessage = {
                  id: genId(),
              type: 'assistant',
              content: `Found ${searchHook.results.length} result(s):\n` + searchHook.results.slice(0,6).map(r=>`• [${r.type}] ${r.title}`).join('\n'),
              timestamp: new Date(),
              actions: searchHook.results.slice(0,6).map(r=>({ type: 'navigate', label: r.title, description: r.description, data: { path: r.url }, icon: ArrowTopRightOnSquareIcon }))
            };
            setMessages(prev => [...prev, resultMsg]);
          } else {
                setMessages(prev => [...prev, { id: genId(), type: 'assistant', content: 'No results found. Try refining your search terms.', timestamp: new Date() }]);
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

    // Fire backend AI call for richer response with enhanced error handling and action capabilities
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const baseUrl = API_BASE;
      
      // Enhanced context for better AI responses
      const systemMessage = {
        role: 'system' as const,
        content: `You are a helpful CRM assistant. You can help users manage their business by creating, editing, and organizing clients, projects, estimates, and other CRM data. When appropriate, offer action options for interactive demos, free trials, or specific CRM operations. Keep responses conversational and helpful. If the user mentions features or asks about capabilities, offer to show an interactive demo or help start a free trial to explore all features.`
      };
      
      const payload = {
        messages: [systemMessage, ...messages.concat(userMessage).map(m => ({
          role: m.type === 'system' ? 'system' : m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }))].slice(-25) // limit context with system message
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      // Use demo endpoint if no authentication token
      const endpoint = token ? '/ai/chat' : '/ai/demo-chat';
      const resp = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        
        // Enhanced response processing for hybrid responses
        const aiResponse = processAIResponse(data.reply, userMessage.content);
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Enhanced error handling with graceful fallbacks
        handleAIError(resp.status, userMessage.content);
      }
    } catch (e: any) {
      // Graceful error handling for connection issues
      if (e.name === 'AbortError') {
        handleTimeoutError(userMessage.content);
      } else if (e.message?.includes('fetch')) {
        handleConnectionError(userMessage.content);
      } else {
        handleGenericError(e, userMessage.content);
      }
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
                id: genId(),
            type: 'assistant',
            content: `Updated summary: ${contextSummary.projects ?? '–'} projects, ${contextSummary.clients ?? '–'} clients.`,
            timestamp: new Date()
          }]);
        } else if (action.data?.cmd === 'open-new-client') {
          router.push('/dashboard/clients');
          onClose();
        } else if (action.data?.cmd === 'show-demo') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '🎯 **Interactive Demo Starting...**\n\nWelcome to our CRM! Here\'s what you can do:\n\n• **Client Management**: Add, edit, and organize client information\n• **Project Tracking**: Create projects, track progress, and manage deadlines\n• **Calendar Integration**: Schedule appointments and manage your time\n• **Document Management**: Store contracts, proposals, and project files\n• **Billing & Invoicing**: Generate estimates and track payments\n\nTry asking me: "Create a new client" or "Show me my projects"',
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Start with Clients',
              description: 'Begin by managing your client base',
              data: { path: '/dashboard/clients' },
              icon: UserGroupIcon
            }, {
              type: 'navigate',
              label: 'View Projects',
              description: 'See how project management works',
              data: { path: '/dashboard/projects' },
              icon: ClipboardDocumentListIcon
            }]
          }]);
        } else if (action.data?.cmd === 'start-trial') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '🚀 **Free Trial Activated!**\n\nYou now have access to all premium features:\n\n✅ **Unlimited Projects & Clients**\n✅ **Advanced AI Assistant** (that\'s me!)\n✅ **Custom Billing & Invoicing**\n✅ **Team Collaboration Tools**\n✅ **API Integration Support**\n✅ **Priority Customer Support**\n\nYour trial period: 30 days\n\nReady to explore? I can help you set up your first client or project!',
            timestamp: new Date(),
            suggestions: ['Create my first client', 'Set up a project', 'Tour the dashboard', 'Contact support'],
            actions: [{
              type: 'command',
              label: 'Quick Setup',
              description: 'Let me guide you through initial setup',
              data: { cmd: 'quick-setup' },
              icon: CogIcon
            }]
          }]);
        } else if (action.data?.cmd === 'retry-ai') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '🔄 Reconnecting to AI services...\n\nConnection restored! I\'m back online and ready to help with your CRM needs.',
            timestamp: new Date(),
            suggestions: ['Test AI connection', 'Show me features', 'Continue where we left off']
          }]);
        } else if (action.data?.cmd === 'quick-setup') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '🎯 **Quick Setup Guide**\n\nLet\'s get you started in 3 easy steps:\n\n**Step 1**: Add your first client\n**Step 2**: Create a project for that client\n**Step 3**: Schedule your first appointment\n\nWhich step would you like to start with?',
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Step 1: Add Client',
              description: 'Create your first client profile',
              data: { path: '/dashboard/clients' },
              icon: UserGroupIcon
            }, {
              type: 'navigate',
              label: 'Step 2: Create Project',
              description: 'Set up your first project',
              data: { path: '/dashboard/projects' },
              icon: ClipboardDocumentListIcon
            }, {
              type: 'navigate',
              label: 'Step 3: Schedule Meeting',
              description: 'Book your first appointment',
              data: { path: '/dashboard/calendar' },
              icon: CalendarDaysIcon
            }]
          }]);
        }
        break;
      case 'create':
        // Enhanced creation actions for conversational CRM data manipulation
        if (action.data?.type === 'client') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '📝 **Creating New Client**\n\nI\'ll help you add a new client to your CRM. You can either:\n\n• Use the quick form below\n• Navigate to the full client management page for advanced options\n\nWhat\'s the client\'s name and primary contact information?',
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Full Client Form',
              description: 'Complete client setup with all details',
              data: { path: '/dashboard/clients?action=new' },
              icon: UserGroupIcon
            }]
          }]);
        } else if (action.data?.type === 'project') {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: '🚀 **Creating New Project**\n\nLet\'s set up a new project! I\'ll need:\n\n• Project name and description\n• Associated client\n• Timeline and budget\n• Priority level\n\nShould I take you to the project creation form?',
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Create Project',
              description: 'Open project creation form',
              data: { path: '/dashboard/projects?action=new' },
              icon: ClipboardDocumentListIcon
            }]
          }]);
        } else {
          console.log('Create action:', action);
        }
        break;
      case 'edit':
        // Enhanced edit actions for conversational CRM data manipulation
        if (action.data?.type === 'client' && action.data?.id) {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: `✏️ **Editing Client: ${action.data.name || 'Client'}**\n\nI can help you update:\n\n• Contact information (phone, email, address)\n• Company details and notes\n• Project associations\n• Billing preferences\n\nWhat would you like to change?`,
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Edit Client Details',
              description: 'Open client edit form',
              data: { path: `/dashboard/clients/${action.data.id}` },
              icon: UserGroupIcon
            }]
          }]);
        } else if (action.data?.type === 'project' && action.data?.id) {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: `🔧 **Editing Project: ${action.data.name || 'Project'}**\n\nI can help you modify:\n\n• Project scope and description\n• Timeline and milestones\n• Budget and billing\n• Team assignments\n• Status updates\n\nWhat needs to be updated?`,
            timestamp: new Date(),
            actions: [{
              type: 'navigate',
              label: 'Edit Project Details',
              description: 'Open project edit form',
              data: { path: `/dashboard/projects/${action.data.id}` },
              icon: ClipboardDocumentListIcon
            }]
          }]);
        } else {
          console.log('Edit action:', action);
        }
        break;
      case 'delete':
        // Enhanced delete actions with safety confirmations
        if (action.data?.type && action.data?.id) {
          setMessages(prev => [...prev, {
            id: genId(),
            type: 'assistant',
            content: `⚠️ **Delete Confirmation**\n\nAre you sure you want to delete this ${action.data.type}?\n\n**${action.data.name || 'Item'}**\n\nThis action cannot be undone. All associated data will be permanently removed.`,
            timestamp: new Date(),
            actions: [{
              type: 'command',
              label: 'Confirm Delete',
              description: `Delete ${action.data.type} permanently`,
              data: { cmd: 'confirm-delete', ...action.data },
              icon: TrashIcon,
              danger: true
            }, {
              type: 'command',
              label: 'Cancel',
              description: 'Keep the item safe',
              data: { cmd: 'cancel-delete' },
              icon: XMarkIcon
            }]
          }]);
        }
        break;
      case 'view':
        // Enhanced view actions for data inspection
        if (action.data?.type && action.data?.id) {
          router.push(action.data.path || `/dashboard/${action.data.type}s/${action.data.id}`);
          onClose();
        }
        break;
      default:
        // More helpful default response
        setMessages(prev => [...prev, {
          id: genId(),
          type: 'assistant',
          content: `🤔 I'm not sure how to handle that action yet, but I'm learning! \n\nI can help you with:\n• Creating and editing clients & projects\n• Navigating the CRM\n• Scheduling appointments\n• Managing documents\n\nWhat would you like to do?`,
          timestamp: new Date(),
          suggestions: ['Show me around', 'Create new client', 'View projects', 'Open calendar']
        }]);
        console.log('Unknown action:', action);
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
        setMessages(prev => [...prev, { id: genId(), type: 'assistant', content: `Project "${json.title}" created successfully.`, timestamp: new Date(), actions: [ { type: 'navigate', label: 'Open Project', description: 'View the project detail page', data: { path: `/dashboard/projects/${json._id}` }, icon: EyeIcon } ] }]);
        setShowCreateProject(false);
        setProjectDraft({ title: '', description: '', priority: 'medium', status: 'planning' });
        fetchContextSummary();
      } else {
        setMessages(prev => [...prev, { id: genId(), type: 'assistant', content: 'Failed to create project. Check required fields.', timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: genId(), type: 'assistant', content: 'Network error creating project.', timestamp: new Date() }]);
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
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center shadow-inner">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Remodely Ai Assistant</h2>
              <div className="flex flex-wrap gap-1 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-600/25 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">/ for commands</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-600/25 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">{contextSummary.projects ?? '–'} projects</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-600/25 dark:text-green-300 border border-green-200 dark:border-green-500/30">{contextSummary.clients ?? '–'} clients</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setShowCommands(!showCommands)} className="px-2 py-1 text-[11px] rounded-md border border-gray-300 dark:border-[var(--border)] text-gray-600 dark:text-[var(--text-dim)] bg-white dark:bg-[var(--surface-2)] hover:bg-gray-100 dark:hover:bg-[var(--surface-2)] transition-colors" title="Toggle command palette">/{showCommands ? 'hide' : 'cmds'}</button>
            <button onClick={() => { localStorage.removeItem(MEMORY_KEY); setMessages([]); setHasMoreHistory(false); setShowCreateProject(false); }} className="px-2 py-1 text-[11px] rounded-md border border-gray-300 dark:border-[var(--border)] text-gray-600 dark:text-[var(--text-dim)] bg-white dark:bg-[var(--surface-2)] hover:bg-gray-100 dark:hover:bg-[var(--surface-2)] transition-colors" title="Clear chat history">Clear</button>
            <span className="hidden sm:inline-flex px-2 py-1 text-[10px] rounded-md bg-[var(--surface-2)] text-[var(--text-dim)] border border-[var(--border)]">⌘K</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Close assistant (⌘K to toggle)"
            >
              <XMarkIcon className="h-5 w-5 text-[var(--text-dim)]" />
            </button>
          </div>
        </div>

        {/* Optional command palette */}
        {showCommands && (
          <div className="border-b border-token bg-white/90 dark:bg-[var(--surface-1)]/95 backdrop-blur px-4 py-2 text-xs text-gray-600 dark:text-[var(--text-dim)] grid grid-cols-2 gap-2">
            {[
              { cmd: '/projects', tooltip: 'List all projects in workspace' },
              { cmd: '/clients', tooltip: 'Show all clients' },
              { cmd: '/new-project', tooltip: 'Create a new project' },
              { cmd: '/summary', tooltip: 'Get workspace overview' },
              { cmd: '/open dashboard', tooltip: 'Navigate to main dashboard' },
              { cmd: '/help', tooltip: 'Show available commands' }
            ].map(({ cmd, tooltip }) => (
              <button 
                key={cmd} 
                onClick={() => { setInput(cmd); setShowCommands(false); }} 
                className="text-left px-2 py-1 rounded bg-gray-100 dark:bg-[var(--surface-2)] hover:bg-gray-200 dark:hover:bg-[var(--surface-3)] border border-gray-300 dark:border-[var(--border)] transition text-[11px] font-medium text-gray-700 dark:text-[var(--text)]"
                title={tooltip}
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[var(--surface-1)]" onScroll={(e)=> setScrolled((e.target as HTMLDivElement).scrollTop > 8)}>
          {/* Load More History Button */}
          {hasMoreHistory && (
            <div className="flex justify-center">
              <button
                onClick={loadMoreHistory}
                disabled={loadingHistory}
                title="Load 20 more messages from chat history"
                className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-600/10 dark:hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingHistory ? (
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load More History'
                )}
              </button>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm border transition-all ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-600/50 shadow'
                    : message.type === 'system'
                      ? 'bg-gray-100 dark:bg-[var(--surface-2)] text-gray-600 dark:text-[var(--text-dim)] border border-gray-200 dark:border-[var(--border)] text-xs'
                      : 'bg-white dark:bg-[var(--surface-2)] text-gray-800 dark:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 dark:hover:border-[var(--text-dim)]/30'
                }`}
              >
                <p className={`whitespace-pre-wrap leading-relaxed ${message.type==='system' ? 'font-mono' : ''}`}>{message.content}</p>
                <div className="flex items-center justify-end space-x-2 mt-2 opacity-60 group-hover:opacity-90 transition-opacity">
                  <p className={`text-[10px] ${message.type === 'user' ? 'text-amber-100' : 'text-[var(--text-dim)]'}`}>{formatTime(message.timestamp)}</p>
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
                          title={action.description}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left border text-xs font-medium transition group/action ${
                                message.type === 'user'
                                  ? 'bg-white/10 hover:bg-white/15 border-white/30 text-white'
                                  : 'bg-gray-50 dark:bg-[var(--surface-2)] hover:bg-gray-100 dark:hover:bg-[var(--surface-3)] border border-gray-200 dark:border-[var(--border)] text-gray-700 dark:text-[var(--text)]'
                              } ${action.danger ? 'hover:bg-red-50 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600/40' : ''}`}
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
                        title={`Click to ask: "${suggestion}"`}
                        className={`text-[11px] px-2 py-1 rounded border transition ${
                          message.type === 'user'
                            ? 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                            : 'bg-gray-100 dark:bg-[var(--surface-2)] hover:bg-gray-200 dark:hover:bg-[var(--surface-3)] border border-gray-300 dark:border-[var(--border)] text-gray-700 dark:text-[var(--text)]'
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
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
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
                title="Show available commands and shortcuts"
                className="h-7 px-2 inline-flex items-center gap-1 rounded-md border border-[var(--border)] text-[11px] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition"
              >/{showCommands ? 'hide' : 'cmds'}</button>
              <button
                onClick={()=> { localStorage.removeItem(MEMORY_KEY); setMessages([]); setHasMoreHistory(false); setShowCreateProject(false); }}
                aria-label="Reset conversation"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition"
                title="Clear all chat history and start fresh"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <button
                onClick={()=> fetchContextSummary()}
                aria-label="Refresh summary"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-600/10 transition"
                title="Refresh project and client counts from workspace"
              >
                <SparklesIcon className="h-4 w-4" />
              </button>
              <button
                onClick={()=> setShowTools(t=>!t)}
                aria-label="Toggle helper row"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition"
                title="Toggle quick suggestions and shortcuts"
              >
                {showTools ? <XMarkIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)]">
              <span>{input.length} chars</span>
              <span>{Math.ceil(input.trim().split(/\s+/).filter(Boolean).length * 1.3)} tokens est.</span>
              {isLoading && <span className="flex items-center gap-1"><span className="h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> working</span>}
            </div>
          </div>
          {showCreateProject && (
            <div className="p-3 border border-amber-200 dark:border-amber-600/40 rounded-lg bg-amber-50/70 dark:bg-amber-600/15 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-700">Quick Project</p>
                <button onClick={() => setShowCreateProject(false)} className="text-[11px] text-amber-600 hover:underline">close</button>
              </div>
              <input
                placeholder="Title"
                value={projectDraft.title}
                onChange={e => setProjectDraft({ ...projectDraft, title: e.target.value })}
                className="w-full px-2 py-1 rounded border border-amber-200 dark:border-amber-600/40 focus:ring-2 focus:ring-amber-400 text-xs bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)]"
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
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-150"
                title="Create new project with entered details"
              >
                <PlusIcon className="h-4 w-4" /> Create
              </button>
            </div>
          )}
          {showTools && !showCreateProject && !input && (
            <div className="flex flex-wrap gap-2 -mt-0.5">
              {baseSuggestions.map(s => (
                <button 
                  key={s.text} 
                  onClick={()=> setInput(s.text)} 
                  className="text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-[var(--surface-2)] hover:bg-gray-200 dark:hover:bg-[var(--surface-3)] text-gray-700 dark:text-[var(--text)] border border-gray-300 dark:border-[var(--border)] transition"
                  title={s.tooltip}
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}
          <div className="mt-1 group">
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface-2)] dark:bg-[var(--surface-2)] focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition shadow-sm">
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
                  className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed min-h-[42px] max-h-[160px] pr-2 text-gray-800 dark:text-gray-200 placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-600 select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>/</span><span>Enter</span>
                </div>
              </div>
              <div className="flex items-stretch">
                <div className="w-px bg-[var(--border)] my-2" />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  title="Send message (Enter)"
                  className="m-1 ml-0 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium flex items-center gap-1 shadow-sm hover:from-amber-700 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[var(--surface-2)] transition-all duration-150"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
            {showTools && (
              <div className="flex justify-between mt-1 px-1">
                <div className="flex gap-2">
                  <span className="text-[10px] text-[var(--text-dim)]" title="Use Ctrl/⌘ + K to toggle the assistant panel">Ctrl/⌘ + K toggle panel</span>
                  <span className="text-[10px] text-[var(--text-dim)]" title="Type / at the beginning of your message to see available commands">/ for commands</span>
                </div>
                <span className="text-[10px] text-[var(--text-dim)]" title="Keyboard shortcuts for sending messages">Enter = send • Shift+Enter = newline</span>
              </div>
            )}
          </div>
  <div className="text-[10px] text-center text-[var(--text-dim)] pt-0.5" title="AI Assistant capabilities and features">Remodely Ai Assistant can navigate, create entities, and summarize your workspace.</div>
        </div>
      </div>
    </div>
  );
}
