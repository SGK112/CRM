'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  StandardPageWrapper,
  StandardCard,
  StandardSection,
  StandardButton,
  StandardStat,
} from '../../../components/ui/StandardPageWrapper';
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
  TrashIcon,
} from '@heroicons/react/24/outline';

// Backend schema differs from original assumed shape. We'll create a normalized internal representation.
interface RawProject {
  [key: string]: any;
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  clientId: string;
  assignedTo?: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
  workspaceId: string;
  address?: any;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

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
    city?: string;
    state?: string;
    street?: string;
    zipCode?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
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
    priority: (['low', 'medium', 'high', 'urgent'].includes(p.priority)
      ? p.priority
      : 'medium') as Project['priority'],
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
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-600/20 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-600/20 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-600/20 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, priorityFilter]);

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
        const normalized = Array.isArray(data) ? data.map(normalizeProject) : [];
        setProjects(normalized);
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.tags.some(tag => tag.toLowerCase().includes(term))
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

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Total Projects',
        value: projects.length,
        color: 'default' as const,
        icon: <BuildingOfficeIcon className="h-6 w-6" />,
      },
      {
        label: 'Active Projects',
        value: projects.filter(p => p.status === 'active').length,
        color: 'green' as const,
        icon: <CalendarIcon className="h-6 w-6" />,
      },
      {
        label: 'Planning Phase',
        value: projects.filter(p => p.status === 'planning').length,
        color: 'blue' as const,
        icon: <UserIcon className="h-6 w-6" />,
      },
      {
        label: 'Total Budget',
        value: `$${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}`,
        color: 'purple' as const,
        icon: <CurrencyDollarIcon className="h-6 w-6" />,
      },
    ],
    [projects]
  );

  if (loading) {
    return (
      <StandardPageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper>
      <StandardSection
        title="Projects"
        subtitle="Manage your remodeling projects from planning to completion"
        headerActions={
          <Link href="/dashboard/projects/new">
            <StandardButton icon={<PlusIcon className="h-4 w-4" />}>New Project</StandardButton>
          </Link>
        }
      >
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StandardStat key={index} {...stat} />
          ))}
        </div>

        {/* Status Filters */}
        <StandardCard className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-4">
              Filter by Status:
            </h3>
            {[
              { key: 'all', label: 'All' },
              { key: 'planning', label: 'Planning' },
              { key: 'active', label: 'Active' },
              { key: 'on_hold', label: 'On Hold' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map(status => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  statusFilter === status.key
                    ? 'ring-2 ring-red-500 border-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                } ${
                  status.key === 'all'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : statusColors[status.key as keyof typeof statusColors]
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </StandardCard>

        {/* Search and Filters */}
        <StandardCard className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Reset Button */}
            <StandardButton
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              disabled={!searchTerm && statusFilter === 'all' && priorityFilter === 'all'}
            >
              Reset Filters
            </StandardButton>
          </div>
        </StandardCard>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <StandardCard className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get started by creating your first project.
            </p>
            <Link href="/dashboard/projects/new">
              <StandardButton icon={<PlusIcon className="h-4 w-4" />}>
                Create Project
              </StandardButton>
            </Link>
          </StandardCard>
        ) : (
          <StandardCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map(project => (
                    <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}
                        >
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[project.priority]}`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {project.budget ? `$${project.budget.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/projects/${project._id}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/dashboard/projects/${project._id}/edit`}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => deleteProject(project._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StandardCard>
        )}
      </StandardSection>
    </StandardPageWrapper>
  );
}
