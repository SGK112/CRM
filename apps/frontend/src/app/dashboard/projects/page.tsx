'use client';

import { simple } from '@/lib/simple-ui';
import {
    BuildingOfficeIcon,
    CalendarIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

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

const statusConfig = {
  planning: { color: 'warning' as const, icon: ClockIcon, label: 'Planning' },
  active: { color: 'success' as const, icon: CheckCircleIcon, label: 'Active' },
  on_hold: { color: 'neutral' as const, icon: ExclamationTriangleIcon, label: 'On Hold' },
  completed: { color: 'info' as const, icon: CheckCircleIcon, label: 'Completed' },
  cancelled: { color: 'error' as const, icon: XCircleIcon, label: 'Cancelled' },
};

const priorityColors = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  urgent: 'text-red-600 dark:text-red-400',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
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
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } else {
        // Failed to fetch projects
      }
    } catch (error) {
      // Error fetching projects
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(
    project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  if (loading) {
    return (
      <div className={simple.page()}>
        <div className={simple.loading.container}>
          <div className={`${simple.loading.spinner} h-8 w-8`} />
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={simple.text.title()}>Projects</h1>
          <p className={simple.text.body()}>Manage and track your project portfolio</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className={simple.button('primary', 'flex items-center gap-2')}
        >
          <PlusIcon className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className={`${simple.grid.cols4} ${simple.grid.gap} mb-6`}>
        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Projects</p>
              <p className={simple.text.title('text-2xl')}>{stats.total}</p>
            </div>
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Active</p>
              <p className={simple.text.title('text-2xl')}>{stats.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Completed</p>
              <p className={simple.text.title('text-2xl')}>{stats.completed}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Budget</p>
              <p className={simple.text.title('text-2xl')}>${(stats.totalBudget / 1000).toFixed(0)}k</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className={`${simple.grid.cols1} lg:grid-cols-2 xl:grid-cols-3 ${simple.grid.gap}`}>
          {filteredProjects.map((project) => {
            const statusInfo = statusConfig[project.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className={simple.card('hover:scale-[1.02] transition-transform')}
              >
                <div className={simple.section()}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={simple.text.subtitle('mb-2')}>{project.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={simple.badge(statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                        <span className={`text-xs font-medium capitalize ${priorityColors[project.priority]}`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                    <StatusIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>

                  <p className={simple.text.body('mb-4 line-clamp-2')}>{project.description}</p>

                  <div className={`${simple.spacing.xs} mb-4`}>
                    {project.clientName && (
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                        <span className={simple.text.small()}>{project.clientName}</span>
                      </div>
                    )}
                    {project.startDate && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className={simple.text.small()}>Started {formatDate(project.startDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className={simple.text.small()}>Budget</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      <span className={simple.text.small()}>View Details</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={simple.empty.container}>
          <BuildingOfficeIcon className={simple.empty.icon} />
          <h3 className={simple.empty.title}>
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className={simple.empty.description}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/projects/new"
              className={simple.button('primary', 'inline-flex items-center gap-2')}
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
