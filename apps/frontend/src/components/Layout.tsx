'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './SearchBar';
import CopilotWidget from './CopilotWidget';
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
} from '@heroicons/react/24/outline';

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

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projects', href: '/dashboard/projects', icon: ClipboardDocumentListIcon, badge: 12 },
    { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon, badge: 48 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon, badge: 3 },
    { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
    { name: 'Designer', href: '/dashboard/designer', icon: PencilSquareIcon },
    { name: 'File Storage', href: '/dashboard/storage', icon: CloudArrowUpIcon },
    { name: 'Online Store', href: '/dashboard/ecommerce', icon: BuildingStorefrontIcon, badge: 7 },
    { name: 'Business Cards', href: '/dashboard/rolladex', icon: UserGroupIcon },
  { name: 'Voice Agent', href: '/dashboard/voice-agent', icon: SparklesIcon },
    { name: 'Messages', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badge: 5 },
    { name: 'Marketing', href: '/dashboard/marketing', icon: MegaphoneIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon }
  ];

  // Update current state based on pathname with better matching logic
  const updatedNavigation = navigation.map(item => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ConstructCRM</span>
          </div>
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
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ConstructCRM</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-6">
              <div className="space-y-1">
                {updatedNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
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

            {/* User profile section */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group block w-full rounded-lg p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/dashboard/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1">
              <SearchBar className="w-full md:max-w-md" />
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:p-2 lg:rounded-md lg:hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="hidden ml-3 text-gray-700 text-sm font-medium lg:block">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDownIcon className="hidden ml-1 h-4 w-4 text-gray-400 lg:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      href="/dashboard/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

  {/* Copilot Widget */}
  <CopilotWidget />
      </div>
    </div>
  );
}
