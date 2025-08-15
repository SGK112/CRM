'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '../../../components/Layout';
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
import { API_BASE } from '@/lib/api';

// Backend schema differs from original assumed shape. We'll create a normalized internal representation.
interface RawProject { [key:string]: any; _id: string; title: string; description?: string; status: string; priority: string; clientId: string; assignedTo?: string[]; startDate?: string; endDate?: string; budget?: number; workspaceId: string; address?: any; createdAt?: string; updatedAt?: string; }

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
    // optional: refresh every 2 minutes
    const id = setInterval(() => fetchProjects(true), 120000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, priorityFilter]);

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

      const response = await fetch(`${API_BASE}/projects`, {
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        (project.tags || []).some(tag => tag.toLowerCase().includes(term)) ||
        project.rawStatus.toLowerCase().includes(term)
      );
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
      const response = await fetch(`${API_BASE}/projects/${id}`, {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex gap-1 flex-wrap">
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-10 bg-gray-200 rounded" />
        <div className="h-5 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
            <p className="text-gray-600 mt-2 text-sm">Manage your client projects, track progress, budgets, timelines and documentation.</p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </Link>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text)]' },
            { key: 'planning', label: `Planning (${statusCounts.planning || 0})`, color: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300' },
            { key: 'active', label: `Active (${statusCounts.active || 0})`, color: 'bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300' },
            { key: 'on_hold', label: `On Hold (${statusCounts.on_hold || 0})`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
            { key: 'completed', label: `Completed (${statusCounts.completed || 0})`, color: 'bg-gray-200 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]' },
            { key: 'cancelled', label: `Cancelled (${statusCounts.cancelled || 0})`, color: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300' }
          ].map(chip => (
            <button
              key={chip.key}
              onClick={() => setStatusFilter(chip.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                statusFilter === chip.key
                  ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500 shadow-sm dark:ring-offset-[var(--surface-1)]'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-[var(--border)]'
              } ${chip.color}`}
            >
              {chip.label}
            </button>
          ))}
          <button
            onClick={() => fetchProjects(true)}
            className="ml-auto text-xs px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2"
          >
            {refreshing && <span className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-sm text-red-700 space-y-3">
            <p className="font-medium">{error}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchProjects()} className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700">Retry</button>
              <button onClick={() => { setError(null); }} className="px-3 py-1.5 text-xs rounded-md border border-red-300 bg-white hover:bg-red-100">Dismiss</button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching projects</h3>
            <p className="text-gray-600 mb-6 text-sm">Adjust your filters or create a new project to get started.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">{project.title}</h3>
                      <p className="text-gray-600 text-xs line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/projects/${project._id}/edit`}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`pill pill-tint-${project.status === 'active' ? 'green' : project.status === 'planning' ? 'blue' : project.status === 'on_hold' ? 'yellow' : project.status === 'cancelled' ? 'red' : 'neutral'} sm`}>{project.status.replace('_',' ')}</span>
                    <span className={`pill pill-tint-${project.priority === 'high' ? 'yellow' : project.priority === 'urgent' ? 'red' : project.priority === 'medium' ? 'blue' : 'neutral'} sm`}>{project.priority}</span>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {project.budget && (
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        <span>Budget: {formatCurrency(project.budget)}</span>
                      </div>
                    )}
                    
                    {project.startDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Start: {formatDate(project.startDate)}</span>
                      </div>
                    )}

                    {project.assignedUsers && project.assignedUsers.length > 0 && (
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{project.assignedUsers.length} assigned</span>
                      </div>
                    )}

                    {project.address && (project.address.city || project.address.state) && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {project.address.city}, {project.address.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]">
                          +{project.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* Footer area */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 rounded-b-lg">
                  <span>Updated {formatDate(project.updatedAt)}</span>
                  <button
                    onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                    className="text-blue-600 hover:underline font-medium"
                  >Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
