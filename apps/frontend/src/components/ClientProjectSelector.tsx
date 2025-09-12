'use client';

import { useRouter } from 'next/navigation';
import ClientSelector from '@/components/ClientSelector';
import { Client, Project } from '@/types/shared';

interface ClientProjectSelectorProps {
  selectedClientId: string;
  selectedProjectId: string;
  onClientSelect: (clientId: string) => void;
  onProjectSelect: (projectId: string) => void;
  clients: Client[];
  projects: Project[];
  onRefreshClients?: () => void;
  onRefreshProjects?: () => void;
  className?: string;
}

export default function ClientProjectSelector({
  selectedClientId,
  selectedProjectId,
  onClientSelect,
  onProjectSelect,
  clients,
  projects,
  onRefreshClients,
  onRefreshProjects,
  className = '',
}: ClientProjectSelectorProps) {
  const router = useRouter();

  // Filter projects by selected client
  const filteredProjects = selectedClientId 
    ? projects.filter(p => p.clientId === selectedClientId)
    : projects;

  // Get selected client and project for display
  const selectedClient = clients.find(c => c._id === selectedClientId);
  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className={`grid md:grid-cols-3 gap-4 ${className}`}>
      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Select Client *
        </label>
        <ClientSelector
          selectedClientId={selectedClientId}
          onClientSelect={(clientId) => {
            onClientSelect(clientId);
            // Clear project selection when client changes
            if (clientId !== selectedClientId) {
              onProjectSelect('');
            }
          }}
          clients={clients}
          onRefreshClients={onRefreshClients}
          required
        />
        {selectedClient && (
          <div className="mt-2 text-xs text-[var(--text-dim)]">
            <button
              onClick={() => router.push(`/dashboard/clients/${selectedClient._id}`)}
              className="text-brand-600 hover:text-brand-700 underline"
            >
              View Client Details →
            </button>
          </div>
        )}
      </div>

      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Select Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onProjectSelect(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          disabled={!selectedClientId || filteredProjects.length === 0}
        >
          <option value="">
            {!selectedClientId 
              ? 'Select a client first' 
              : filteredProjects.length === 0 
                ? 'No projects available' 
                : 'Select a project (optional)'
            }
          </option>
          {filteredProjects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
              {project.status && ` (${project.status})`}
            </option>
          ))}
        </select>
        
        {selectedClientId && (
          <div className="mt-2 space-y-1">
            <button
              onClick={() => router.push(`/dashboard/projects/new?clientId=${selectedClientId}`)}
              className="text-xs text-brand-600 hover:text-brand-700 underline block"
            >
              + Create New Project for this Client
            </button>
            {selectedProject && (
              <button
                onClick={() => router.push(`/dashboard/projects/${selectedProject._id}`)}
                className="text-xs text-brand-600 hover:text-brand-700 underline block"
              >
                View Project Details →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Quick Actions
        </label>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard/clients/new')}
            className="w-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            + New Client
          </button>
          <button
            onClick={() => router.push('/dashboard/clients')}
            className="w-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            View All Clients
          </button>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="w-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
}
