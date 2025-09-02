'use client';

import { useState, useEffect } from 'react';

interface SystemHealth {
  database: {
    status: string;
    totalUsers: number;
    activeConnections: number;
  };
  server: {
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    nodeVersion: string;
  };
  timestamp: string;
}

export default function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSystemHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      const response = await fetch('/api/admin/system/health', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setHealth(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatMemory = (mb: number) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="text-red-400 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading System Health</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchSystemHealth}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const { database, server } = health;
  const memoryUsagePercent = (server.memory.used / server.memory.total) * 100;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthCard
          title="Database Status"
          value={database.status}
          icon="🗄️"
          status={database.status === 'healthy' ? 'good' : 'bad'}
        />
        <HealthCard
          title="Server Uptime"
          value={formatUptime(server.uptime)}
          icon="⏱️"
          status="good"
        />
        <HealthCard
          title="Memory Usage"
          value={`${memoryUsagePercent.toFixed(1)}%`}
          icon="💾"
          status={memoryUsagePercent > 80 ? 'bad' : memoryUsagePercent > 60 ? 'warning' : 'good'}
          subtitle={`${formatMemory(server.memory.used)} / ${formatMemory(server.memory.total)}`}
        />
        <HealthCard title="Node Version" value={server.nodeVersion} icon="🟢" status="good" />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🗄️</span>
            Database Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  database.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {database.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-medium">{database.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Connections</span>
              <span className="font-medium">{database.activeConnections}</span>
            </div>
          </div>
        </div>

        {/* Server Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🖥️</span>
            Server Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">{formatUptime(server.uptime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory Used</span>
              <span className="font-medium">{formatMemory(server.memory.used)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory Total</span>
              <span className="font-medium">{formatMemory(server.memory.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Node.js Version</span>
              <span className="font-medium">{server.nodeVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Usage Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                memoryUsagePercent > 80
                  ? 'bg-red-500'
                  : memoryUsagePercent > 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${memoryUsagePercent}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium">
              {memoryUsagePercent.toFixed(1)}% ({formatMemory(server.memory.used)})
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchSystemHealth}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🔄 Refresh Status
          </button>
          <button
            onClick={() => window.open('/api/health', '_blank')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            📊 API Health Check
          </button>
          <button
            onClick={() => alert('Database backup feature would be implemented here')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            💾 Backup Database
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-center">
        Last updated: {new Date(health.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

interface HealthCardProps {
  title: string;
  value: string;
  icon: string;
  status: 'good' | 'warning' | 'bad';
  subtitle?: string;
}

function HealthCard({ title, value, icon, status, subtitle }: HealthCardProps) {
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    bad: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${statusColors[status]} rounded-lg p-3 text-white text-xl mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
