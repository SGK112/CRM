"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserIconSolid,
  PhoneIcon as PhoneIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  SpeakerWaveIcon as SpeakerIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  source?: string;
  status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface Project { _id: string; title: string; description: string; status: string; budget: number; progress: number; }
interface Invoice { _id: string; invoiceNumber: string; amount: number; status: string; dueDate: string; createdAt: string; }
interface Appointment { _id: string; title: string; date: string; time: string; type: string; status: string; notes?: string; }
interface Communication { _id: string; type: string; subject?: string; content: string; direction: 'inbound' | 'outbound'; timestamp: string; status?: string; }

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (clientId) fetchData(); }, [clientId]);

  // Always return a concrete Record<string,string> so fetch() sees a valid HeadersInit
  const authHeaders = (): Record<string,string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  };

  async function fetchData() {
    try {
      setLoading(true);
  const clientRes = await fetch(`${API_BASE}/clients/${clientId}`, { headers: authHeaders() });
      if (clientRes.ok) {
        const c = await clientRes.json();
        setClient(c);
      } else if (clientRes.status === 404) {
        setError('Client not found');
      } else if (clientRes.status === 401) {
        router.push('/auth/login');
        return;
      }

  const projRes = await fetch(`${API_BASE}/projects/client/${clientId}`, { headers: authHeaders() }).catch(()=>null);
      if (projRes && projRes.ok) setProjects(await projRes.json());

      // Placeholder demo data for now
      setInvoices([
        { _id:'1', invoiceNumber:'INV-001', amount:4200, status:'paid', dueDate:'2025-09-01', createdAt:'2025-08-01' },
        { _id:'2', invoiceNumber:'INV-002', amount:1800, status:'sent', dueDate:'2025-09-15', createdAt:'2025-08-10' }
      ]);
      setAppointments([
        { _id:'1', title:'Initial Consultation', date:'2025-08-25', time:'10:00 AM', type:'consultation', status:'scheduled' },
        { _id:'2', title:'Site Visit', date:'2025-08-30', time:'2:00 PM', type:'site-visit', status:'scheduled' }
      ]);
      setCommunications([
        { _id:'1', type:'email', subject:'Welcome!', content:'Thanks for joining.', direction:'outbound', timestamp:new Date().toISOString(), status:'sent' }
      ]);
    } catch (e:any) {
      console.error(e); setError('Failed to load client data');
    } finally { setLoading(false); }
  }

  async function handleVoiceCall() {
    if (!client?.phone) return alert('No phone number');
    try {
  const res = await fetch(`${API_BASE}/voice-agent/outbound`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ phoneNumber: client.phone, clientId, purpose:'follow-up' }) });
      if (res.ok) alert('Voice call started'); else alert('Failed to start call');
    } catch (e) { console.error(e); alert('Error starting call'); }
  }

  const formatMoney = (n:number)=> new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const formatDate = (d:string)=> new Date(d).toLocaleDateString();
  const badge = (status:string)=> {
    const map:Record<string,string>={lead:'bg-blue-100 text-blue-800',prospect:'bg-yellow-100 text-yellow-800',active:'bg-green-100 text-green-800',inactive:'bg-gray-100 text-gray-800',churned:'bg-red-100 text-red-800',completed:'bg-purple-100 text-purple-800',paid:'bg-green-100 text-green-800',sent:'bg-blue-100 text-blue-800',overdue:'bg-red-100 text-red-800',scheduled:'bg-blue-100 text-blue-800',cancelled:'bg-red-100 text-red-800'}; return map[status] || 'bg-gray-100 text-gray-800'; };

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600"/></div></Layout>;
  if (error || !client) return <Layout><div className="py-32 text-center"><h2 className="text-2xl font-bold mb-2">{error||'Client Not Found'}</h2><p className="text-gray-500">The requested client could not be located.</p><div className="mt-6"><Link href="/dashboard/clients" className="text-blue-600 hover:underline">Back to Clients</Link></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/clients" className="text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span>{client.firstName} {client.lastName}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge(client.status)}`}>{client.status}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">Client since {formatDate(client.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/clients/${clientId}/edit`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50">
              <PencilIcon className="h-4 w-4 mr-2" />Edit
            </Link>
            <button onClick={handleVoiceCall} className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
              <SpeakerWaveIcon className="h-4 w-4 mr-2" />AI Voice
            </button>
            <button
              onClick={() => router.push(`/dashboard/estimates/new?clientId=${clientId}&returnTo=${encodeURIComponent(`/dashboard/clients/${clientId}`)}`)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />Create Estimate
            </button>
            <button
              onClick={() => router.push(`/dashboard/invoices?clientId=${clientId}`)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />Create Invoice
            </button>
          </div>
        </div>

        {/* Contact bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center text-sm text-gray-600"><EnvelopeIcon className="h-4 w-4 mr-2"/><a href={`mailto:${client.email}`} className="hover:text-blue-600">{client.email}</a></div>
          {client.phone && <div className="flex items-center text-sm text-gray-600"><PhoneIcon className="h-4 w-4 mr-2"/><a href={`tel:${client.phone}`} className="hover:text-blue-600">{client.phone}</a></div>}
          {client.address?.city && <div className="flex items-center text-sm text-gray-600 md:col-span-2"><MapPinIcon className="h-4 w-4 mr-2"/>{[client.address.street, client.address.city, client.address.state].filter(Boolean).join(', ')} {client.address.zipCode}</div>}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 -mb-px" aria-label="Tabs">
            {['overview','projects','billing','scheduling','communications','voice-agent'].map(tab => (
              <button key={tab} onClick={()=>setActiveTab(tab)} className={`py-3 px-1 border-b-2 text-sm font-medium capitalize ${activeTab===tab? 'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab.replace('-', ' ')}</button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Client Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-gray-500">Status</dt><dd className="mt-1 font-medium capitalize">{client.status}</dd></div>
                  <div><dt className="text-gray-500">Source</dt><dd className="mt-1 font-medium">{client.source || '—'}</dd></div>
                  <div><dt className="text-gray-500">Email</dt><dd className="mt-1">{client.email}</dd></div>
                  <div><dt className="text-gray-500">Phone</dt><dd className="mt-1">{client.phone || '—'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-gray-500">Address</dt><dd className="mt-1">{client.address?.city ? [client.address.street, client.address.city, client.address.state, client.address.zipCode].filter(Boolean).join(', ') : '—'}</dd></div>
                </dl>
                {client.notes && <div className="mt-6"><dt className="text-gray-500 text-sm mb-1">Notes</dt><p className="text-sm whitespace-pre-line">{client.notes}</p></div>}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Projects</span><span className="font-medium">{projects.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Invoices</span><span className="font-medium">{invoices.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Appointments</span><span className="font-medium">{appointments.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Contact</span><span className="font-medium">{communications[0] ? formatDate(communications[0].timestamp) : '—'}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <ul className="space-y-3 text-sm">
                  {communications.slice(0,4).map(c=> <li key={c._id} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-blue-500"/><div><p className="font-medium capitalize">{c.type}</p><p className="text-gray-500 text-xs">{formatDate(c.timestamp)}</p></div></li>)}
                  {communications.length===0 && <li className="text-gray-500">No activity yet.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                onClick={() => router.push(`/dashboard/projects/new?clientId=${clientId}&returnTo=${encodeURIComponent(`/dashboard/clients/${clientId}`)}`)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1"/>New Project
              </button>
            </div>
            <div className="grid gap-4">
              {projects.map(p=> <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-5"><div className="flex justify-between items-start"><div><h3 className="font-medium text-gray-900">{p.title}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p><div className="flex gap-3 mt-3 text-xs items-center"><span className={`px-2 py-1 rounded-full font-medium ${badge(p.status)}`}>{p.status}</span><span className="text-gray-500">Budget {formatMoney(p.budget)}</span><span className="text-gray-500">Progress {p.progress}%</span></div></div><div className="flex gap-2"><button className="p-2 text-gray-400 hover:text-gray-600"><PencilIcon className="h-4 w-4"/></button><button className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button></div></div><div className="mt-4 h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-600 rounded" style={{width:`${p.progress}%`}}/></div></div>)}
              {projects.length===0 && <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">No projects yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <button
                onClick={()=> router.push(`/dashboard/invoices/new?clientId=${clientId}&returnTo=${encodeURIComponent(`/dashboard/clients/${clientId}`)}`)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1"/>Create Invoice
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left font-medium text-gray-500">Invoice</th><th className="px-4 py-2 text-left font-medium text-gray-500">Amount</th><th className="px-4 py-2 text-left font-medium text-gray-500">Status</th><th className="px-4 py-2 text-left font-medium text-gray-500">Due</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map(inv=> <tr key={inv._id} className="hover:bg-gray-50"><td className="px-4 py-2 font-medium">{inv.invoiceNumber}</td><td className="px-4 py-2">{formatMoney(inv.amount)}</td><td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(inv.status)}`}>{inv.status}</span></td><td className="px-4 py-2">{formatDate(inv.dueDate)}</td></tr>)}
                  {invoices.length===0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No invoices</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Appointments</h2>
              <button
                onClick={()=> router.push(`/dashboard/calendar/new?clientId=${clientId}&returnTo=${encodeURIComponent(`/dashboard/clients/${clientId}`)}`)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1"/>Schedule
              </button>
            </div>
            <div className="grid gap-4">
              {appointments.map(a=> <div key={a._id} className="bg-white border border-gray-200 rounded-lg p-5 flex justify-between items-start"><div><h3 className="font-medium text-gray-900">{a.title}</h3><div className="mt-1 text-sm text-gray-500">{formatDate(a.date)} at {a.time}</div><div className="mt-2 flex gap-2 text-xs items-center"><span className={`px-2 py-1 rounded-full font-medium ${badge(a.status)}`}>{a.status}</span><span className="text-gray-500">{a.type}</span></div>{a.notes && <p className="mt-2 text-sm text-gray-600">{a.notes}</p>}</div><div className="flex gap-2"><button className="p-2 text-gray-400 hover:text-gray-600"><PencilIcon className="h-4 w-4"/></button><button className="p-2 text-gray-400 hover:text-red-600"><XMarkIcon className="h-4 w-4"/></button></div></div>)}
              {appointments.length===0 && <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">No appointments</div>}
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Communications</h2>
              <div className="flex gap-3">
                <button
                  onClick={()=> { if (client?.email) window.location.href = `mailto:${client.email}`; }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-1"/>Email
                </button>
                <button
                  onClick={()=> { if (client?.phone) window.location.href = `sms:${client.phone}`; }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  <PhoneIcon className="h-4 w-4 mr-1"/>SMS
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <ul className="space-y-4">
                {communications.map((c,i)=> <li key={c._id} className="relative pl-6"><span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-blue-500"/><div className="text-xs text-gray-500 mb-1">{formatDate(c.timestamp)} • {c.direction}</div><p className="text-sm font-medium">{c.subject || c.type}</p><p className="text-sm text-gray-600 mt-1">{c.content}</p>{c.status && <span className={`mt-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge(c.status)}`}>{c.status}</span>}</li>)}
                {communications.length===0 && <li className="text-sm text-gray-500">No communications yet.</li>}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'voice-agent' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-semibold">AI Voice Agent</h2><button onClick={handleVoiceCall} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"><SpeakerWaveIcon className="h-4 w-4 mr-1"/>Call</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Purpose</label>
                  <select className="input text-sm"><option>Follow-up</option><option>Update</option><option>Reminder</option></select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voice Tone</label>
                  <select className="input text-sm"><option>Professional</option><option>Friendly</option><option>Casual</option></select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message</label>
                  <textarea rows={4} className="input text-sm" placeholder="Optional instructions..." />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Calls</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between"><span>Follow-up Call</span><span className="text-gray-500">3:45</span></li>
                  <li className="flex justify-between"><span>Appointment Reminder</span><span className="text-gray-500">1:20</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
