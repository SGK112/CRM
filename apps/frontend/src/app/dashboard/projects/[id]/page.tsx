'use client';

import { simple } from '@/lib/simple-ui';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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
  createdAt?: string;
  updatedAt?: string;
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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/projects/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else if (response.status === 404) {
        setError('Project not found');
      } else {
        setError('Failed to load project');
      }
    } catch (err) {
      setError('An error occurred while loading the project');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (error || !project) {
    return (
      <div className={simple.page()}>
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/projects"
            className={simple.button('ghost', 'flex items-center gap-2')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        <div className={simple.empty.container}>
          <ExclamationTriangleIcon className={simple.empty.icon} />
          <h3 className={simple.empty.title}>
            {error || 'Project not found'}
          </h3>
          <p className={simple.empty.description}>
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/dashboard/projects"
            className={simple.button('primary', 'inline-flex items-center gap-2')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[project.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={simple.page()}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects"
            className={simple.button('ghost', 'flex items-center gap-2')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
        <Link
          href={`/dashboard/projects/${project._id}/edit`}
          className={simple.button('secondary', 'flex items-center gap-2')}
        >
          <PencilIcon className="h-4 w-4" />
          Edit Project
        </Link>
      </div>

      {/* Project Header */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className={simple.text.title('mb-2')}>{project.title}</h1>
              <div className="flex items-center gap-3 mb-2">
                <span className={simple.badge(statusInfo.color)}>
                  {statusInfo.label}
                </span>
                <span className={`text-sm font-medium capitalize ${priorityColors[project.priority]}`}>
                  {project.priority} priority
                </span>
              </div>
            </div>
            <StatusIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
          </div>

          <p className={simple.text.body('mb-4')}>{project.description}</p>

          {project.address && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span className={simple.text.small()}>{project.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Timeline</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className={simple.text.small()}>Start Date</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div>
                  <span className={simple.text.small()}>End Date</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(project.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Budget</h2>
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(project.budget)}
                  </p>
                  <p className={simple.text.small()}>Project Budget</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          {project.clientName && (
            <div className={simple.card()}>
              <div className={simple.section()}>
                <h2 className={simple.text.subtitle('mb-4')}>Client</h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {project.clientName}
                    </p>
                    <Link
                      href={`/dashboard/clients/${project.clientId}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View Client →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Status */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={simple.text.small()}>Current Status</span>
                  <span className={simple.badge(statusInfo.color)}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={simple.text.small()}>Priority</span>
                  <span className={`text-sm font-medium capitalize ${priorityColors[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Project Info</h2>
              <div className="space-y-3">
                <div>
                  <span className={simple.text.small()}>Created</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div>
                  <span className={simple.text.small()}>Last Updated</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
