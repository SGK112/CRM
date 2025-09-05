import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, StarIcon as StarIconSolid, CurrencyDollarIcon as CurrencyDollarIconSolid, ChartBarIcon } from '@heroicons/react/24/solid';

// Server-side fetch wrapper - Next.js server component
async function fetchEntityServer(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/clients/${id}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
    if (res.status === 401) {
      // Provide a safe fallback in development when backend requires auth
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        return {
          _id: id,
          type: 'client',
          firstName: 'Demo',
          lastName: 'Client',
          email: 'demo@example.com',
          phone: '555-555-5555',
          company: 'Demo Co',
          address: { street: '123 Dev St', city: 'Localtown', state: 'CA', zipCode: '94107', country: 'USA' },
          notes: 'Server-side mock for development when backend auth blocks requests.',
          tags: ['demo', 'dev'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalProjects: 3,
          totalValue: 12500,
          rating: 4.2
        };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default async function Page({ params }: { params: { id: string } }) {
  const entity = await fetchEntityServer(params.id);

  if (!entity) {
    // Let Next render the usual client placeholder/loading flow when there's no entity
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  // Server-rendered markup for preview (static, non-interactive). This ensures SSR shows the refactor.
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link href="/dashboard/clients" className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-[var(--text-dim)]" />
              </Link>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border bg-blue-100 text-blue-800 border-blue-200`}>
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[var(--text)]">{entity.firstName} {entity.lastName}</h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                    <span className="capitalize">{entity.type}</span>
                    {entity.company && (<><span>•</span><span>{entity.company}</span></>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="btn btn-amber-outline">Quick Actions</div>
              <div className="btn btn-gray-outline">Edit</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Status</p>
                <div className="flex items-center gap-2 mt-1"><CheckCircleIconSolid className="h-5 w-5 text-green-500" /><span className="font-semibold text-[var(--text)] capitalize">{entity.status}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Total Value</p>
                <p className="text-2xl font-bold text-[var(--text)]">${entity.totalValue?.toLocaleString?.() ?? entity.totalValue ?? '0'}</p>
              </div>
              <CurrencyDollarIconSolid className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-[var(--text-dim)]">Projects</p><p className="text-2xl font-bold text-[var(--text)]">{entity.totalProjects || 0}</p></div><ChartBarIcon className="h-8 w-8 text-blue-500" /></div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-[var(--text-dim)]">Rating</p><div className="flex items-center gap-1 mt-1">{Array.from({ length: 5 }).map((_, i) => (<StarIconSolid key={i} className={`h-4 w-4 ${i < (entity.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />))}<span className="ml-2 text-sm text-[var(--text-dim)]">{entity.rating?.toFixed?.(1) ?? 'N/A'}</span></div></div></div>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <div className="border-b border-[var(--border)]">
            <nav className="flex space-x-4 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
              <div className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 border-amber-500 text-amber-600">Overview</div>
              <div className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 text-[var(--text-dim)]">Communications</div>
              <div className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 text-[var(--text-dim)]">Documents</div>
            </nav>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Contact Information</h3>
                  <div className="space-y-3">
                    {entity.email && (<div className="flex items-center gap-3"><EnvelopeIcon className="h-5 w-5 text-[var(--text-dim)]" /><a href={`mailto:${entity.email}`} className="text-blue-600 hover:underline">{entity.email}</a></div>)}
                    {entity.phone && (<div className="flex items-center gap-3"><PhoneIcon className="h-5 w-5 text-[var(--text-dim)]" /><a href={`tel:${entity.phone}`} className="text-blue-600 hover:underline">{entity.phone}</a></div>)}
                    {entity.address && (<div className="flex items-start gap-3"><MapPinIcon className="h-5 w-5 text-[var(--text-dim)] mt-0.5" /><div className="text-[var(--text)]">{entity.address.street && <div>{entity.address.street}</div>}<div>{entity.address.city}, {entity.address.state} {entity.address.zipCode}</div>{entity.address.country && <div>{entity.address.country}</div>}</div></div>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Additional Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Created {new Date(entity.createdAt).toLocaleDateString()}</span></div>
                    {entity.lastContactDate && (<div className="flex items-center gap-3"><ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--text-dim)]" /><span className="text-[var(--text)]">Last contact {new Date(entity.lastContactDate).toLocaleDateString()}</span></div>)}
                    {entity.tags && entity.tags.length > 0 && (<div className="flex flex-wrap gap-2">{entity.tags.map((tag: string, index: number) => (<span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">{tag}</span>))}</div>)}
                  </div>
                </div>
              </div>
              {entity.notes && (<div><h3 className="text-lg font-semibold text-[var(--text)] mb-3">Notes</h3><div className="bg-[var(--surface-2)] rounded-lg p-4 border border-[var(--border)]"><p className="text-[var(--text)] whitespace-pre-wrap">{entity.notes}</p></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
