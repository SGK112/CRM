'use client';

import {
    ArrowLeftIcon,
    CalculatorIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Project {
  _id: string;
  title: string;
  description?: string;
  clientId?: string;
  status: string;
  priority: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface Estimate {
  _id: string;
  projectId?: string;
  number: string;
  status: string;
  subtotalSell: number;
  total: number;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchRelated();
  }, [id]);

  async function authHeaders(): Promise<Record<string, string>> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function fetchProject() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`, { headers: await authHeaders() });
      if (res.ok) {
        setProject(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelated() {
    try {
      const res = await fetch(`/api/estimates`, { headers: await authHeaders() });
      if (res.ok) {
        const all = await res.json();
        const filtered = Array.isArray(all) ? all.filter((e: Estimate) => e.projectId === id) : [];
        setEstimates(filtered);
      }
    } catch {
      // ignore errors fetching related estimates
    }
  }

  async function createEstimate() {
    if (!project?.clientId) {
      alert('Add a client to this project before creating an estimate.');
      return;
    }
    try {
      setCreating(true);
      const body = {
        clientId: project.clientId,
        projectId: id,
        items: [{ name: 'New Item', quantity: 1, baseCost: 0, marginPct: 50, taxable: true }],
        discountType: 'percent',
        discountValue: 0,
        taxRate: 0,
        notes: `Estimate for project ${project.title}`,
      };
      const res = await fetch(`/api/estimates`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        router.push(`/dashboard/estimates/${created._id}`);
      } else {
        const txt = await res.text();
        alert(`Failed to create estimate: ${res.status} ${txt}`);
      }
    } finally {
      setCreating(false);
    }
  }

  const budget = useMemo(
    () =>
      project?.budget
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            project.budget
          )
        : '—',
    [project]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/dashboard/invoices/new?projectId=${id}&projectName=${encodeURIComponent(project?.title || '')}`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors duration-200"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Create Invoice
            </Link>
            <Link
              href={`/dashboard/estimates/new?projectId=${id}&projectName=${encodeURIComponent(project?.title || '')}`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
            >
              <CalculatorIcon className="h-4 w-4" />
              Create Estimate
            </Link>
          </div>
        </div>

        {loading && (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        )}

        {!loading && project && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">{project.title}</h1>
                <p className="text-blue-100 dark:text-blue-200 text-lg">
                  {project.description || 'No description provided'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200 dark:text-blue-300 mb-1">Total Budget</div>
                <div className="text-2xl font-bold text-white">{budget}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && project && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Budget</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{budget}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Start Date</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">End Date</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : 'Not set'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="h-5 w-5 rounded-full bg-orange-600 dark:bg-orange-400"></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Status</div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {project.status?.replace('_', ' ') || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={createEstimate}
                  disabled={creating}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                    <PlusIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Create Estimate</div>
                    <div className="text-sm text-green-100 dark:text-green-200">
                      Generate quick estimate
                    </div>
                  </div>
                </button>

                <Link
                  href={`/dashboard/estimates/new?projectId=${id}${project.clientId ? `&clientId=${project.clientId}` : ''}`}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">New Estimate</div>
                    <div className="text-sm text-blue-100 dark:text-blue-200">
                      Detailed estimate form
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/invoices/new?projectId=${id}${project.clientId ? `&clientId=${project.clientId}` : ''}`}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Create Invoice</div>
                    <div className="text-sm text-amber-100 dark:text-amber-200">
                      Bill for this project
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/calendar?project=${id}${project.clientId ? `&client=${project.clientId}` : ''}`}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Schedule Meeting</div>
                    <div className="text-sm text-purple-100 dark:text-purple-200">
                      Book appointment
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimates Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Estimates
                </h3>
                <Link
                  href="/dashboard/estimates"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                >
                  View all
                </Link>
              </div>

              {estimates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-700" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    No estimates created yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-700 text-xs mt-1">
                    Create your first estimate to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {estimates.slice(0, 5).map(estimate => (
                    <div
                      key={estimate._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <DocumentTextIcon className="h-4 w-4 text-gray-800 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            #{estimate.number}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {estimate.status}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/estimates/${estimate._id}`}
                        className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
