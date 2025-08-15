'use client'

const integrations = [
  { name: 'QuickBooks', logo: '/api/placeholder/40/40', description: 'Sync finances automatically' },
  { name: 'Google Calendar', logo: '/api/placeholder/40/40', description: 'Schedule appointments seamlessly' },
  { name: 'Stripe', logo: '/api/placeholder/40/40', description: 'Accept payments online' },
  { name: 'Gmail', logo: '/api/placeholder/40/40', description: 'Email integration' },
  { name: 'Twilio', logo: '/api/placeholder/40/40', description: 'SMS notifications' },
  { name: 'Cloudinary', logo: '/api/placeholder/40/40', description: 'Photo storage & sharing' }
]

export function Integrations() {
  return (
    <div className="bg-slate-900/60 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            Seamlessly Integrate with Your Existing Tools
          </h2>
          <p className="text-lg text-slate-400">
            Connect with the tools you already use and love
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <div key={index} className="bg-slate-900/60 rounded-lg p-4 text-center shadow-sm hover:shadow-lg hover:shadow-amber-600/10 border border-slate-800 hover:border-amber-500/40 transition">
              <img 
                src={integration.logo} 
                alt={integration.name}
                className="w-10 h-10 mx-auto mb-2"
              />
              <h4 className="text-sm font-medium text-slate-200 mb-1">
                {integration.name}
              </h4>
              <p className="text-xs text-slate-500">
                {integration.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
