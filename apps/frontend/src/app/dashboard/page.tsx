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
  Squares2X2Icon,
  SparklesIcon,
  LockClosedIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { getUserPlan, hasCapability, PLANS, type PlanTier, type PlanCapabilities, setUserPlan } from '@/lib/plans';
import { CapabilityGate } from '@/components/CapabilityGate';
import AiChatInterface from '@/components/AiChatInterface';
import HelpTooltip from '@/components/ui/HelpTooltip';

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
  kitchen: { label: 'Kitchen Remodel', color: 'bg-amber-500', icon: WrenchScrewdriverIcon },
  bathroom: { label: 'Bathroom Remodel', color: 'bg-blue-500', icon: HomeIcon },
  whole_home: { label: 'Whole Home', color: 'bg-purple-500', icon: BuildingOfficeIcon },
  addition: { label: 'Home Addition', color: 'bg-green-500', icon: BuildingStorefrontIcon },
  exterior: { label: 'Exterior/Siding', color: 'bg-orange-500', icon: PencilSquareIcon }
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
  const [userPlan, setUserPlan] = useState<PlanTier>('basic');
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);
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
    // Load user and plan data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Get current user plan
    const currentPlan = getUserPlan();
    setUserPlan(currentPlan);

    // Listen for plan changes
    const handlePlanChange = (event: CustomEvent) => {
      setUserPlan(event.detail.plan);
    };

    window.addEventListener('plan-changed', handlePlanChange as EventListener);

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

    return () => {
      window.removeEventListener('plan-changed', handlePlanChange as EventListener);
    };
  }, []);

  const handlePlanSwitch = (newPlan: PlanTier) => {
    setUserPlan(newPlan);
    setUserPlan(newPlan); // Update both local state and localStorage
    setShowPlanSwitcher(false);
  };

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
        {/* Personalized Header with Plan Badge */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-2xl border-2 theme-border">
          {/* Enhanced gradient for AI plans */}
          <div className={`absolute inset-0 opacity-90 ${
            userPlan === 'basic' 
              ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
              : userPlan === 'ai-pro'
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
              : 'bg-gradient-to-br from-purple-600 via-pink-500 to-red-500'
          }`}></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {getPersonalizedGreeting()}
                  </h1>
                  
                  {/* Plan Badge - Now Clickable */}
                  <button 
                    onClick={() => setShowPlanSwitcher(true)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 ${
                      userPlan === 'basic' 
                        ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                        : userPlan === 'ai-pro'
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {userPlan === 'basic' && <span>FREE PLAN ↗</span>}
                    {userPlan === 'ai-pro' && (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        <span>AI PRO ↗</span>
                      </>
                    )}
                    {userPlan === 'enterprise' && (
                      <>
                        <StarIcon className="h-4 w-4 mr-1" />
                        <span>ENTERPRISE ↗</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-xl text-white font-medium leading-relaxed drop-shadow-md">
                    {userPlan === 'basic' 
                      ? "Great work! Upgrade to unlock AI-powered insights and voice agents."
                      : userPlan === 'ai-pro'
                      ? "🤖 AI is working for you! Smart insights and voice agents available."
                      : "🚀 Enterprise power activated! Full AI suite and premium support."
                    }
                  </p>
                </div>
              </div>
              
              {/* Decorative elements with AI indicator */}
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  userPlan === 'basic' 
                    ? 'bg-white/20'
                    : 'bg-white/30 shadow-lg'
                }`}>
                  {userPlan === 'basic' ? (
                    <HomeIcon className="h-10 w-10 text-white" />
                  ) : (
                    <div className="relative">
                      <HomeIcon className="h-10 w-10 text-white" />
                      {/* Fixed sparkle icon positioning */}
                      <SparklesIcon className="h-4 w-4 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse bg-amber-600 rounded-full p-0.5" />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white/90 text-sm font-medium">Remodely CRM</div>
                  <div className="text-white text-lg font-bold">
                    {userPlan === 'basic' ? 'Dashboard' : 'AI Dashboard'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced animated background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          {userPlan !== 'basic' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          )}
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-amber-400 dark:hover:border-amber-500 relative overflow-hidden"
            >
              {/* Enhanced gradient backgrounds */}
              <div className={`absolute inset-0 opacity-30 ${
                index === 0 ? 'bg-gradient-to-br from-green-100 via-transparent to-green-50 dark:from-green-900/20 dark:via-transparent dark:to-green-800/10' :
                index === 1 ? 'bg-gradient-to-br from-blue-100 via-transparent to-blue-50 dark:from-blue-900/20 dark:via-transparent dark:to-blue-800/10' :
                index === 2 ? 'bg-gradient-to-br from-purple-100 via-transparent to-purple-50 dark:from-purple-900/20 dark:via-transparent dark:to-purple-800/10' :
                'bg-gradient-to-br from-orange-100 via-transparent to-orange-50 dark:from-orange-900/20 dark:via-transparent dark:to-orange-800/10'
              }`}></div>
              
              <div className="relative z-10">
                {/* Improved Card Layout with Better Alignment */}
                <div className="h-full flex flex-col justify-between">
                  {/* Header Row - Better aligned with green bubble */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Green notification bubble aligned with title */}
                      {stat.change && (
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-lg ${
                          stat.trend === 'up' 
                            ? 'bg-green-500 dark:bg-green-600 text-white' 
                            : 'bg-red-500 dark:bg-red-600 text-white'
                        }`}>
                          {stat.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-3 w-3" />
                          )}
                        </div>
                      )}
                      <p className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <HelpTooltip 
                        content={
                          index === 0 ? "Total revenue generated from completed projects and invoices. This includes all paid estimates and project payments." :
                          index === 1 ? "Number of active projects currently in progress. Projects are considered active from approval through completion." :
                          index === 2 ? "Total number of clients in your CRM system, including leads, active clients, and past customers." :
                          "Average project value based on completed projects over the last 12 months. Helps track business growth trends."
                        }
                        title={stat.label}
                        size="sm"
                      />
                    </div>
                    
                    {/* Percentage Badge - Right aligned */}
                    {stat.change && (
                      <div className={`flex items-center px-2 py-1 rounded-md text-xs font-bold shadow-lg ${
                        stat.trend === 'up' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        <span className="text-xs font-bold">{stat.trend === 'up' ? '+' : '-'}{Math.abs(stat.change)}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Main Value Row - Center aligned */}
                  <div className="flex-1 flex items-center justify-center my-6">
                    <p className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center">
                      {stat.value}
                    </p>
                  </div>
                  
                  {/* Bottom Row - Change Description */}
                  {stat.change && (
                    <div className="flex items-center justify-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className={`text-sm font-medium text-center ${
                        stat.trend === 'up' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.trend === 'up' ? '+' : '-'}{Math.abs(stat.change)}% from last month
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Corner Accent */}
              <div className={`absolute bottom-0 right-0 w-16 h-16 opacity-20 ${
                index === 0 ? 'bg-gradient-to-tl from-green-400 to-transparent' :
                index === 1 ? 'bg-gradient-to-tl from-blue-400 to-transparent' :
                index === 2 ? 'bg-gradient-to-tl from-purple-400 to-transparent' :
                'bg-gradient-to-tl from-orange-400 to-transparent'
              }`}></div>
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
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {recentProjects.map((project) => {
                const projectType = remodelingTypes[project.type];
                const projectStatus = statusSteps[project.status];
                
                return (
                  <div
                    key={project.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  >
                    {/* Enhanced Background Gradient */}
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-amber-50 via-transparent to-orange-50 dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10 group-hover:opacity-30 transition-opacity duration-300"></div>
                    
                    {/* Floating Action Indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="w-8 h-8 bg-amber-500 dark:bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      {/* Enhanced Project Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-14 h-14 ${projectType.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <projectType.icon className="h-7 w-7" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 leading-tight">
                              {project.title}
                            </h3>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1.5" />
                              {project.client}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {projectType.label}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${(project.budget / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Budget
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Progress Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${projectStatus.color} text-white shadow-md`}>
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              {projectStatus.label}
                            </span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Step {projectStatus.step} of 5
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-md relative overflow-hidden"
                              style={{ width: `${project.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Next Milestone */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <CalendarDaysIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Next Milestone
                              </div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {project.nextMilestone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI-Enhanced Quick Actions - Better Grid Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/dashboard/projects/new"
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <PlusIcon className="h-8 w-8" />
                  <div>
                    <h3 className="text-lg font-semibold">New Project</h3>
                    <p className="text-sm opacity-90">Start a new remodeling project</p>
                  </div>
                </div>
                <HelpTooltip 
                  content="Create a new remodeling project with client information, scope, timeline, and budget. Track progress from initial consultation to completion."
                  title="New Project"
                  size="sm"
                />
              </div>
            </div>
          </Link>

          <CapabilityGate 
            need="design.studio"
            fallback={
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-6 text-white relative overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Squares2X2Icon className="h-8 w-8" />
                        {/* Fixed lock icon positioning */}
                        <LockClosedIcon className="h-3 w-3 absolute -top-0.5 -right-0.5 bg-gray-700 text-white rounded-full p-0.5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Design Studio</h3>
                        <p className="text-sm opacity-90">Upgrade for AI design tools</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">AI PRO</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Link
              href="/dashboard/designer"
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Squares2X2Icon className="h-8 w-8" />
                      {/* Fixed sparkle icon positioning to prevent overlap */}
                      <SparklesIcon className="h-3 w-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse bg-blue-600 rounded-full p-0.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI Design Studio</h3>
                      <p className="text-sm opacity-90">AI-powered design tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CapabilityGate>

          <CapabilityGate 
            need="voice.agents"
            fallback={
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-6 text-white relative overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <MicrophoneIcon className="h-8 w-8" />
                        {/* Fixed lock icon positioning */}
                        <LockClosedIcon className="h-3 w-3 absolute -top-0.5 -right-0.5 bg-gray-700 text-white rounded-full p-0.5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Voice Agents</h3>
                        <p className="text-sm opacity-90">Upgrade for AI assistants</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">AI PRO</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Link
              href="/dashboard/voice-agent-enhanced"
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <MicrophoneIcon className="h-8 w-8" />
                      {/* Fixed sparkle icon positioning to prevent overlap */}
                      <SparklesIcon className="h-3 w-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse bg-purple-600 rounded-full p-0.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI Voice Agents</h3>
                      <p className="text-sm opacity-90">Smart conversational AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CapabilityGate>

          <Link
            href="/dashboard/analytics"
            className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ChartBarIcon className="h-8 w-8" />
                    {hasCapability('ai.analytics', userPlan) && (
                      <SparklesIcon className="h-3 w-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse bg-green-600 rounded-full p-0.5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {hasCapability('ai.analytics', userPlan) ? 'AI Analytics' : 'View Reports'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {hasCapability('ai.analytics', userPlan) ? 'Smart insights & predictions' : 'Basic performance data'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* AI Features Showcase for Free Users */}
        {userPlan === 'basic' && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unlock AI-Powered Remodeling
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Upgrade to AI Pro and transform your remodeling business with intelligent automation
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <SparklesIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Descriptions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auto-generate project descriptions</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <MicrophoneIcon className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Voice Agents</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">24/7 AI customer support</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <ChartBarIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Smart Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Predictive insights & trends</p>
                </div>
              </div>
              
              <Link
                href="/settings/billing?upgrade=ai-pro"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Upgrade to AI Pro - $49/month
              </Link>
            </div>
          </div>
        )}

        {/* AI Chat Assistant (AI Pro+ only) */}
        <CapabilityGate need="ai.chat">
          <div className="mt-8">
            <AiChatInterface compact={true} />
          </div>
        </CapabilityGate>

        {/* Simple Plan Switching Modal */}
        {showPlanSwitcher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Switch Plan
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose your plan to see different features
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Basic Plan */}
                <button
                  onClick={() => handlePlanSwitch('basic')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    userPlan === 'basic'
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-700'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Basic Plan</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Free • Core Features</p>
                    </div>
                    {userPlan === 'basic' && (
                      <div className="text-gray-600 dark:text-gray-300">✓</div>
                    )}
                  </div>
                </button>

                {/* AI Pro Plan */}
                <button
                  onClick={() => handlePlanSwitch('ai-pro')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    userPlan === 'ai-pro'
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">AI Pro</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">$49/mo • AI Features + Voice Agents</p>
                    </div>
                    {userPlan === 'ai-pro' && (
                      <div className="text-blue-600 dark:text-blue-400">✓</div>
                    )}
                  </div>
                </button>

                {/* Enterprise Plan */}
                <button
                  onClick={() => handlePlanSwitch('enterprise')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    userPlan === 'enterprise'
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-300 dark:border-gray-600 dark:hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Enterprise</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">$149/mo • Full AI Suite + Priority Support</p>
                    </div>
                    {userPlan === 'enterprise' && (
                      <div className="text-purple-600 dark:text-purple-400">✓</div>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPlanSwitcher(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
