'use client';

import {
    Bars3Icon,
    BellIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    CogIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    HomeIcon,
    InboxIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
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

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState<{ projects?: number; clients?: number; unreadMessages?: number } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

        if (!userData || !token) {
          router.push('/auth/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        // Auth check failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch dashboard counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) return;

        // Fetch projects count
        const projectsRes = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();

        // Fetch clients count
        const clientsRes = await fetch('/api/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientsData = await clientsRes.json();

        // Fetch inbox count
        const inboxRes = await fetch('/api/inbox/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const inboxData = await inboxRes.json();

        setCounts({
          projects: Array.isArray(projectsData) ? projectsData.length : 0,
          clients: Array.isArray(clientsData) ? clientsData.length : 0,
          unreadMessages: inboxData?.unread || 0,
        });
      } catch (error) {
        // Failed to fetch counts, silently continue
      }
    };

    if (user) {
      fetchCounts();
    }
  }, [user]);

  const navigationGroups: NavigationGroup[] = [
    {
      label: 'Core',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Inbox', href: '/dashboard/inbox', icon: InboxIcon, badge: counts?.unreadMessages },
        { name: 'Contacts', href: '/dashboard/contacts', icon: UserGroupIcon, badge: counts?.clients },
        { name: 'Projects', href: '/dashboard/projects', icon: ClipboardDocumentListIcon, badge: counts?.projects },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
      ],
    },
    {
      label: 'Business',
      items: [
        { name: 'Estimates', href: '/dashboard/estimates', icon: DocumentTextIcon },
        { name: 'Invoices', href: '/dashboard/invoices', icon: CurrencyDollarIcon },
        { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
        { name: 'Catalog', href: '/dashboard/catalog', icon: WrenchScrewdriverIcon },
      ],
    },
    {
      label: 'Settings',
      items: [
        { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
      ],
    },
  ];

  // Update current state based on pathname
  const updatedNavigation = navigationGroups.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      current: item.href === '/dashboard' 
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href),
    })),
  }));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <Logo />
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {updatedNavigation.map(group => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          item.current
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200 dark:border-gray-700">
              <Logo />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              {updatedNavigation.map(group => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          item.current
                            ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            item.current
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* User section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  title="Sign out"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Search */}
              <div className="flex-1 max-w-lg lg:ml-0 ml-4">
                <SearchBar />
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 ml-4">
                {/* Notifications */}
                <button
                  onClick={() => router.push('/dashboard/notifications')}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg"
                  title="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                </button>

                {/* User menu (mobile) */}
                <button
                  onClick={handleLogout}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg"
                  title="Sign out"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}