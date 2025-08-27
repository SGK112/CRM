'use client';

import { useState, useEffect, useMemo } from 'react';
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
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid, StandardButton, StandardStat } from '../../../components/ui/StandardPageWrapper';

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
  assignedUsers: string[];
  address?: {
    city?: string; 
    state?: string; 
    street?: string; 
    zipCode?: string;
  };
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (error) {
      setError('Network error while fetching projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
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
        headers: { 'Authorization': `Bearer ${token}` },
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

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'blue';
      case 'active': return 'green';
      case 'on_hold': return 'orange';
      case 'completed': return 'default';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'default';
    }
  };

  const statusCounts = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  if (loading) {
    return (
      <StandardPageWrapper>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading projects...</p>
            </div>
          </div>
          <StandardGrid cols={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <StandardCard key={i} className="animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </StandardCard>
            ))}
          </StandardGrid>
        </div>
      </StandardPageWrapper>
    );
  }

  if (error) {
    return (
      <StandardPageWrapper>
        <StandardCard className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{error}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please try again or contact support if the problem persists.</p>
          <StandardButton onClick={() => fetchProjects()}>
            Try Again
          </StandardButton>
        </StandardCard>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage client projects, track progress, budgets, and timelines.
            </p>
          </div>
          <StandardButton as={Link} href="/dashboard/projects/new" icon={<PlusIcon className="h-4 w-4" />}>
            New Project
          </StandardButton>
        </div>

        {/* Stats */}
        <StandardGrid cols={4}>
          <StandardStat
            label="Total Projects"
            value={projects.length}
            color="blue"
            icon={<BuildingOfficeIcon className="h-6 w-6" />}
          />
          <StandardStat
            label="Active Projects"
            value={statusCounts.active || 0}
            color="green"
            icon={<CalendarIcon className="h-6 w-6" />}
          />
          <StandardStat
            label="Completed"
            value={statusCounts.completed || 0}
            color="default"
            icon={<CalendarIcon className="h-6 w-6" />}
          />
          <StandardStat
            label="Total Budget"
            value={formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
            color="green"
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
          />
        </StandardGrid>

        {/* Filters */}
        <StandardCard>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <StandardButton
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </StandardButton>
              <StandardButton
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </StandardButton>
            </div>
          </div>
        </StandardCard>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All Projects', count: projects.length },
            { key: 'planning', label: 'Planning', count: statusCounts.planning || 0 },
            { key: 'active', label: 'Active', count: statusCounts.active || 0 },
            { key: 'on_hold', label: 'On Hold', count: statusCounts.on_hold || 0 },
            { key: 'completed', label: 'Completed', count: statusCounts.completed || 0 },
            { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled || 0 }
          ].map(chip => (
            <button
              key={chip.key}
              onClick={() => setStatusFilter(chip.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                statusFilter === chip.key
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {chip.label} ({chip.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredProjects.length === 0 ? (
          <StandardCard className="text-center py-20">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No matching projects</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Adjust your filters or create a new project to get started with tracking your construction work.
            </p>
            <StandardButton as={Link} href="/dashboard/projects/new" icon={<PlusIcon className="h-5 w-5" />}>
              Create Project
            </StandardButton>
          </StandardCard>
        ) : (
          <StandardGrid cols={viewMode === 'grid' ? 3 : 1}>
            {filteredProjects.map((project) => (
              <StandardCard key={project._id} hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <StandardButton
                      variant="ghost"
                      size="sm"
                      as={Link}
                      href={`/dashboard/projects/${project._id}`}
                      icon={<EyeIcon className="h-4 w-4" />}
                    >
                      View
                    </StandardButton>
                    <StandardButton
                      variant="ghost"
                      size="sm"
                      as={Link}
                      href={`/dashboard/projects/${project._id}/edit`}
                      icon={<PencilIcon className="h-4 w-4" />}
                    >
                      Edit
                    </StandardButton>
                    <StandardButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project._id)}
                      icon={<TrashIcon className="h-4 w-4" />}
                    >
                      Delete
                    </StandardButton>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center gap-3 mb-4">
                  <StandardStat
                    label="Status"
                    value={project.status.replace('_', ' ')}
                    color={getStatusColor(project.status)}
                  />
                  <StandardStat
                    label="Priority"
                    value={project.priority}
                    color={getPriorityColor(project.priority)}
                  />
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  {project.budget && (
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--success)' }}
                      />
                      <span className="font-medium">Budget: {formatCurrency(project.budget)}</span>
                    </div>
                  )}
                  
                  {project.startDate && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--info)' }}
                      />
                      <span>Start: {formatDate(project.startDate)}</span>
                    </div>
                  )}

                  {project.assignedUsers && project.assignedUsers.length > 0 && (
                    <div className="flex items-center gap-3">
                      <UserIcon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--accent)' }}
                      />
                      <span>{project.assignedUsers.length} team member{project.assignedUsers.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {project.address && (project.address.city || project.address.state) && (
                    <div className="flex items-center gap-3">
                      <MapPinIcon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--error)' }}
                      />
                      <span className="truncate">
                        {project.address.city}, {project.address.state}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div 
                  className="mt-6 pt-4 border-t flex items-center justify-between text-xs"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Updated {formatDate(project.updatedAt)}</span>
                  <StandardButton
                    size="sm"
                    as={Link}
                    href={`/dashboard/projects/${project._id}`}
                  >
                    View Details
                  </StandardButton>
                </div>
              </StandardCard>
            ))}
          </StandardGrid>
        )}
      </div>
    </StandardPageWrapper>
  );
}
