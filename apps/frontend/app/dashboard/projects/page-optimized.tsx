'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useProjects, Project } from './hooks/useProjects';
import {
  ProjectSearchBar,
  ProjectStatsCard,
  ProjectCard,
  LoadingState,
  ErrorState,
  EmptyState,
} from './components/ProjectComponents';
import { ProjectForm } from './components/ProjectForm';

export default function ProjectsPage() {
  const {
    projects,
    stats,
    loading,
    error,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    filteredProjects,
    setFilters,
    filters,
  } = useProjects();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Memoized stats cards
  const statsCards = useMemo(() => [
    {
      title: 'Total Projects',
      value: stats.total,
      color: 'blue' as const,
    },
    {
      title: 'Active Projects',
      value: stats.active,
      color: 'green' as const,
    },
    {
      title: 'Completed',
      value: stats.completed,
      color: 'blue' as const,
    },
    {
      title: 'Planning',
      value: stats.planning,
      color: 'yellow' as const,
    },
    {
      title: 'Total Budget',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(stats.totalBudget),
      color: 'green' as const,
    },
  ], [stats]);

  // Form handlers
  const handleNewProject = useCallback(() => {
    setEditingProject(null);
    setIsFormOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProject(null);
    setFormLoading(false);
  }, []);

  const handleFormSubmit = useCallback(async (data: Partial<Project>) => {
    setFormLoading(true);
    
    try {
      let result;
      if (editingProject) {
        result = await updateProject(editingProject._id, data);
      } else {
        result = await createProject(data);
      }
      return result;
    } catch (error) {
      return null;
    } finally {
      setFormLoading(false);
    }
  }, [editingProject, updateProject, createProject]);

  // Project actions
  const handleStatusChange = useCallback(async (id: string, status: Project['status']) => {
    await updateProject(id, { status });
  }, [updateProject]);

  const handleDeleteProject = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  }, [deleteProject]);

  // Loading state
  if (loading && projects.length === 0) {
    return (
      <div className="p-6">
        <LoadingState message="Loading projects..." />
      </div>
    );
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <div className="p-6">
        <ErrorState error={error} onRetry={refreshProjects} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your construction projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <ProjectStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Search and Filters */}
      <ProjectSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        onNewProject={handleNewProject}
        onRefresh={refreshProjects}
        loading={loading}
      />

      {/* Error Message */}
      {error && projects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState onNewProject={handleNewProject} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </div>
  );
}