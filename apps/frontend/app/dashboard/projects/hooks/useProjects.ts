'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Project {
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

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onHold: number;
  cancelled: number;
  totalBudget: number;
}

export interface ProjectFilters {
  status?: string;
  search?: string;
  clientId?: string;
  priority?: string;
}

interface UseProjectsReturn {
  projects: Project[];
  stats: ProjectStats;
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Promise<Project | null>;
  filteredProjects: Project[];
  setFilters: (filters: ProjectFilters) => void;
  filters: ProjectFilters;
}

export function useProjects(): UseProjectsReturn {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const router = useRouter();

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const calculateStats = useCallback((projectList: Project[]): ProjectStats => {
    return {
      total: projectList.length,
      active: projectList.filter(p => p.status === 'active').length,
      completed: projectList.filter(p => p.status === 'completed').length,
      planning: projectList.filter(p => p.status === 'planning').length,
      onHold: projectList.filter(p => p.status === 'on_hold').length,
      cancelled: projectList.filter(p => p.status === 'cancelled').length,
      totalBudget: projectList.reduce((sum, p) => sum + (p.budget || 0), 0),
    };
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/projects', {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      const projectsData = Array.isArray(data) ? data : data.projects || [];
      
      setProjects(projectsData);
      setStats(calculateStats(projectsData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, calculateStats]);

  const createProject = useCallback(async (data: Partial<Project>): Promise<Project | null> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }

      const newProject = await response.json();
      setProjects(prev => [...prev, newProject]);
      setStats(calculateStats([...projects, newProject]));
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      return null;
    }
  }, [getAuthHeader, calculateStats, projects]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status}`);
      }

      const updatedProject = await response.json();
      setProjects(prev => prev.map(p => p._id === id ? updatedProject : p));
      setStats(calculateStats(projects.map(p => p._id === id ? updatedProject : p)));
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      return null;
    }
  }, [getAuthHeader, calculateStats, projects]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status}`);
      }

      setProjects(prev => prev.filter(p => p._id !== id));
      setStats(calculateStats(projects.filter(p => p._id !== id)));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeader, calculateStats, projects]);

  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      return null;
    }
  }, [getAuthHeader]);

  const filteredProjects = useCallback(() => {
    return projects.filter(project => {
      if (filters.status && filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.clientName?.toLowerCase().includes(searchLower) ||
          project.address?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      if (filters.clientId && project.clientId !== filters.clientId) {
        return false;
      }
      
      if (filters.priority && project.priority !== filters.priority) {
        return false;
      }
      
      return true;
    });
  }, [projects, filters])();

  // Initial load
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return {
    projects,
    stats,
    loading,
    error,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    filteredProjects,
    setFilters,
    filters,
  };
}