'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './SearchBar';
import CopilotWidget from './CopilotWidget';
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
  SparklesIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { ThemeProvider, useTheme } from './ThemeProvider';

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
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check authentication on client side after component mounts
    if (typeof window === 'undefined') return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Check if we're already on an auth page to prevent redirect loops
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // If user is authenticated and on auth page, redirect to dashboard
      if (window.location.pathname.startsWith('/auth/')) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    }
  }, [router]);

  const navigationGroups: { label: string; items: NavigationItem[] }[] = [
    {
      label: 'Core',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Projects', href: '/dashboard/projects', icon: ClipboardDocumentListIcon, badge: 12 },
        { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon, badge: 48 },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon, badge: 3 },
      ]
    },
    {
      label: 'Content & Files',
      items: [
        { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
        { name: 'Designer', href: '/dashboard/designer', icon: PencilSquareIcon },
        { name: 'File Storage', href: '/dashboard/storage', icon: CloudArrowUpIcon },
      ]
    },
    {
      label: 'Pricing & Sales',
      items: [
        { name: 'Catalog', href: '/dashboard/catalog', icon: WrenchScrewdriverIcon },
        { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingOfficeIcon },
        { name: 'Price List', href: '/dashboard/pricing', icon: WrenchScrewdriverIcon },
        { name: 'Estimates', href: '/dashboard/estimates', icon: DocumentTextIcon },
        { name: 'Sales', href: '/dashboard/sales', icon: ShoppingBagIcon },
        { name: 'Online Store', href: '/dashboard/ecommerce', icon: BuildingStorefrontIcon, badge: 7 },
      ]
    },
    {
      label: 'Communication',
      items: [
        { name: 'Voice Agent', href: '/dashboard/voice-agent', icon: SparklesIcon },
        { name: 'Messages', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badge: 5 },
        { name: 'Business Cards', href: '/dashboard/rolladex', icon: UserGroupIcon },
        { name: 'Marketing', href: '/dashboard/marketing', icon: MegaphoneIcon },
      ]
    },
    {
      label: 'Insights & Admin',
      items: [
        { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
  <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
  <RouteMemoryTracker />
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Logo />
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span className={item.current ? 'font-semibold' : ''}>{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.current 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
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
  <div className="flex min-h-0 flex-1 flex-col surface-1 elevated border-r border-token">
      <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-token">
            <Logo />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <nav className="flex-1 px-3 py-6">
              <div className="space-y-1">
                {navigationGroups.map(group => {
                  const groupItems = updatedNavigation.filter(i=> group.items.some(gItem=> gItem.href === i.href));
                  return (
                    <div key={group.label} className="mb-6">
                      <div className="px-3 pb-1 text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-500/80">{group.label}</div>
                      {groupItems.map(item => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                            item.current
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-sm dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 dark:border-blue-500'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-[var(--text-dim)] dark:hover:text-[var(--text)] dark:hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 transition-colors ${
                              item.current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                            }`}
                          />
                          <span className={item.current ? 'font-semibold' : ''}>{item.name}</span>
                          {item.badge && (
                                <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide transition-all duration-200 ${
                                  item.current 
                                    ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-sm ring-1 ring-blue-400/60 dark:ring-blue-300/50 scale-110' 
                                    : 'bg-gray-200 text-gray-700 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)] dark:ring-1 dark:ring-[var(--border)]/60 group-hover:scale-105'
                                }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* User profile section */}
            <div className="flex-shrink-0 border-t border-token p-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group block w-full rounded-lg p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 rounded-md surface-2 py-1 shadow-lg ring-1 ring-black/10 border border-token">
                    <ThemeSelect />
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
  <div className="lg:pl-64 flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Top navigation */}
  <div className="sticky top-0 z-50 flex h-16 flex-shrink-0 surface-1 elevated border-b border-token backdrop-blur-md bg-opacity-95">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Search (logo only appears in sidebar to avoid duplication) */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <SearchBar className="w-full md:max-w-lg" />
              </div>
            </div>

      <div className="ml-4 flex items-center md:ml-6 shrink-0 space-x-3">
              {/* Notifications */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/notifications')}
                className="relative rounded-full surface-2 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 dark:text-[var(--text-dim)] dark:hover:text-[var(--text)] focus:ring-offset-[var(--bg)] transition-all duration-200 hover:scale-105"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
              {/* Quick Create */}
              <QuickCreate />
              {/* Help Button */}
              <button
                type="button"
                className="group hidden sm:inline-flex items-center px-3 py-2 rounded-md border border-token surface-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] dark:text-[var(--text-dim)] dark:hover:text-[var(--text)] dark:hover:bg-[var(--surface-2)] transition-all duration-200 hover:scale-105"
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

  {/* Copilot Widget */}
  <CopilotWidget />
      </div>
    </div>
  </ThemeProvider>
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
          <div className="absolute right-0 mt-2 w-44 rounded-md surface-1 elevated border border-token shadow-lg py-1 z-20 text-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {[
              { label: 'Project', href: '/dashboard/projects?new=1' },
              { label: 'Client', href: '/dashboard/clients?new=1' },
              { label: 'Design', href: '/dashboard/designer?view=new' },
              { label: 'Message', href: '/dashboard/chat?compose=1' }
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] text-gray-700 dark:text-[var(--text)] transition-colors duration-150 hover:scale-[1.02] transform"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={()=>setOpen(false)}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 dark:text-[var(--text-dim)] hover:text-gray-500 dark:hover:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Inline theme select component for user menu
function ThemeSelect() {
  const { theme, setTheme, toggleTheme, system } = useTheme();
  return (
    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Appearance</span>
        <button
          onClick={toggleTheme}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Toggle
        </button>
      </div>
      <div className="flex gap-2">
        {(['light','dark'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
              theme === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">System: {system}</p>
    </div>
  );
}
