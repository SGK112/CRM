'use client';

import React, { memo, useEffect, useState } from 'react';
import { FiExternalLink, FiPlus, FiBriefcase, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description?: string;
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

interface ClientProjectsProps {
  clientId: string;
  clientName?: string;
  showCreateButton?: boolean;
  maxProjects?: number;
}

export const ClientProjects = memo(function ClientProjects({
  clientId,
  clientName,
  showCreateButton = true,
  maxProjects = 5
}: ClientProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = await response.json();
        const projectsData = Array.isArray(data) ? data : data.projects || [];
        
        // Filter projects for this client
        const clientProjects = projectsData.filter((project: Project) => 
          project.clientId === clientId || project.clientName === clientName
        );

        setProjects(clientProjects.slice(0, maxProjects));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (clientId || clientName) {
      fetchProjects();
    }
  }, [clientId, clientName, maxProjects]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiBriefcase className="h-5 w-5 mr-2" />
            Projects
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiBriefcase className="h-5 w-5 mr-2" />
            Projects
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiBriefcase className="h-5 w-5 mr-2" />
          Projects ({projects.length})
        </h3>
        <div className="flex items-center space-x-2">
          {projects.length > 0 && (
            <Link 
              href="/dashboard/projects"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View All
              <FiExternalLink className="h-3 w-3 ml-1" />
            </Link>
          )}
          {showCreateButton && (
            <Link 
              href={`/dashboard/projects?clientId=${clientId}&clientName=${encodeURIComponent(clientName || '')}&action=create`}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="h-3 w-3 mr-1" />
              Add Project
            </Link>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <FiBriefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
          {showCreateButton && (
            <Link 
              href={`/dashboard/projects?clientId=${clientId}&clientName=${encodeURIComponent(clientName || '')}&action=create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Create First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {project.title}
                  </h4>
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                <div className="flex items-center space-x-4">
                  {project.budget && (
                    <div className="flex items-center">
                      <FiDollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(project.budget)}
                    </div>
                  )}
                  {project.startDate && (
                    <div className="flex items-center">
                      <FiCalendar className="h-3 w-3 mr-1" />
                      {formatDate(project.startDate)}
                    </div>
                  )}
                </div>
                <Link 
                  href={`/dashboard/projects?projectId=${project._id}&action=view`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View
                  <FiExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});