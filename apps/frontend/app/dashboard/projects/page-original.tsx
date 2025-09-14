'use client';

import {
    ArrowRightIcon,
    BoltIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    EllipsisVerticalIcon,
    ExclamationTriangleIcon,
    HomeModernIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    SparklesIcon,
    WrenchScrewdriverIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
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
  const [relatedCounts, setRelatedCounts] = useState<Record<string, { estimates: number; invoices: number }>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fetchRelatedCounts = async (projectIds: string[]) => {
    if (!projectIds.length) return;
    try {
      setCountsLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;
      // Batch endpoints assumption; fallback gracefully if not implemented
      const res = await fetch(`/api/projects/related-counts?ids=${encodeURIComponent(projectIds.join(','))}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') setRelatedCounts(data);
      }
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    if (projects.length) {
      fetchRelatedCounts(projects.map(p => p._id));
    }
  }, [projects]);

  // Helper utilities (re-added after refactor)
  const formatCurrency = (value: number | undefined) => {
    if (value == null || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300/40';
      case 'planning': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300/40';
      case 'completed': return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300/40';
      case 'on_hold': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/40';
      case 'cancelled': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300/40';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300/40';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <BoltIcon className="h-4 w-4" />;
      case 'planning': return <ClockIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'on_hold': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const deleteProject = async (projectId: string) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      alert('You are not logged in. Please log in and try again.');
      return;
    }

    const ok = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!ok) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        // Remove project from local state immediately
        setProjects(prev => prev.filter(p => p._id !== projectId));
        // Refresh stats after deletion
        await refreshProjects();
        alert('Project deleted successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to delete project: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to delete project. Please check your connection and try again.');
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      alert('You are not logged in. Please log in and try again.');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state
        setProjects(prev =>
          prev.map(p => (p._id === projectId ? { ...p, status: newStatus as Project['status'] } : p))
        );
        // Refresh stats
        await refreshProjects();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update project: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to update project. Please check your connection and try again.');
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

  const buildActionUrl = (base: string, project: Project) => {
    const params = new URLSearchParams();
    if (project._id) params.set('projectId', project._id);
    if (project.clientId) params.set('clientId', project.clientId);
    return `${base}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <span className="text-[var(--text-dim)]">Loading your remodeling projects...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)]">
      {/* Global Quick Actions Bar */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)]">
        <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <span className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">Projects: {stats.total}</span>
              <span className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">Active: {stats.active}</span>
              <span className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">Planning: {stats.planning}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-orange-600 text-white text-xs font-medium hover:bg-orange-500 transition">
                <PlusIcon className="h-4 w-4" /> Project
              </Link>
              <Link href="/dashboard/estimates/new" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition">
                <SparklesIcon className="h-4 w-4" /> Estimate
              </Link>
              <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition">
                <CurrencyDollarIcon className="h-4 w-4" /> Invoice
              </Link>
              <Link href="/dashboard/calendar/new" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition">
                <CalendarIcon className="h-4 w-4" /> Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Header with AI Insights */}
      <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text)]">Renovation Projects</h1>
                <p className="text-sm text-[var(--text-dim)]">
                  AI-powered insights for {user?.firstName || 'your'} remodeling business
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </div>

          {/* AI Insights Bar */}
          <div className="bg-orange-600/90 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-500 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                {stats.active > 0
                  ? `${stats.active} active projects averaging $${Math.round(stats.totalBudget / Math.max(stats.total, 1) / 1000)}k each`
                  : 'Ready to track your first remodeling project'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--surface-1)] rounded-xl p-4 border border-[var(--border)] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <HomeModernIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-[var(--text-dim)]">Total Projects</p>
                <p className="text-xl font-bold text-[var(--text)]">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-1)] rounded-xl p-4 border border-[var(--border)] hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <BoltIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-[var(--text-dim)]">Active</p>
                <p className="text-xl font-bold text-[var(--text)]">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-1)] rounded-xl p-4 border border-[var(--border)] hover:border-blue-500/30 transition-colors">
            <div className="flex items-center">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-[var(--text-dim)]">Completed</p>
                <p className="text-xl font-bold text-[var(--text)]">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-1)] rounded-xl p-4 border border-[var(--border)] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-[var(--text-dim)]">Total Value</p>
                <p className="text-xl font-bold text-[var(--text)]">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-dim)]" />
            </div>
            <input
              type="text"
              placeholder="Search renovation projects, clients, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Modern Filter Tabs */}
          <div className="flex overflow-x-auto space-x-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-[var(--surface-1)] text-[var(--text-dim)] hover:text-[var(--text)] border border-[var(--border)] hover:border-amber-500/30'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-dim)]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Modern Project Cards */}
        <div className="space-y-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project._id} className="bg-[var(--surface-1)] rounded-xl border border-[var(--border)] hover:border-amber-500/30 transition-all duration-200 hover:shadow-lg">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text)]">{project.title}</h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1.5">{project.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-dim)] line-clamp-2 mb-4">{project.description}</p>
                    </div>
                    <div className="relative ml-4" ref={dropdownRef}>
                      <button onClick={() => setDropdownOpen(dropdownOpen === project._id ? null : project._id)} className="p-2 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {dropdownOpen === project._id && (
                        <div className="absolute right-0 top-10 w-60 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xl py-2 z-50">
                          <Link href={`/dashboard/projects/${project._id}`} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-amber-600 transition-colors">
                            <ArrowRightIcon className="h-4 w-4 mr-3" /> View Details
                          </Link>
                          <Link href={`/dashboard/projects/${project._id}/edit`} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-amber-600 transition-colors">
                            <WrenchScrewdriverIcon className="h-4 w-4 mr-3" /> Edit Project
                          </Link>
                          <div className="border-t border-[var(--border)] my-2" />
                          <div className="px-4 py-2 text-xs text-[var(--text-dim)] font-medium">Workflow:</div>
                          <Link href={buildActionUrl('/dashboard/estimates/new', project)} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-indigo-500 transition-colors">
                            <SparklesIcon className="h-4 w-4 mr-3" /> New Estimate
                          </Link>
                          <Link href={buildActionUrl('/dashboard/invoices/new', project)} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-emerald-500 transition-colors">
                            <CurrencyDollarIcon className="h-4 w-4 mr-3" /> New Invoice
                          </Link>
                          <Link href={buildActionUrl('/dashboard/calendar/new', project)} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-blue-500 transition-colors">
                            <CalendarIcon className="h-4 w-4 mr-3" /> Schedule Event
                          </Link>
                          <Link href={`/dashboard/clients/${project.clientId || ''}`} onClick={() => setDropdownOpen(null)} className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-orange-500 transition-colors disabled:opacity-40" aria-disabled={!project.clientId}>
                            <HomeModernIcon className="h-4 w-4 mr-3" /> View Client
                          </Link>
                          <div className="border-t border-[var(--border)] my-2" />
                          <div className="px-4 py-2 text-xs text-[var(--text-dim)] font-medium">Quick Status:</div>
                          {['planning','active','on_hold','completed','cancelled'].map(status => {
                            const active = project.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => { setDropdownOpen(null); updateProjectStatus(project._id, status); }}
                                className={`flex items-center w-full text-left px-4 py-2 text-sm transition ${active ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-l-2 border-amber-500' : 'text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-amber-600 hover:border-l-2 hover:border-amber-400'}`}
                                disabled={active}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-3">{active ? '✓ ' : ''}{status.replace('_',' ').toUpperCase()}</span>
                                {active && (
                                  <span className="ml-auto text-xs bg-amber-400/20 text-amber-600 px-2 py-0.5 rounded-full">Current</span>
                                )}
                              </button>
                            );
                          })}
                          <div className="border-t border-[var(--border)] my-2" />
                          <button onClick={() => { setDropdownOpen(null); deleteProject(project._id); }} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
                            <XCircleIcon className="h-4 w-4 mr-3" /> Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {project.clientName && (
                      <div className="flex items-center text-sm text-[var(--text-dim)]">
                        <HomeModernIcon className="h-4 w-4 mr-2" />
                        {project.clientName}
                      </div>
                    )}

                    {project.budget && (
                      <div className="flex items-center text-sm text-[var(--text-dim)]">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        {formatCurrency(project.budget)}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-[var(--text-dim)]">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Start: {formatDate(project.startDate)}
                    </div>
                  </div>

                  {/* Project Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-[var(--text-dim)]">
                        Created: {formatDate(project.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        View Details
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-[var(--text-dim)] mb-6">
                <HomeModernIcon className="h-20 w-20 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-3">
                {searchQuery ? 'No projects found' : 'Streamline your first project workflow'}
              </h3>
              <p className="text-[var(--text-dim)] mb-8 max-w-md mx-auto">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try adjusting your search terms.`
                  : 'Follow the guided steps below to create a client, start a project, and generate an estimate.'}
              </p>
              {searchQuery ? null : (
                <div className="max-w-xl mx-auto space-y-4 mb-10 text-left">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-600 text-white text-xs font-semibold">1</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">Create / import a client</p>
                      <p className="text-xs text-[var(--text-dim)]">Add your customer so future projects, estimates & invoices auto-link.</p>
                      <Link href="/dashboard/clients/new" className="inline-block mt-2 text-xs text-orange-500 hover:underline">New Client</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-600 text-white text-xs font-semibold">2</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">Start a project</p>
                      <p className="text-xs text-[var(--text-dim)]">Track scope, timeline & budget. Client is pre-selectable.</p>
                      <Link href="/dashboard/projects/new" className="inline-block mt-2 text-xs text-orange-500 hover:underline">Create Project</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-600 text-white text-xs font-semibold">3</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">Generate an estimate</p>
                      <p className="text-xs text-[var(--text-dim)]">Turn scope into a structured, sendable proposal.</p>
                      <Link href="/dashboard/estimates/new" className="inline-block mt-2 text-xs text-orange-500 hover:underline">New Estimate</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-600 text-white text-xs font-semibold">4</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">Convert to invoice</p>
                      <p className="text-xs text-[var(--text-dim)]">After approval, convert accepted estimate into an invoice in one click.</p>
                      <Link href="/dashboard/invoices/new" className="inline-block mt-2 text-xs text-orange-500 hover:underline">Issue Invoice</Link>
                    </div>
                  </div>
                </div>
              )}
              {!searchQuery && (
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
