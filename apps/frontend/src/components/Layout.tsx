'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './SearchBar';
import CopilotWidget from './CopilotWidget';
import AIAssistant from './AIAssistant';
import RouteMemoryTracker from './RouteMemoryTracker';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  SparklesIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  ChevronUpIcon,
  ArrowsPointingOutIcon,
  MicrophoneIcon,
  LockClosedIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { AIProvider } from '../hooks/useAI';
import ThemeToggle from './ThemeToggle';
import AIEnable from './AIEnable';
import { mobileOptimized, mobile } from '@/lib/mobile';
import { PlanBadge } from './CapabilityGate';
import { getUserPlan, hasCapability } from '@/lib/plans';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  workspaceId: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  badge?: number;
  planRequired?: 'basic' | 'ai-pro' | 'enterprise';
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPlan, setUserPlan] = useState<'basic' | 'ai-pro' | 'enterprise'>('basic');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check authentication on client side after component mounts
    if (typeof window === 'undefined') return;
    
    // Check if user is authenticated
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Check if we're already on an auth page to prevent redirect loops
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserPlan(getUserPlan());
      setLoading(false);
      
      // If user is authenticated and on auth page, redirect to dashboard
      if (window.location.pathname.startsWith('/auth/')) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setLoading(false);
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Dynamic counts for sidebar badges (fetched after auth)
  const [counts, setCounts] = useState<{ projects?: number; clients?: number } | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
        if (!token) return;
        // Fetch projects and clients counts; clients has a count endpoint; projects doesn't, so use list length
        const [projectsRes, clientsRes] = await Promise.all([
          fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/clients/count', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);
        const projectsJson = projectsRes && projectsRes.ok ? await projectsRes.json() : [];
        const clientsCount = clientsRes && clientsRes.ok ? await clientsRes.json() : undefined;
        setCounts({ projects: Array.isArray(projectsJson) ? projectsJson.length : undefined, clients: typeof clientsCount === 'number' ? clientsCount : (clientsCount?.count ?? undefined) });
      } catch {
        // ignore badge errors
      }
    }
    fetchCounts();
  }, []);

  const navigationGroups: { label: string; items: NavigationItem[] }[] = [
    {
      label: 'Core Operations',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Projects', href: '/dashboard/projects', icon: ClipboardDocumentListIcon, badge: counts?.projects },
        { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon, badge: counts?.clients },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
      ]
    },
    {
      label: 'Design & Sales',
      items: [
        { 
          name: 'Design Studio', 
          href: '/dashboard/designer', 
          icon: PencilSquareIcon,
          planRequired: 'ai-pro' as const
        },
        { name: 'Financial Hub', href: '/dashboard/financial', icon: CalculatorIcon },
        { name: 'Estimates & Pricing', href: '/dashboard/estimates', icon: DocumentTextIcon },
        { name: 'Invoices & Billing', href: '/dashboard/invoices', icon: ShoppingBagIcon },
        { name: 'Material Catalog', href: '/dashboard/catalog', icon: WrenchScrewdriverIcon },
      ]
    },
    {
      label: 'AI & Voice', 
      items: [
        { 
          name: 'Voice Agents', 
          href: '/dashboard/voice-agent', 
          icon: MicrophoneIcon,
          planRequired: 'ai-pro' as const
        },
        { name: 'Communications', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badge: 5 },
        { name: 'Phone Numbers', href: '/dashboard/phone-numbers', icon: PhoneIcon },
      ]
    },
    {
      label: 'Business Management', 
      items: [
        { name: 'TON Wallet', href: '/dashboard/wallet', icon: WalletIcon },
        { name: 'Documents & Files', href: '/dashboard/documents', icon: DocumentTextIcon },
        { name: 'Reports & Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/dashboard/settings', icon: CogIcon }
      ]
    }
  ];

  // Update current state based on pathname with better matching logic
  const flatNav: NavigationItem[] = navigationGroups.flatMap(g=>g.items);
  const updatedNavigation = flatNav.map(item => {
    let current = false;
    
    if (item.href === '/dashboard') {
      // Dashboard should only be active on exact match
      current = pathname === '/dashboard';
    } else {
      // Other items should be active if pathname starts with their href
      current = pathname === item.href || pathname.startsWith(item.href + '/');
    }
    
    return {
      ...item,
      current
    };
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider>
      <AIProvider>
  <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
  <RouteMemoryTracker />
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={mobileOptimized(
        'fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden sidebar-container',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        mobile.scrollContainer,
        mobile.willChange
      )}>
        <div className={mobileOptimized(
          'flex items-center justify-between h-16 px-4',
          mobile.touchTarget
        )} style={{ borderBottom: '1px solid var(--border)' }}>
          <Logo />
          <button 
            onClick={() => setSidebarOpen(false)} 
            className={mobileOptimized(
              'p-2 rounded-md transition-colors',
              mobile.touchTarget
            )}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className={mobileOptimized(
          'mt-6 px-2 pb-6',
          mobile.scrollContainer,
          'overscroll-contain'
        )}>
          <div className="space-y-1">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={mobileOptimized(
                  classNames(
                    'sidebar-nav-item',
                    item.current ? 'active' : ''
                  ),
                  mobile.touchTarget
                )}
              >
                <item.icon className="icon" />
                <span>{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className={classNames(
                    'ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    item.current 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'badge badge-info'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col sidebar-container" style={{ borderRight: '1px solid var(--border)' }}>
          <div className="flex h-16 flex-shrink-0 items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <Logo />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              <div className="space-y-1">
                {navigationGroups.map(group => {
                  const groupItems = updatedNavigation.filter(i=> group.items.some(gItem=> gItem.href === i.href));
                  return (
                    <div key={group.label} className="mb-4">
                      <div className="sidebar-nav-group">{group.label}</div>
                      {groupItems.map(item => {
                        const originalItem = group.items.find(gi => gi.href === item.href);
                        const isRestricted = originalItem?.planRequired && originalItem.planRequired !== 'basic' && userPlan === 'basic';
                        
                        return (
                          <Link
                            key={item.name}
                            href={isRestricted ? `/dashboard/settings/billing?upgrade=${originalItem.planRequired}` : item.href}
                            className={classNames(
                              'sidebar-nav-item',
                              item.current ? 'active' : '',
                              isRestricted ? 'opacity-75' : ''
                            )}
                          >
                            <item.icon className={`icon ${isRestricted ? 'text-gray-400' : ''}`} />
                            <span className="flex-1">{item.name}</span>
                            {isRestricted && (
                              <LockClosedIcon className="w-4 h-4 text-amber-500 ml-2" />
                            )}
                            {item.badge && item.badge > 0 && !isRestricted && (
                              <span className={classNames(
                                'ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                item.current 
                                  ? 'bg-amber-600 text-white shadow-sm' 
                                  : 'badge badge-info'
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* User profile section */}
            <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group block w-full rounded-lg p-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  style={{ 
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--accent-light)' }}
                      >
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--accent)' }}
                        >
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {user.email}
                        </p>
                        <PlanBadge plan={userPlan} className="text-xs" />
                      </div>
                    </div>
                    <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </button>

                {showUserMenu && (
                  <div 
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-md py-1 shadow-lg ring-1 ring-black/10"
                    style={{ 
                      backgroundColor: 'var(--surface-2)', 
                      border: '1px solid var(--border)' 
                    }}
                  >
                    <div className="px-4 py-2 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-tertiary">Appearance</span>
                        <ThemeToggle variant="compact" />
                      </div>
                    </div>
                    <Link
                      href="/dashboard/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/80"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/80"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/80"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {/* Top navigation */}
        <div className={mobileOptimized(
          'sticky top-0 z-50 flex h-16 flex-shrink-0 backdrop-blur-md bg-opacity-95',
          mobile.safeTop
        )} style={{ 
          backgroundColor: 'var(--surface-1)', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <button
            type="button"
            className={mobileOptimized(
              'px-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 lg:hidden transition-colors',
              mobile.touchTarget
            )}
            style={{ 
              color: 'var(--text-muted)',
              borderRight: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8 min-w-0">
            {/* Search */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-1 min-w-0 max-w-lg">
                <SearchBar className="w-full" />
              </div>
            </div>

      <div className="ml-4 flex items-center md:ml-6 shrink-0 space-x-2 sm:space-x-3">
              {/* AI Enable */}
              <AIEnable />
              {/* Theme Toggle */}
              <ThemeToggle variant="button" />
              {/* Notifications */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/notifications')}
                className={mobileOptimized(
                  'relative rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105',
                  mobile.touchTarget
                )}
                aria-label="View notifications"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium shadow-sm">
                  3
                </span>
              </button>
              {/* Quick Create */}
              <QuickCreate />
              {/* Help Button */}
              <button
                type="button"
                className="group hidden sm:inline-flex items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 hover:scale-105"
                onClick={() => {
                  // Focus Copilot widget if available
                  const evt = new CustomEvent('copilot:open');
                  window.dispatchEvent(evt);
                }}
              >
                <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500 mr-1" />
                Help
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <div className={`mx-auto scroll-smooth ${
            pathname.startsWith('/dashboard/clients') ? 'max-w-none px-4 sm:px-6 lg:px-8' : 'max-w-7xl px-4 sm:px-6 lg:px-8'
          }`}>
            {children}
          </div>
        </main>

        {/* Footer with Copilot Tab */}
        <FooterCopilot />
      </div>
    </div>
  </AIProvider>
  </ThemeProvider>
  );
}

// Footer-based Copilot component
function FooterCopilot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullCopilot, setShowFullCopilot] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Listen for global Help button event to open Copilot
  useEffect(() => {
    const handler = () => {
      setIsExpanded(true);
      setShowFullCopilot(true);
    };
    window.addEventListener('copilot:open', handler as EventListener);
    return () => window.removeEventListener('copilot:open', handler as EventListener);
  }, []);

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // Pass the action to the AI assistant and clear the input
    setShowFullCopilot(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (inputValue.trim()) {
      // Open the AI assistant with the input value
      setShowFullCopilot(true);
    }
  };

  const handleCloseCopilot = () => {
    setShowFullCopilot(false);
    // Clear the input after closing if it was sent
    if (inputValue.trim()) {
      setInputValue('');
    }
  };

  return (
    <>
      {/* Inline Footer Copilot */}
      <div className={mobileOptimized(
        'sticky z-30 relative overflow-hidden footer-copilot-safe',
        mobile.safeBottom
      )} style={{ bottom: 'var(--safe-area-inset-bottom, 0px)' }}>
        {/* Enhanced professional background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 backdrop-blur-xl shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/20 to-indigo-50/30 dark:from-blue-900/20 dark:via-slate-800/30 dark:to-indigo-900/20"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 dark:via-slate-500 to-transparent shadow-sm"></div>
        
        {/* Content */}
        <div className="relative z-10 border-t border-blue-200/50 dark:border-slate-600 shadow-2xl">
          {/* Main Footer Bar */}
          <div className="flex flex-col">
          {/* Quick Actions Row - Always visible on larger screens, toggle on mobile */}
          <div className={`px-3 py-2 transition-all duration-200 border-b border-blue-200/50 dark:border-slate-600 ${
            isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 md:max-h-20 md:opacity-100 overflow-hidden'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-xs font-semibold whitespace-nowrap mr-2 text-slate-700 dark:text-slate-300">Quick:</span>
                {[
                  { label: 'Projects', action: 'Show my remodeling projects' },
                  { label: 'Clients', action: 'Show my clients' },
                  { label: 'New Kitchen', action: 'Create a new kitchen remodel project' },
                  { label: 'New Bathroom', action: 'Create a new bathroom remodel project' },
                  { label: 'Design Ideas', action: 'Show me design inspiration for my current project' },
                  { label: 'Permits', action: 'Help me with permit requirements' }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickAction(item.action)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-500 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-700 dark:hover:text-white shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-slate-400"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFullCopilot(true)}
                className="ml-2 p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-all duration-200 border border-blue-200 dark:border-slate-500 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-slate-400"
                title="Open full assistant"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Input Row */}
          <div className={mobileOptimized(
            'flex items-center space-x-3 px-3 py-3',
            mobile.safeBottom
          )} style={{ paddingBottom: 'max(0.75rem, var(--safe-area-inset-bottom))' }}>
            {/* Copyright */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>© 2025 Remodely CRM</span>
            </div>

            {/* AI Input */}
            <div className="flex-1 flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 rounded-xl border-2 border-blue-200 dark:border-slate-500 px-4 py-2 flex-1 shadow-lg hover:shadow-xl transition-all duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-400 focus-within:shadow-xl">
                <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <SparklesIcon className="h-2.5 w-2.5 text-white" />
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask AI anything..."
                  className="flex-1 bg-transparent text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none min-w-0 text-slate-900 dark:text-slate-100 font-medium"
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsExpanded(true)}
                />
                <button
                  onClick={(e) => handleSendMessage(e)}
                  disabled={!inputValue.trim()}
                  className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:hover:shadow-md transform hover:scale-105 disabled:hover:scale-100"
                >
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Toggle Quick Actions (Mobile) */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-all duration-200 border border-blue-200 dark:border-slate-500 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-slate-400"
                title="Toggle quick actions"
              >
                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronUpIcon className="h-3 w-3" />
                </div>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Full AI Assistant Modal */}
      <AIAssistant 
        isOpen={showFullCopilot} 
        onClose={handleCloseCopilot}
        initialMessage={inputValue}
      />
    </>
  );
}

// Lightweight quick create dropdown (inline to avoid extra file for now)
function QuickCreate() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o=>!o)}
        className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <span className="mr-1">+</span> Create
      </button>
      {open && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-20 text-sm overflow-hidden transform transition-all duration-200 scale-100 opacity-100">
            {[
              { label: 'Project', href: '/dashboard/projects?new=1' },
              { label: 'Client', href: '/dashboard/clients?new=1' },
              { label: 'Design', href: '/dashboard/designer?view=new' },
              { label: 'Message', href: '/dashboard/chat?compose=1' }
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={()=>setOpen(false)}
              className="w-full text-left px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
