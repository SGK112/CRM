'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';
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

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  assignedUsers: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  tags: string[];
  files: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
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
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
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
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
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
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Manage your client projects and track progress</p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </Link>
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
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
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
              className="input"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Link
                        href={`/projects/${project._id}`}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/projects/${project._id}/edit`}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                      {project.priority}
                    </span>
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

                    {project.assignedUsers.length > 0 && (
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{project.assignedUsers.length} assigned</span>
                      </div>
                    )}

                    {project.address && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {project.address.city}, {project.address.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
