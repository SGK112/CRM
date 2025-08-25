/**
 * Mobile-Optimized Dashboard Enhancement
 * 
 * This component provides mobile-friendly enhancements to the dashboard
 * while maintaining backward compatibility with the existing version.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon,
  Bars3Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { mobileOptimized, mobileClasses, responsive, mobile, MobileComponents } from '@/lib/mobile';

interface DashboardStats {
  totalRevenue: number;
  activeProjects: number;
  totalClients: number;
  pendingTasks: number;
  revenueChange?: number;
  projectsChange?: number;
  clientsChange?: number;
  tasksChange?: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'client' | 'payment' | 'message' | 'appointment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

interface Project {
  id: string;
  title: string;
  client?: string;
  status: 'lead' | 'proposal' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'planning' | 'review';
  progress: number;
  budget: number;
  dueDate: string;
}

const statusColors = {
  lead: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  proposal: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  planning: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
  review: 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300',
};

export default function MobileOptimizedDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeProjects: 0,
    totalClients: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with actual API calls
        setStats({
          totalRevenue: 125000,
          activeProjects: 8,
          totalClients: 24,
          pendingTasks: 12,
          revenueChange: 12.5,
          projectsChange: 3,
          clientsChange: 8,
          tasksChange: -2
        });

        setRecentActivity([
          {
            id: '1',
            type: 'project',
            title: 'Kitchen Renovation Started',
            description: 'Johnson residence kitchen project has begun',
            timestamp: '2 hours ago',
            status: 'pending'
          },
          {
            id: '2',
            type: 'client',
            title: 'New Client Added',
            description: 'Sarah Miller added to client database',
            timestamp: '4 hours ago',
            status: 'completed'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Payment Received',
            description: '$15,000 payment from Martinez Family',
            timestamp: '1 day ago',
            status: 'completed'
          }
        ]);

        setProjects([
          {
            id: '1',
            title: 'Kitchen Renovation',
            client: 'Johnson Family',
            status: 'in_progress',
            progress: 65,
            budget: 45000,
            dueDate: '2024-03-15'
          },
          {
            id: '2',
            title: 'Bathroom Remodel',
            client: 'Martinez Family',
            status: 'planning',
            progress: 15,
            budget: 28000,
            dueDate: '2024-04-01'
          },
          {
            id: '3',
            title: 'Home Addition',
            client: 'Davis Family',
            status: 'approved',
            progress: 0,
            budget: 85000,
            dueDate: '2024-06-30'
          }
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Mobile-optimized stats card component
  const StatsCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    };

    return (
      <div className={mobileOptimized(
        mobileClasses.card.container,
        'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        mobile.touchTarget
      )}>
        <div className={mobileClasses.card.body}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={mobileOptimized(
                mobileClasses.text.small,
                'font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide'
              )}>
                {title}
              </p>
              <p className={mobileOptimized(
                'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1'
              )}>
                {value}
              </p>
              {change !== undefined && (
                <div className="flex items-center mt-2">
                  {change >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={mobileOptimized(
                    mobileClasses.text.small,
                    change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
            <div className={mobileOptimized(
              'p-3 rounded-lg',
              colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
            )}>
              <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile-optimized project card
  const ProjectCard = ({ project }: { project: Project }) => (
    <div className={mobileOptimized(
      mobileClasses.card.container,
      'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
      mobile.touchTarget
    )}>
      <div className={mobileClasses.card.body}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={mobileOptimized(
              'text-lg font-semibold text-gray-900 dark:text-gray-100 truncate'
            )}>
              {project.title}
            </h3>
            {project.client && (
              <p className={mobileOptimized(
                mobileClasses.text.small,
                'text-gray-600 dark:text-gray-400 mt-1'
              )}>
                {project.client}
              </p>
            )}
          </div>
          <span className={mobileOptimized(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            statusColors[project.status]
          )}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className={mobileOptimized(mobileClasses.text.small, 'text-gray-600 dark:text-gray-400')}>
              Progress
            </span>
            <span className={mobileOptimized(mobileClasses.text.small, 'font-medium text-gray-900 dark:text-gray-100')}>
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Budget: ${project.budget.toLocaleString()}
          </span>
          <button
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            className={mobileOptimized(
              'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
              'font-medium transition-colors',
              mobile.touchTarget,
              'px-2 py-1 rounded'
            )}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile-optimized activity item
  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'project': return ClipboardDocumentListIcon;
        case 'client': return UserGroupIcon;
        case 'payment': return CurrencyDollarIcon;
        case 'message': return ChatBubbleLeftRightIcon;
        case 'appointment': return CalendarDaysIcon;
        default: return BellIcon;
      }
    };

    const Icon = getActivityIcon(activity.type);

    return (
      <div className={mobileOptimized(
        'flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors',
        mobile.touchTarget
      )}>
        <div className="flex-shrink-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={mobileOptimized(
            mobileClasses.text.body,
            'font-medium text-gray-900 dark:text-gray-100'
          )}>
            {activity.title}
          </p>
          <p className={mobileOptimized(
            mobileClasses.text.small,
            'text-gray-600 dark:text-gray-400 mt-1'
          )}>
            {activity.description}
          </p>
          <p className={mobileOptimized(
            'text-xs text-gray-500 dark:text-gray-400 mt-1'
          )}>
            {activity.timestamp}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className={mobileOptimized(mobileClasses.container.responsive, 'py-6')}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={mobileClasses.container.responsive}>
        {/* Mobile-optimized page header */}
        <div className={mobileOptimized(responsive.padding.md, 'border-b border-gray-200 dark:border-gray-700')}>
          <PageHeader
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening with your projects."
            actions={
              <div className="flex items-center space-x-2">
                {/* View mode toggle - mobile only */}
                <div className={mobileOptimized(responsive.showOnMobile, 'flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1')}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={mobileOptimized(
                      'p-1 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-400'
                    )}
                  >
                    <Bars3Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={mobileOptimized(
                      'p-1 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-400'
                    )}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => router.push('/dashboard/projects/new')}
                  className={mobileOptimized(
                    mobileClasses.button.primary,
                    'bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
                    'flex items-center space-x-2 transition-colors',
                    mobile.touchTarget
                  )}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className={responsive.hideOnMobile}>New Project</span>
                  <span className={responsive.showOnMobile}>New</span>
                </button>
              </div>
            }
          />
        </div>

        {/* Stats Cards */}
        <div className={responsive.padding.md}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatsCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              change={stats.revenueChange}
              icon={CurrencyDollarIcon}
              color="green"
            />
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              change={stats.projectsChange}
              icon={ClipboardDocumentListIcon}
              color="blue"
            />
            <StatsCard
              title="Total Clients"
              value={stats.totalClients}
              change={stats.clientsChange}
              icon={UserGroupIcon}
              color="purple"
            />
            <StatsCard
              title="Pending Tasks"
              value={stats.pendingTasks}
              change={stats.tasksChange}
              icon={CalendarDaysIcon}
              color="yellow"
            />
          </div>
        </div>

        {/* Recent Projects & Activity */}
        <div className={mobileOptimized(
          'grid grid-cols-1 lg:grid-cols-3 gap-6',
          responsive.padding.md
        )}>
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className={mobileOptimized(
                mobileClasses.text.subheading,
                'text-gray-900 dark:text-gray-100'
              )}>
                Recent Projects
              </h2>
              <button
                onClick={() => router.push('/dashboard/projects')}
                className={mobileOptimized(
                  'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
                  'text-sm font-medium transition-colors',
                  mobile.touchTarget,
                  'px-2 py-1 rounded'
                )}
              >
                View All
              </button>
            </div>
            
            <div className={viewMode === 'grid' ? mobileClasses.grid.list : 'space-y-4'}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className={mobileOptimized(
              mobileClasses.text.subheading,
              'text-gray-900 dark:text-gray-100 mb-4'
            )}>
              Recent Activity
            </h2>
            
            <div className={mobileOptimized(
              mobileClasses.card.container,
              'divide-y divide-gray-200 dark:divide-gray-700'
            )}>
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              
              <div className="p-3">
                <button
                  onClick={() => router.push('/dashboard/activity')}
                  className={mobileOptimized(
                    'w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
                    'text-sm font-medium transition-colors py-2',
                    mobile.touchTarget
                  )}
                >
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
