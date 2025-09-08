'use client';

import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  clientName?: string;
  address?: string;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onHold: number;
  cancelled: number;
  totalBudget: number;
}

export default function ProjectsPage() {
  const [user, setUser] = useState<{ id: number; name: string; firstName?: string; email: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    onHold: 0,
    cancelled: 0,
    totalBudget: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Failed to parse user data
      }
    }
    
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const projectsData = Array.isArray(data) ? data : data.projects || [];
          setProjects(projectsData);
          
          // Calculate stats
          const newStats = {
            total: projectsData.length,
            active: projectsData.filter((p: Project) => p.status === 'active').length,
            completed: projectsData.filter((p: Project) => p.status === 'completed').length,
            planning: projectsData.filter((p: Project) => p.status === 'planning').length,
            onHold: projectsData.filter((p: Project) => p.status === 'on_hold').length,
            cancelled: projectsData.filter((p: Project) => p.status === 'cancelled').length,
            totalBudget: projectsData.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0),
          };
          setStats(newStats);
        } else {
          // Failed to fetch projects
        }
      } catch (error) {
        // Error fetching projects
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [router]);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const projectsData = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectsData);
        
        // Calculate stats
        const newStats = {
          total: projectsData.length,
          active: projectsData.filter((p: Project) => p.status === 'active').length,
          completed: projectsData.filter((p: Project) => p.status === 'completed').length,
          planning: projectsData.filter((p: Project) => p.status === 'planning').length,
          onHold: projectsData.filter((p: Project) => p.status === 'on_hold').length,
          cancelled: projectsData.filter((p: Project) => p.status === 'cancelled').length,
          totalBudget: projectsData.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0),
        };
        setStats(newStats);
      } else {
        // Failed to fetch projects
      }
    } catch (error) {
      // Error fetching projects
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <ClockIcon className="h-4 w-4" />;
      case 'active':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'on_hold':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <BuildingOfficeIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'active':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'on_hold':
        return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'cancelled':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const deleteProject = async (projectId: string) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    const ok = window.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== projectId));
        refreshProjects(); // Refresh stats
      }
    } catch (e) {
      // ignore for now; show toast in future
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || project.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'planning', label: 'Planning', count: stats.planning },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'on_hold', label: 'On Hold', count: stats.onHold },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Projects</h1>
              <p className="text-sm text-slate-400">
                Hey {user?.firstName || 'there'}, you have {stats.active} active projects
              </p>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <BuildingOfficeIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Total Projects</p>
                <p className="text-lg font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-lg font-semibold text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-lg font-semibold text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Total Budget</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project._id} className="bg-slate-900 rounded-xl border border-slate-800">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                    </div>
                    <button className="ml-2 p-2 text-slate-400 hover:text-white">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {project.clientName && (
                      <div className="flex items-center text-sm text-slate-400">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {project.clientName}
                      </div>
                    )}
                    
                    {project.budget && (
                      <div className="flex items-center text-sm text-slate-400">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        {formatCurrency(project.budget)}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-slate-400">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Start: {formatDate(project.startDate)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <Link
                      href={`/dashboard/projects/${project._id}`}
                      className="inline-flex items-center text-sm text-amber-500 hover:text-amber-400"
                    >
                      View Details
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                    
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <BuildingOfficeIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try a different search term.`
                  : 'Get started by creating your first project.'}
              </p>
              {!searchQuery && (
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="h-20"></div>
    </div>
  );
}
