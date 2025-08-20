import { Metadata } from 'next'
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'System Status | Remodely CRM',
  description: 'Current status and uptime information for Remodely CRM systems and services.'
}

const systems = [
  {
    name: 'Web Application',
    status: 'operational',
    uptime: '99.9%',
    lastChecked: '2 minutes ago',
    description: 'Main Remodely CRM web application'
  },
  {
    name: 'API Services',
    status: 'operational',
    uptime: '99.8%',
    lastChecked: '1 minute ago',
    description: 'REST API and data synchronization'
  },
  {
    name: 'File Storage',
    status: 'operational',
    uptime: '100%',
    lastChecked: '30 seconds ago',
    description: 'Document and media file storage'
  },
  {
    name: 'Email Delivery',
    status: 'operational',
    uptime: '99.7%',
    lastChecked: '5 minutes ago',
    description: 'Automated emails and notifications'
  },
  {
    name: 'Mobile Sync',
    status: 'maintenance',
    uptime: '99.5%',
    lastChecked: '10 minutes ago',
    description: 'Mobile app data synchronization'
  },
  {
    name: 'Backup Systems',
    status: 'operational',
    uptime: '100%',
    lastChecked: '1 hour ago',
    description: 'Data backup and recovery systems'
  }
]

const incidents = [
  {
    title: 'Scheduled Maintenance - Mobile Sync',
    status: 'ongoing',
    impact: 'low',
    startTime: '2024-01-15 10:00 UTC',
    description: 'We are performing routine maintenance on our mobile synchronization services. The mobile app may experience slower sync times during this period.',
    updates: [
      {
        time: '10:30 UTC',
        message: 'Maintenance is proceeding as scheduled. Most users should not notice any impact.'
      },
      {
        time: '10:00 UTC',
        message: 'Maintenance has begun. Expected completion time is 2:00 PM UTC.'
      }
    ]
  },
  {
    title: 'API Performance Issues Resolved',
    status: 'resolved',
    impact: 'medium',
    startTime: '2024-01-14 08:15 UTC',
    endTime: '2024-01-14 09:45 UTC',
    description: 'Some users experienced slower API response times. The issue has been identified and resolved.',
    updates: [
      {
        time: '09:45 UTC',
        message: 'Issue fully resolved. All systems are operating normally.'
      },
      {
        time: '09:20 UTC',
        message: 'Performance improvements deployed. Monitoring for full resolution.'
      },
      {
        time: '08:30 UTC',
        message: 'Issue identified. Working on a fix.'
      }
    ]
  }
]

const uptime30Days = [
  { date: '01/01', uptime: 100 },
  { date: '01/02', uptime: 99.8 },
  { date: '01/03', uptime: 100 },
  { date: '01/04', uptime: 100 },
  { date: '01/05', uptime: 99.9 },
  { date: '01/06', uptime: 100 },
  { date: '01/07', uptime: 100 },
  { date: '01/08', uptime: 99.7 },
  { date: '01/09', uptime: 100 },
  { date: '01/10', uptime: 100 },
  { date: '01/11', uptime: 100 },
  { date: '01/12', uptime: 99.9 },
  { date: '01/13', uptime: 100 },
  { date: '01/14', uptime: 98.5 },
  { date: '01/15', uptime: 99.5 }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'operational':
      return <CheckCircleIcon className="w-4 h-4 text-green-400" />
    case 'maintenance':
      return <ClockIcon className="w-4 h-4 text-amber-400" />
    case 'degraded':
      return <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
    case 'outage':
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
    default:
      return <ArrowPathIcon className="w-4 h-4 text-slate-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'operational':
      return 'bg-green-500/10 text-green-400 border-green-500/30'
    case 'maintenance':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'degraded':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    case 'outage':
      return 'bg-red-500/10 text-red-400 border-red-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

function getIncidentStatusColor(status: string) {
  switch (status) {
    case 'ongoing':
      return 'bg-amber-500/10 text-amber-400'
    case 'resolved':
      return 'bg-green-500/10 text-green-400'
    case 'investigating':
      return 'bg-blue-500/10 text-blue-400'
    default:
      return 'bg-slate-500/10 text-slate-400'
  }
}

function getIncidentImpactColor(impact: string) {
  switch (impact) {
    case 'low':
      return 'text-green-400'
    case 'medium':
      return 'text-amber-400'
    case 'high':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

export default function StatusPage() {
  const overallStatus = systems.some(s => s.status === 'outage') ? 'outage' :
                       systems.some(s => s.status === 'degraded') ? 'degraded' :
                       systems.some(s => s.status === 'maintenance') ? 'maintenance' : 'operational'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-green-600/15 ring-1 ring-green-500/30 mb-6">
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
              System Status
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              {getStatusIcon(overallStatus)}
              <span className={`text-lg font-medium capitalize ${
                overallStatus === 'operational' ? 'text-green-400' :
                overallStatus === 'maintenance' ? 'text-amber-400' :
                overallStatus === 'degraded' ? 'text-orange-400' : 'text-red-400'
              }`}>
                All Systems {overallStatus}
              </span>
            </div>
            <p className="text-slate-400 text-sm sm:text-base">
              Current status and performance metrics for all Remodely CRM services.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile-first System Status */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">Service Status</h2>
          <div className="space-y-3">
            {systems.map((system, index) => (
              <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(system.status)}
                    <div>
                      <h3 className="font-medium text-slate-200 mb-1">{system.name}</h3>
                      <p className="text-sm text-slate-400">{system.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="font-medium text-green-400">{system.uptime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(system.status)}`}>
                        {system.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Checked {system.lastChecked}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Incidents */}
      {incidents.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Recent Incidents</h2>
            <div className="space-y-6">
              {incidents.map((incident, index) => (
                <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-medium text-slate-200 mb-2">{incident.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`text-xs font-medium ${getIncidentImpactColor(incident.impact)}`}>
                          {incident.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{incident.description}</p>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {incident.startTime}
                      {incident.endTime && ` - ${incident.endTime}`}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">Updates</h4>
                    {incident.updates.map((update, updateIndex) => (
                      <div key={updateIndex} className="flex gap-3 pl-4 border-l-2 border-slate-700">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-500 mb-1">{update.time}</div>
                          <p className="text-sm text-slate-300">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile-first Uptime Chart */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">30-Day Uptime History</h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
            <div className="flex items-end justify-between gap-1 h-32 mb-4">
              {uptime30Days.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-sm ${
                      day.uptime >= 99.5 ? 'bg-green-500' :
                      day.uptime >= 98 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${day.uptime}%` }}
                  />
                  <span className="text-xs text-slate-500 rotate-45 origin-center mt-2">
                    {day.date}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="text-slate-400">99.5%+ uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                  <span className="text-slate-400">98-99.5% uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-slate-400">&lt;98% uptime</span>
                </div>
              </div>
              <div className="text-slate-400">
                Average uptime: <span className="text-green-400 font-medium">99.7%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Subscribe to Updates */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              Subscribe to receive notifications about system status changes and scheduled maintenance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
              />
              <button className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
