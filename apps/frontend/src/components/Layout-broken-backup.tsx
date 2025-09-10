'use client';

import { getUserPlan } from '@/lib/plans';
import {
    Bars3Icon,
    BellIcon,
    CalculatorIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    CogIcon,
    CreditCardIcon,
    DocumentTextIcon,
    HomeIcon,
    InboxIcon,
    LockClosedIcon,
    MicrophoneIcon,
    PhoneIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    WalletIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AIProvider } from '../hooks/useAI';
import { useInboxStats } from '../hooks/useInboxStats';
import AIAssistant from './AIAssistant';
import AIEnable from './AIEnable';
import { PlanBadge } from './CapabilityGate';
import Logo from './Logo';
import RouteMemoryTracker from './RouteMemoryTracker';
import SearchBar from './SearchBar';
import { ThemeProvider } from './ThemeProvider';

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

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  hidden?: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPlan, setUserPlan] = useState<'basic' | 'ai-pro' | 'enterprise'>('basic');
  const router = useRouter();
  const pathname = usePathname();
  const { stats: inboxStats } = useInboxStats();

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
      // Failed to parse user data - clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setLoading(false);
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    }

    // Load sidebar collapsed state from localStorage
    const collapsedState = localStorage.getItem('sidebarCollapsed');
    if (collapsedState !== null) {
      setSidebarCollapsed(JSON.parse(collapsedState));
    }
  }, [router]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Dynamic counts for sidebar badges (fetched after auth)
  const [counts, setCounts] = useState<{ projects?: number; clients?: number; documents?: number; notifications?: number } | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') || localStorage.getItem('token')
            : null;
        if (!token) return;
        
        // Fetch all counts using dedicated count endpoints
        const [projectsRes, clientsRes, documentsRes, notificationsRes] = await Promise.all([
          fetch('/api/projects/count', { headers: { Authorization: `Bearer ${token}` } }).catch(
            () => null
          ),
          fetch('/api/clients/count', { headers: { Authorization: `Bearer ${token}` } }).catch(
            () => null
          ),
          fetch('/api/documents/count', { headers: { Authorization: `Bearer ${token}` } }).catch(
            () => null
          ),
          fetch('/api/notifications/count', { headers: { Authorization: `Bearer ${token}` } }).catch(
            () => null
          ),
        ]);
        
        const projectsCount = projectsRes && projectsRes.ok ? await projectsRes.json() : undefined;
        const clientsCount = clientsRes && clientsRes.ok ? await clientsRes.json() : undefined;
        const documentsCount = documentsRes && documentsRes.ok ? await documentsRes.json() : undefined;
        const notificationsCount = notificationsRes && notificationsRes.ok ? await notificationsRes.json() : undefined;
        
        setCounts({
          projects: typeof projectsCount?.count === 'number' ? projectsCount.count : undefined,
          clients: typeof clientsCount?.count === 'number' ? clientsCount.count : undefined,
          documents: typeof documentsCount?.count === 'number' ? documentsCount.count : undefined,
          notifications: typeof notificationsCount?.count === 'number' ? notificationsCount.count : undefined,
        });
      } catch {
        // ignore badge errors
      }
    }
    fetchCounts();
  }, []);

  const navigationGroups: NavigationGroup[] = [
    {
      label: 'Core Operations',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Inbox', href: '/dashboard/inbox', icon: InboxIcon, badge: inboxStats?.unread },
        {
          name: 'Projects',
          href: '/dashboard/projects',
          icon: ClipboardDocumentListIcon,
          badge: counts?.projects,
        },
        {
          name: 'Clients',
          href: '/dashboard/clients',
          icon: UserGroupIcon,
          badge: counts?.clients,
        },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
      ],
    },
    {
      label: 'Design & Sales',
      items: [
        { name: 'Financial', href: '/dashboard/financial', icon: CalculatorIcon },
        { name: 'Catalog', href: '/dashboard/catalog', icon: WrenchScrewdriverIcon },
      ],
    },
    {
      label: 'AI & Voice',
      hidden: true, // Hide AI apps in their own category
      items: [
        {
          name: 'Voice Agents',
          href: '/dashboard/voice-agent',
          icon: MicrophoneIcon,
          planRequired: 'ai-pro' as const,
        },
        { name: 'Phone Numbers', href: '/dashboard/phone-numbers', icon: PhoneIcon },
      ],
    },
    {
      label: 'Business Management',
      items: [
        { name: 'TON Wallet', href: '/dashboard/wallet', icon: WalletIcon },
        { 
          name: 'Documents & Files', 
          href: '/dashboard/documents', 
          icon: DocumentTextIcon,
          badge: counts?.documents,
        },
        { name: 'Reports & Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
        { name: 'Admin Dashboard', href: '/dashboard/admin', icon: ShieldCheckIcon },
        { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
      ],
    },
  ];

  // Update current state based on pathname with better matching logic
  const flatNav: NavigationItem[] = navigationGroups.flatMap(g => g.items || []);
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
      current,
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
        {/* Use the new layout coordination classes */}
        <div className="app-layout-wrapper">
          {/* Sidebar overlay for mobile */}
          <div 
            className={cn(
              "sidebar-overlay",
              sidebarOpen && "visible"
            )}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Desktop sidebar - coordinated with new layout system */}
          <div
            className={cn(
              "layout-sidebar sidebar-content",
              // Desktop positioning and width
              sidebarCollapsed ? "collapsed" : "",
              // Mobile overlay behavior
              sidebarOpen ? "open" : ""
            )}
          >
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!sidebarCollapsed && (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                      <div>
                        <h1 className="font-semibold text-lg">AUTOMOTIVATED</h1>
                        <p className="text-xs text-muted-foreground">CRM Dashboard</p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Desktop toggle button */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hide-mobile p-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <ChevronLeftIcon 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      sidebarCollapsed && "rotate-180"
                    )}
                  />
                </button>
                
                {/* Mobile close button */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="show-mobile p-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="sidebar-nav mobile-sidebar-scroll">
              <div className="space-y-8 px-4 py-6">{/* Navigation content will go here */}
                  {navigationGroups
                    .filter(group => !group.hidden)
                    .map(group => {
                      if (!group.items || !Array.isArray(group.items) || !updatedNavigation || !Array.isArray(updatedNavigation)) {
                        return null;
                      }
                      const groupItems = updatedNavigation.filter(i =>
                        group.items.some(gItem => gItem.href === i.href)
                      );
                      return (
                        <div key={group.label} className="space-y-2">
                          <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {group.label}
                          </div>
                          <div className="space-y-1">
                            {groupItems.map(item => {
                              const originalItem = group.items.find(gi => gi.href === item.href);
                              const isRestricted =
                                originalItem?.planRequired &&
                                originalItem.planRequired !== 'basic' &&
                                userPlan === 'basic';

                              return (
                                <Link
                                  key={item.name}
                                  href={
                                    isRestricted
                                      ? `/dashboard/settings/billing?upgrade=${originalItem.planRequired}`
                                      : item.href
                                  }
                                  onClick={() => setSidebarOpen(false)}
                                  className={classNames(
                                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                                    item.current
                                      ? 'bg-slate-900 text-amber-400 border border-slate-700'
                                      : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400 active:scale-95',
                                    isRestricted ? 'opacity-60' : ''
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      'mr-4 h-5 w-5 flex-shrink-0',
                                      item.current
                                        ? 'text-amber-400'
                                        : isRestricted
                                          ? 'text-slate-500'
                                          : 'text-slate-400 group-hover:text-amber-400'
                                    )}
                                  />
                                  <span className="flex-1">{item.name}</span>
                                  {isRestricted && (
                                    <LockClosedIcon className="w-4 h-4 text-amber-500 ml-2" />
                                  )}
                                  {item.badge && item.badge > 0 && !isRestricted && (
                                    <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500 text-black shadow-sm">
                                      {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </nav>

              {/* User profile section - Mobile */}
              <div className="relative flex-shrink-0 p-4 border-t border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-black">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                      <PlanBadge plan={userPlan} className="text-xs" />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-all duration-200"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>

                {showUserMenu && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-2 space-y-1">
                      <Link
                        href="/dashboard/settings/profile"
                        className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CreditCardIcon className="h-4 w-4" />
                        Billing & Payments
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop sidebar - Mobile-first design template */}
          <div
            className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-out ${
              sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
            }`}
          >
            <div className="flex min-h-0 flex-1 flex-col bg-black border-r border-slate-700">
              {/* Desktop header */}
              <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 border-b border-slate-700">
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <WrenchScrewdriverIcon className="h-4 w-4 text-black" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">Navigation</h2>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="mx-auto h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>

              {/* Desktop navigation */}
              <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 px-3 py-6">
                  <div className="space-y-8">
                    {navigationGroups
                      .filter(group => !group.hidden)
                      .map(group => {
                        if (!group.items || !Array.isArray(group.items) || !updatedNavigation || !Array.isArray(updatedNavigation)) {
                          return null;
                        }
                        const groupItems = updatedNavigation.filter(i =>
                          group.items.some(gItem => gItem.href === i.href)
                        );
                        return (
                          <div key={group.label} className="space-y-2">
                            {!sidebarCollapsed && (
                              <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {group.label}
                              </div>
                            )}
                            <div className="space-y-1">
                              {groupItems.map(item => {
                                const originalItem = group.items.find(gi => gi.href === item.href);
                                const isRestricted =
                                  originalItem?.planRequired &&
                                  originalItem.planRequired !== 'basic' &&
                                  userPlan === 'basic';

                                return (
                                  <Link
                                    key={item.name}
                                    href={
                                      isRestricted
                                        ? `/dashboard/settings/billing?upgrade=${originalItem.planRequired}`
                                        : item.href
                                    }
                                    className={classNames(
                                      'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                                      sidebarCollapsed ? 'justify-center' : '',
                                      item.current
                                        ? 'bg-slate-900 text-amber-400 border border-slate-700'
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400 active:scale-95',
                                      isRestricted ? 'opacity-60' : ''
                                    )}
                                    title={sidebarCollapsed ? item.name : undefined}
                                  >
                                    <item.icon
                                      className={classNames(
                                        'h-5 w-5 flex-shrink-0 transition-all duration-300',
                                        sidebarCollapsed ? 'mr-0' : 'mr-4',
                                        item.current
                                          ? 'text-amber-400'
                                          : isRestricted
                                            ? 'text-slate-500'
                                            : 'text-slate-400 group-hover:text-amber-400'
                                      )}
                                    />
                                    {!sidebarCollapsed && (
                                      <span className="flex-1 truncate">{item.name}</span>
                                    )}
                                    {!sidebarCollapsed && isRestricted && (
                                      <LockClosedIcon className="w-4 h-4 text-amber-500 ml-2 flex-shrink-0" />
                                    )}
                                    {!sidebarCollapsed &&
                                      item.badge &&
                                      item.badge > 0 &&
                                      !isRestricted && (
                                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500 text-black shadow-sm">
                                          {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                      )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </nav>

                {/* User profile section - Desktop */}
                <div className="flex-shrink-0 p-4 border-t border-slate-700">
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={classNames(
                        'group block w-full rounded-xl p-3 text-left text-sm font-medium hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300',
                        sidebarCollapsed ? 'px-2' : ''
                      )}
                      title={sidebarCollapsed ? `${user.firstName} ${user.lastName}` : undefined}
                    >
                      <div
                        className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-black">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        {!sidebarCollapsed && (
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-slate-400 truncate">
                                {user.email}
                              </p>
                              <PlanBadge plan={userPlan} className="text-xs flex-shrink-0" />
                            </div>
                          </div>
                        )}
                        {!sidebarCollapsed && (
                          <ChevronDownIcon className="h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 group-hover:text-amber-400" />
                        )}
                      </div>
                    </button>

                    {showUserMenu && (
                      <div
                        className={`${sidebarCollapsed ? 'fixed' : 'absolute'} ${sidebarCollapsed ? 'bottom-20 left-6 w-64' : 'bottom-full left-0 right-0 mb-2'} bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 transition-all duration-300`}
                        style={{
                          zIndex: 9999,
                          backgroundColor: 'rgb(15 23 42)',
                        }}
                      >
                        <div className="p-2 space-y-1">
                          <Link
                            href="/dashboard/settings/profile"
                            className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Your Profile
                          </Link>
                          <Link
                            href="/billing"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CreditCardIcon className="h-4 w-4" />
                            Billing & Payments
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div
            className={`lg:flex lg:flex-col min-h-screen transition-all duration-300 ease-out ${
              sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            {/* Unified Header with Logo and Toolbar */}
            <header className="sticky top-0 z-40 bg-black border-b border-slate-700 overflow-visible">
              <div className="flex h-16 items-center justify-between px-4 lg:px-6 overflow-visible">
                {/* Left Section: Logo + Navigation */}
                <div className="flex items-center gap-4">
                  {/* Desktop sidebar toggle */}
                  <button
                    type="button"
                    className="hidden lg:flex p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition-all duration-200 group"
                    onClick={toggleSidebar}
                    title={
                      sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'
                    }
                  >
                    {sidebarCollapsed ? (
                      <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                      <ChevronLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    )}
                  </button>

                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>

                  {/* Always visible logo */}
                  <div className="flex items-center">
                    <Logo compact={false} />
                  </div>

                  {/* Breadcrumb/Current Page Indicator */}
                  <div className="hidden md:flex items-center text-sm text-slate-400">
                    <span className="font-medium text-white">
                      {(() => {
                        const pathSegments = pathname.split('/').filter(Boolean);
                        const lastSegment = pathSegments[pathSegments.length - 1];
                        return lastSegment
                          ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
                          : 'Dashboard';
                      })()}
                    </span>
                  </div>
                </div>

                {/* Center Section: Search */}
                <div className="flex-1 max-w-lg mx-4 lg:mx-8">
                  <SearchBar />
                </div>

                {/* Right Section: Actions Toolbar */}
                <div className="flex items-center gap-2">
                  {/* AI Enable Toggle */}
                  <div className="hidden sm:flex">
                    <AIEnable />
                  </div>

                  {/* Notifications */}
                  <button
                    onClick={() => router.push('/dashboard/inbox')}
                    className="relative p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition-all duration-200 hover:scale-105"
                    title="Notifications"
                  >
                    <BellIcon className="h-5 w-5" />
                    {inboxStats && inboxStats.unread && inboxStats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                        {inboxStats.unread > 9 ? '9+' : inboxStats.unread}
                      </span>
                    )}
                  </button>

                  {/* Quick Create */}
                  <QuickCreate />

                  {/* Help */}
                  <button
                    className="hidden sm:flex items-center px-3 py-2 text-sm text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      const evt = new CustomEvent('copilot:open');
                      window.dispatchEvent(evt);
                    }}
                    title="Help & Support"
                  >
                    <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                    Help
                  </button>
                </div>
              </div>
            </header>

            {/* Page content with mobile optimization */}
            <main className="flex-1 py-6 overflow-y-auto">
              <div
                className={classNames(
                  'px-4 sm:px-6 lg:px-8',
                  pathname.startsWith('/dashboard/clients') ? 'max-w-none' : 'max-w-7xl mx-auto'
                )}
              >
                {children}
              </div>
            </main>

            {/* Floating Rest Tab */}
            <FloatingRestTab />
          </div>
          {/* End main content area */}
        </div>
        {/* End app-layout-wrapper */}
      </AIProvider>
    </ThemeProvider>
  );
}

// Medium half pill sticky tab on side - connected to Copilot
function FloatingRestTab() {
  const [showCopilot, setShowCopilot] = useState(false);

  // Listen for global Help button event to open Copilot
  useEffect(() => {
    const handler = () => {
      setShowCopilot(true);
    };
    window.addEventListener('copilot:open', handler as EventListener);
    return () => window.removeEventListener('copilot:open', handler as EventListener);
  }, []);

  const handleOpenCopilot = () => {
    setShowCopilot(true);
  };

  const handleCloseCopilot = () => {
    setShowCopilot(false);
  };

  return (
    <>
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50">
        <div className="group relative">
          {/* Half Pill Tab */}
          <div
            onClick={handleOpenCopilot}
            className="bg-black/80 backdrop-blur-md border-l border-t border-b border-slate-700 rounded-l-full pr-6 pl-4 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            {/* Rest/Sleep Icon */}
            <div className="relative">
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-1 bg-amber-400 rounded-full"></div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm group-hover:bg-amber-400/30 transition-all duration-300"></div>
            </div>
          </div>

          {/* Hover tooltip */}
          <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 px-3 py-2 bg-black/90 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Open AI Assistant
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={showCopilot}
        onClose={handleCloseCopilot}
        initialMessage=""
      />
    </>
  );
}

// Lightweight quick create dropdown (inline to avoid extra file for now)
function QuickCreate() {
  const [open, setOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useCallback((node: HTMLButtonElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center px-3 py-2 rounded-md bg-amber-500 text-black text-xs font-medium shadow-sm hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <span className="mr-1">+</span> Create
        </button>
      </div>
      
      {/* Render dropdown at root level to escape header constraints */}
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div 
            className="fixed w-44 rounded-md bg-slate-700 border border-slate-600 shadow-xl py-1 z-[9999] text-sm"
            style={{
              top: `${buttonPosition.top}px`,
              right: `${buttonPosition.right}px`,
            }}
          >
            {[
              { label: 'Project', href: '/dashboard/projects?new=1' },
              { label: 'Contact', href: '/dashboard/clients?new=1' },
              { label: 'Design', href: '/dashboard/designer?view=new' },
              { label: 'Message', href: '/dashboard/inbox?compose=1' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 hover:bg-slate-600 hover:text-white text-slate-200 transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-600 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}
