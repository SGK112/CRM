'use client';

import {
    Bars3Icon,
    CalendarDaysIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    CogIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    HomeIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import SearchBar from './SearchBar';
import { ThemeProvider } from './ThemeProvider';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  badge?: number;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

interface SimpleCRMLayoutProps {
  children: React.ReactNode;
}

export default function SimpleCRMLayout({ children }: SimpleCRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts] = useState<{ projects?: number; clients?: number } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication check
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setLoading(false);

      if (window.location.pathname.startsWith('/auth/')) {
        router.push('/dashboard');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setLoading(false);
      if (!window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Simple CRM Navigation - Core Features Only
  const navigationGroups: NavigationGroup[] = [
    {
      label: 'Core CRM',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Inbox', href: '/dashboard/inbox', icon: EnvelopeIcon },
        {
          name: 'Contacts',
          href: '/dashboard/contacts',
          icon: UserGroupIcon,
          badge: counts?.clients,
        },
        {
          name: 'Projects',
          href: '/dashboard/projects',
          icon: ClipboardDocumentListIcon,
          badge: counts?.projects,
        },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
      ],
    },
    {
      label: 'Sales & Finance',
      items: [
        { name: 'Estimates', href: '/dashboard/estimates', icon: CurrencyDollarIcon },
        { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon },
        { name: 'Reports', href: '/dashboard/analytics', icon: ChartBarIcon },
      ],
    },
    {
      label: 'Settings',
      items: [{ name: 'Settings', href: '/dashboard/settings', icon: CogIcon }],
    },
  ];

  // Update current state based on pathname
  const flatNav: NavigationItem[] = navigationGroups.flatMap(g => g.items);
  const updatedNavigation = flatNav.map(item => {
    let current = false;

    if (item.href === '/dashboard') {
      current = pathname === '/dashboard';
    } else {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
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
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
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
            {navigationGroups.map(group => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map(item => {
                    const isActive = updatedNavigation.find(nav => nav.href === item.href)?.current;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={classNames(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isActive
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span
                            className={classNames(
                              'ml-3 inline-block py-0.5 px-2 text-xs rounded-full',
                              isActive
                                ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
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
              {navigationGroups.map(group => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map(item => {
                      const isActive = updatedNavigation.find(
                        nav => nav.href === item.href
                      )?.current;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shadow-sm'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              'mr-3 h-5 w-5 flex-shrink-0',
                              isActive
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            )}
                          />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span
                              className={classNames(
                                'ml-3 inline-block py-0.5 px-2 text-xs rounded-full',
                                isActive
                                  ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6">
              {/* Mobile menu button */}
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="flex-1 max-w-lg lg:ml-0 ml-4">
                <SearchBar />
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 ml-4">
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
