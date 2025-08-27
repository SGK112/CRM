'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid, StandardButton, StandardStat } from '../../../components/ui/StandardPageWrapper';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { standardComponents, cn } from '../../../lib/theme-utils';
// Use frontend rewrite to avoid CORS and prefix issues; call /api/* from the browser

// Backend schema differs from original assumed shape. We'll create a normalized internal representation.
interface RawProject { [key:string]: any; _id: string; title: string; description?: string; status: string; priority: string; clientId: string; assignedTo?: string[]; startDate?: string; endDate?: string; budget?: number; workspaceId: string; address?: any; createdAt?: string; updatedAt?: string; tags?: string[] }

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'; // normalized
  rawStatus: string; // original backend status
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  assignedUsers: string[]; // mapped from assignedTo
  address?: {
    city?: string; state?: string; street?: string; zipCode?: string; country?: string; coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

function normalizeProject(p: RawProject): Project {
  const mapStatus = (s: string): Project['status'] => {
    switch (s) {
      case 'lead':
      case 'proposal':
        return 'planning';
      case 'approved':
      case 'in_progress':
        return 'active';
      case 'on_hold':
        return 'on_hold';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'planning';
    }
  };
  return {
    _id: p._id,
    title: p.title,
    description: p.description || '',
    status: mapStatus(p.status),
    rawStatus: p.status,
    priority: (['low','medium','high','urgent'].includes(p.priority) ? p.priority : 'medium') as Project['priority'],
    budget: p.budget,
    startDate: p.startDate,
    endDate: p.endDate,
    clientId: p.clientId,
    assignedUsers: p.assignedTo || [],
    address: p.address || {},
    tags: Array.isArray(p.tags) ? p.tags : [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Unified badge bubble palette (light + dark adaptive)
const statusColors = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-600/20 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'priority' | 'budget' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
    // optional: refresh every 2 minutes
    const id = setInterval(() => fetchProjects(true), 120000);
    return () => clearInterval(id);
  }, []);

  // Debounce search input to reduce re-filter churn
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    filterProjects();
  }, [projects, debouncedSearch, statusFilter, priorityFilter]);

  const fetchProjects = async (silent = false) => {
    try {
      setError(null);
      if (!silent) setLoading(true); else setRefreshing(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        setError('Not authenticated');
        router.push('/auth/login');
        return;
      }

  const response = await fetch(`/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: RawProject[] = await response.json();
        const normalized = data.map(normalizeProject);
        setProjects(normalized);
      } else {
        const text = await response.text();
        setError(`Failed to fetch projects (${response.status})`);
        console.error('Failed to fetch projects', text);
      }
    } catch (error) {
      setError('Network error while fetching projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(project => {
        const inTitle = project.title.toLowerCase().includes(term);
        const inDesc = project.description.toLowerCase().includes(term);
        const inTags = (project.tags || []).some(tag => tag.toLowerCase().includes(term));
        const inStatus = project.rawStatus.toLowerCase().includes(term) || project.status.toLowerCase().includes(term);
        const inPriority = project.priority.toLowerCase().includes(term);
        const inAddress = project.address && (
          (project.address.city || '').toLowerCase().includes(term) ||
          (project.address.state || '').toLowerCase().includes(term) ||
          (project.address.street || '').toLowerCase().includes(term)
        );
        return inTitle || inDesc || inTags || inStatus || inPriority || inAddress;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };

  const statusCounts = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  return (
    <StandardPageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Projects"
          subtitle="Manage client projects, track progress, budgets, and timelines."
          titleClassName="text-brand-700 dark:text-brand-400"
          actions={(
            <Link href="/dashboard/projects/new" className="pill pill-tint-blue sm inline-flex items-center gap-2 transition-transform hover:scale-105">
              <PlusIcon className="h-4 w-4" /> New Project
            </Link>
          )}
        />

        {/* Status summary chips with improved spacing */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'All Projects', color: 'pill-tint-neutral', count: projects.length },
            { key: 'planning', label: 'Planning', color: 'pill-tint-blue', count: statusCounts.planning || 0 },
            { key: 'active', label: 'Active', color: 'pill-tint-green', count: statusCounts.active || 0 },
            { key: 'on_hold', label: 'On Hold', color: 'pill-tint-yellow', count: statusCounts.on_hold || 0 },
            { key: 'completed', label: 'Completed', color: 'pill-tint-gray', count: statusCounts.completed || 0 },
            { key: 'cancelled', label: 'Cancelled', color: 'pill-tint-red', count: statusCounts.cancelled || 0 }
          ].map(chip => (
            <button
              key={chip.key}
              onClick={() => setStatusFilter(chip.key)}
              className={`pill sm ${chip.color} transition-all duration-200 hover:scale-105 ${
                statusFilter === chip.key
                  ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md dark:ring-offset-[var(--surface-1)]'
                  : 'hover:shadow-sm'
              }`}
            >
              {chip.label} {chip.count > 0 && `(${chip.count})`}
            </button>
          ))}
          <button
            onClick={() => fetchProjects(true)}
            className="ml-auto pill pill-tint-neutral sm inline-flex items-center gap-2 hover:scale-105 transition-all"
          >
            {refreshing && <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            Refresh
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-700" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-8 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-800 dark:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

  {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-8 text-sm text-red-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                ⚠️
              </div>
              <p className="font-medium">{error}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => fetchProjects()} className="pill pill-tint-red sm">Retry</button>
              <button onClick={() => { setError(null); }} className="pill pill-tint-neutral sm">Dismiss</button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 dark:text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No matching projects</h3>
            <p className="text-gray-800 dark:text-gray-300 mb-8 max-w-md mx-auto">Adjust your filters or create a new project to get started with tracking your construction work.</p>
            <Link
              href="/dashboard/projects/new"
              className="pill pill-tint-blue lg inline-flex items-center gap-2 transition-transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{project.title}</h3>
                      <p className="text-gray-800 dark:text-gray-300 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-700 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/projects/${project._id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-700 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-700 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority Badges with improved spacing */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`pill sm pill-tint-${project.status === 'active' ? 'green' : project.status === 'planning' ? 'blue' : project.status === 'on_hold' ? 'yellow' : project.status === 'cancelled' ? 'red' : 'neutral'}`}>
                      {project.status.replace('_',' ')}
                    </span>
                    <span className={`pill sm pill-tint-${project.priority === 'high' ? 'yellow' : project.priority === 'urgent' ? 'red' : project.priority === 'medium' ? 'blue' : 'neutral'}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Project Details with enhanced layout */}
                  <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200 flex-1">
                    {project.budget && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <CurrencyDollarIcon className="h-4 w-4 mr-3 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Budget: {formatCurrency(project.budget)}</span>
                      </div>
                    )}
                    
                    {project.startDate && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <CalendarIcon className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
                        <span>Start: {formatDate(project.startDate)}</span>
                      </div>
                    )}

                    {project.assignedUsers && project.assignedUsers.length > 0 && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <UserIcon className="h-4 w-4 mr-3 text-purple-600 dark:text-purple-400" />
                        <span>{project.assignedUsers.length} team member{project.assignedUsers.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {project.address && (project.address.city || project.address.state) && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <MapPinIcon className="h-4 w-4 mr-3 text-red-600 dark:text-red-400" />
                        <span className="truncate">
                          {project.address.city}, {project.address.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags with improved styling */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="pill pill-tint-neutral text-xs">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="pill pill-tint-neutral text-xs">
                          +{project.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Footer area with enhanced styling */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50">
                  <span>Updated {formatDate(project.updatedAt)}</span>
                  <button
                    onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                    className="pill pill-tint-blue text-xs hover:scale-105 transition-transform"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StandardPageWrapper>
  );
}
