import { Metadata } from 'next';
import {
  DocumentTextIcon,
  PlayIcon,
  BookOpenIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Documentation | Remodely CRM',
  description: 'Complete guides and API documentation for Remodely CRM.',
};

const docSections = [
  {
    title: 'Getting Started',
    description: 'Quick start guides to get your team up and running.',
    icon: PlayIcon,
    items: [
      { title: 'Initial Setup', href: '#setup', description: 'Set up your account and team' },
      {
        title: 'Importing Data',
        href: '#import',
        description: 'Import existing clients and projects',
      },
      {
        title: 'User Permissions',
        href: '#permissions',
        description: 'Configure team access levels',
      },
      { title: 'Mobile App Setup', href: '#mobile', description: 'Get the mobile apps configured' },
    ],
  },
  {
    title: 'User Guides',
    description: 'Detailed guides for daily operations.',
    icon: BookOpenIcon,
    items: [
      {
        title: 'Project Management',
        href: '#projects',
        description: 'Create and manage construction projects',
      },
      { title: 'Client Relations', href: '#clients', description: 'Manage client communications' },
      {
        title: 'Document Management',
        href: '#documents',
        description: 'Store and organize project files',
      },
      {
        title: 'Scheduling & Calendar',
        href: '#scheduling',
        description: 'Manage crews and timelines',
      },
    ],
  },
  {
    title: 'Advanced Features',
    description: 'Power user features and integrations.',
    icon: DocumentTextIcon,
    items: [
      { title: 'Custom Workflows', href: '#workflows', description: 'Set up automated processes' },
      {
        title: 'Reporting & Analytics',
        href: '#analytics',
        description: 'Generate insights and reports',
      },
      {
        title: 'Third-party Integrations',
        href: '#integrations',
        description: 'Connect with other tools',
      },
      { title: 'API Usage', href: '#api', description: 'Build custom integrations' },
    ],
  },
  {
    title: 'Developer Resources',
    description: 'APIs and technical documentation.',
    icon: CodeBracketIcon,
    items: [
      {
        title: 'REST API Reference',
        href: '#api-reference',
        description: 'Complete API documentation',
      },
      { title: 'Webhooks', href: '#webhooks', description: 'Real-time event notifications' },
      { title: 'SDK Libraries', href: '#sdks', description: 'Official development libraries' },
      { title: 'Example Code', href: '#examples', description: 'Sample implementations' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-6">
            <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Documentation
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know to get the most out of Remodely CRM for your construction
            business.
          </p>
        </div>
      </section>

      {/* Mobile-first Search */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input type="text" placeholder="Search documentation..." className="input pl-10" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Documentation Sections */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {docSections.map((section, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-600/15 ring-1 ring-amber-500/30">
                    <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">{section.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-400">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className="block p-3 rounded-lg border border-slate-700/50 hover:border-amber-500/40 hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm sm:text-base font-medium text-slate-200 group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile-first Quick Start */}
          <div className="mt-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Quick Start Checklist</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Create your account and invite team members',
                  'Import existing client and project data',
                  'Set up user roles and permissions',
                  'Configure project templates and workflows',
                  'Connect third-party integrations',
                  'Train your team on key features',
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-slate-400">{index + 1}</span>
                    </div>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile-first Support CTA */}
          <div className="mt-12 text-center">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">Need Help?</h2>
              <p className="text-slate-400 mb-6 text-sm sm:text-base">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                <a
                  href="/support"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
                >
                  Contact Support
                </a>
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 font-medium text-sm transition"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
