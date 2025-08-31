'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { simple } from '../../../lib/simple-ui';

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

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

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
          'Content-Type': 'application/json'
        }
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
  };

  useEffect(() => {
    fetchProjects();
  }, [router]);  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={simple.page()}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={simple.text.title()}>Projects</h1>
        <p className={simple.text.body()}>
          Manage and track your project portfolio
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>

        {/* Add Project Button */}
        <Link
          href="/dashboard/projects/new"
          className={simple.button('primary', 'inline-flex items-center')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Quick Stats */}
      <div className={simple.grid.cols4 + ' mb-8'}>
        <div className={simple.card('p-6')}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projects.length}
          </div>
          <div className={simple.text.small()}>
            Total Projects
          </div>
        </div>
        <div className={simple.card('p-6')}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projects.filter(p => p.status === 'active').length}
          </div>
          <div className={simple.text.small()}>
            Active Projects
          </div>
        </div>
        <div className={simple.card('p-6')}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projects.filter(p => p.status === 'completed').length}
          </div>
          <div className={simple.text.small()}>
            Completed
          </div>
        </div>
        <div className={simple.card('p-6')}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
          </div>
          <div className={simple.text.small()}>
            Total Budget
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project._id} className={simple.card('p-6')}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={simple.text.subtitle()}>
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className={simple.text.body('mb-4')}>
                    {project.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {project.clientName && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {project.clientName}
                      </div>
                    )}
                    
                    {project.budget && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        {formatCurrency(project.budget)}
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(project.startDate)}
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Link
                    href={`/dashboard/projects/${project._id}`}
                    className={simple.button('secondary', 'inline-flex items-center')}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={simple.card('text-center py-12')}>
          <div className="text-gray-400 mb-4">
            <BuildingOfficeIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className={simple.text.subtitle('mb-2')}>
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className={simple.text.body('mb-6')}>
            {searchTerm 
              ? `No projects match "${searchTerm}". Try a different search term.`
              : 'Get started by creating your first project.'
            }
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/projects/new"
              className={simple.button('primary', 'inline-flex items-center')}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
