'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  CameraIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeProjects: number;
  projectsChange: number;
  totalClients: number;
  clientsChange: number;
  avgProjectValue: number;
  avgProjectChange: number;
}

interface RecentProject {
  id: string;
  title: string;
  client: string;
  type: 'kitchen' | 'bathroom' | 'whole_home' | 'addition' | 'exterior';
  status: 'design' | 'permits' | 'demolition' | 'construction' | 'finishing';
  budget: number;
  progress: number;
  startDate: string;
  nextMilestone: string;
}

interface QuickStat {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down';
  color: string;
}

const remodelingTypes = {
  kitchen: { label: 'Kitchen Remodel', color: 'bg-amber-500', icon: '🍳' },
  bathroom: { label: 'Bathroom Remodel', color: 'bg-blue-500', icon: '🚿' },
  whole_home: { label: 'Whole Home', color: 'bg-purple-500', icon: '🏠' },
  addition: { label: 'Home Addition', color: 'bg-green-500', icon: '🔨' },
  exterior: { label: 'Exterior/Siding', color: 'bg-orange-500', icon: '🏡' }
};

const statusSteps = {
  design: { label: 'Design Phase', color: 'bg-blue-500', step: 1 },
  permits: { label: 'Permits', color: 'bg-yellow-500', step: 2 },
  demolition: { label: 'Demo', color: 'bg-red-500', step: 3 },
  construction: { label: 'Construction', color: 'bg-orange-500', step: 4 },
  finishing: { label: 'Finishing', color: 'bg-green-500', step: 5 }
};

export default function RemodelingDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    activeProjects: 0,
    projectsChange: 0,
    totalClients: 0,
    clientsChange: 0,
    avgProjectValue: 0,
    avgProjectChange: 0
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and dashboard data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Mock remodeling-specific data - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalRevenue: 485000,
        revenueChange: 18.5,
        activeProjects: 12,
        projectsChange: 3,
        totalClients: 28,
        clientsChange: 5,
        avgProjectValue: 87500,
        avgProjectChange: 12.3
      });

      setRecentProjects([
        {
          id: '1',
          title: 'Modern Kitchen Renovation',
          client: 'Johnson Family',
          type: 'kitchen',
          status: 'construction',
          budget: 95000,
          progress: 75,
          startDate: '2025-01-15',
          nextMilestone: 'Cabinet installation - Feb 10'
        },
        {
          id: '2', 
          title: 'Master Bathroom Remodel',
          client: 'Davis Residence',
          type: 'bathroom',
          status: 'finishing',
          budget: 42000,
          progress: 90,
          startDate: '2024-12-01',
          nextMilestone: 'Final inspection - Feb 5'
        },
        {
          id: '3',
          title: 'Victorian Home Restoration',
          client: 'Miller Estate',
          type: 'whole_home',
          status: 'permits',
          budget: 350000,
          progress: 15,
          startDate: '2025-02-01',
          nextMilestone: 'Permit approval - Feb 15'
        },
        {
          id: '4',
          title: 'Two-Story Addition',
          client: 'Rodriguez Family',
          type: 'addition',
          status: 'design',
          budget: 180000,
          progress: 35,
          startDate: '2025-01-20',
          nextMilestone: 'Design approval - Feb 8'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';
    
    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Your projects are looking great! Keep up the excellent work.",
      "Turning houses into dream homes, one project at a time.",
      "Every renovation tells a story. What's yours today?",
      "Building relationships through quality craftsmanship.",
      "Creating beautiful spaces that families will love for years."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      trend: stats.revenueChange > 0 ? 'up' : 'down',
      color: 'border-green-200 bg-green-50'
    },
    {
      label: 'Active Projects', 
      value: stats.activeProjects.toString(),
      change: stats.projectsChange,
      trend: stats.projectsChange > 0 ? 'up' : 'down',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      change: stats.clientsChange,
      trend: stats.clientsChange > 0 ? 'up' : 'down',
      color: 'border-purple-200 bg-purple-50'
    },
    {
      label: 'Avg Project Value',
      value: `$${stats.avgProjectValue.toLocaleString()}`,
      change: stats.avgProjectChange,
      trend: stats.avgProjectChange > 0 ? 'up' : 'down',
      color: 'border-orange-200 bg-orange-50'
    }
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personalized Header */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-2xl border-2 theme-border">
          {/* Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-blue-600/20"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {getPersonalizedGreeting()}
                </h1>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-xl text-white font-medium leading-relaxed drop-shadow-md">
                    {getMotivationalMessage()}
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <HomeIcon className="h-10 w-10 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-white/90 text-sm font-medium">Remodely CRM</div>
                  <div className="text-white text-lg font-bold">Dashboard</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border-2 theme-border p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-red-400 dark:hover:border-red-500 relative overflow-hidden"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-orange-50 dark:from-gray-700 dark:via-transparent dark:to-gray-600 opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <p className="text-3xl font-bold mt-2 mb-1" style={{ color: 'var(--text)' }}>{stat.value}</p>
                  </div>
                  {stat.change && (
                    <div className={`flex items-center px-3 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-red-500 dark:bg-red-600 text-white'}`}>
                      {stat.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-bold text-white">{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl border-2 theme-border mb-8 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-1)' }}>
          {/* Professional header with modern gradient */}
          <div className="px-8 py-6 border-b theme-border relative overflow-hidden">
            {/* Enhanced dark background for white text visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/40 via-transparent to-slate-900/40 dark:from-blue-900/20 dark:via-transparent dark:to-indigo-900/20"></div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Active Projects
                  </h2>
                  <p className="text-sm opacity-90 text-white">
                    Your ongoing remodeling projects
                  </p>
                </div>
              </div>
              
              <Link
                href="/dashboard/projects"
                className="group flex items-center space-x-2 text-sm font-semibold text-white hover:text-gray-200 transition-all duration-200 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 hover:shadow-lg transform hover:scale-105"
              >
                <span>View All Projects</span>
                <ArrowTrendingUpIcon className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-4 right-24 w-12 h-12 bg-slate-500/20 dark:bg-slate-600/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-slate-600/30 dark:bg-slate-700/30 rounded-full blur-2xl"></div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentProjects.map((project) => {
                const projectType = remodelingTypes[project.type];
                const projectStatus = statusSteps[project.status];
                
                return (
                  <div
                    key={project.id}
                    className="border theme-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${projectType.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                          {projectType.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-orange-600 transition-colors" style={{ color: 'var(--text)' }}>
                            {project.title}
                          </h3>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{project.client}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectStatus.color} text-white`}>
                          {projectStatus.label}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Next Milestone */}
                    <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-semibold">Next: </span>{project.nextMilestone}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/projects/new"
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <PlusIcon className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">New Project</h3>
                <p className="text-sm opacity-90">Start a new remodeling project</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/designer"
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <Squares2X2Icon className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">Design Studio</h3>
                <p className="text-sm opacity-90">Create project mockups</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">View Reports</h3>
                <p className="text-sm opacity-90">Analyze performance</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
}
