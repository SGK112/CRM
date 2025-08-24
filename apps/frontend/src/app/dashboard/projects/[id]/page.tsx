"use client";

import Layout from '@/components/Layout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { CalendarIcon, DocumentTextIcon, CurrencyDollarIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Project { _id:string; title:string; description?:string; clientId?:string; status:string; priority:string; budget?:number; startDate?:string; endDate?:string; createdAt?:string; updatedAt?:string; }
interface Estimate { _id:string; projectId?:string; number:string; status:string; subtotalSell:number; total:number; createdAt:string; }

export default function ProjectDetailPage(){
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(()=>{ fetchProject(); fetchRelated(); },[id]);

  async function authHeaders(): Promise<Record<string,string>> {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function fetchProject(){
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`, { headers: await authHeaders() });
      if(res.ok){ setProject(await res.json()); }
    } finally { setLoading(false); }
  }

  async function fetchRelated(){
    try {
      const res = await fetch(`/api/estimates`, { headers: await authHeaders() });
      if(res.ok){
        const all = await res.json();
        const filtered = Array.isArray(all) ? all.filter((e:Estimate)=> e.projectId === id) : [];
        setEstimates(filtered);
      }
    } catch {
      // ignore errors fetching related estimates
    }
  }

  async function createEstimate(){
    if (!project?.clientId) {
      alert('Add a client to this project before creating an estimate.');
      return;
    }
    try{
      setCreating(true);
      const body = {
        clientId: project.clientId,
        projectId: id,
        items: [ { name: 'New Item', quantity: 1, baseCost: 0, marginPct: 50, taxable: true } ],
        discountType: 'percent', discountValue: 0, taxRate: 0,
        notes: `Estimate for project ${project.title}`,
      };
      const res = await fetch(`/api/estimates`, { method:'POST', headers: await authHeaders(), body: JSON.stringify(body) });
      if(res.ok){ const created = await res.json(); router.push(`/dashboard/estimates/${created._id}`); }
      else {
        const txt = await res.text();
        alert(`Failed to create estimate: ${res.status} ${txt}`);
      }
    } finally { setCreating(false); }
  }

  const budget = useMemo(()=> project?.budget ? new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD'}).format(project.budget) : '—', [project]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects" className="text-secondary hover:text-primary inline-flex items-center"><ArrowLeftIcon className="h-5 w-5 mr-1"/>Back</Link>
          <h1 className="text-2xl font-semibold text-primary">Project</h1>
        </div>
        {loading && <div className="text-sm text-secondary">Loading…</div>}
        {!loading && project && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 surface-1 border border-token rounded-xl p-5 space-y-3">
              <h2 className="text-xl font-semibold text-primary">{project.title}</h2>
              <p className="text-secondary text-sm">{project.description || 'No description'}</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-secondary">
                <div className="flex items-center gap-2"><CurrencyDollarIcon className="h-4 w-4"/>Budget: {budget}</div>
                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</div>
                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</div>
                <div>Status: <span className="pill pill-tint-blue sm">{project.status?.replace('_',' ')}</span></div>
              </div>
              <div className="flex gap-2 pt-2 flex-wrap">
                <button onClick={createEstimate} disabled={creating} className="pill pill-tint-green sm inline-flex items-center gap-1"><PlusIcon className="h-4 w-4"/>Create Estimate</button>
                <Link href={`/dashboard/estimates/new?projectId=${id}${project.clientId? `&clientId=${project.clientId}`:''}`} className="pill pill-tint-green sm inline-flex items-center gap-1"><PlusIcon className="h-4 w-4"/>New Estimate (Form)</Link>
                <Link href={`/dashboard/invoices/new?projectId=${id}${project.clientId? `&clientId=${project.clientId}`:''}`} className="pill pill-tint-amber sm inline-flex items-center gap-1"><DocumentTextIcon className="h-4 w-4"/>New Invoice</Link>
                <Link href={`/dashboard/calendar?project=${id}${project.clientId? `&client=${project.clientId}`:''}`} className="pill pill-tint-blue sm inline-flex items-center gap-1"><CalendarIcon className="h-4 w-4"/>Schedule Appointment</Link>
              </div>
            </div>
            <div className="surface-1 border border-token rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-1"><DocumentTextIcon className="h-4 w-4"/>Estimates</h3>
                <Link href="/dashboard/estimates" className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
              {estimates.length === 0 ? (
                <div className="text-xs text-secondary">No estimates linked yet.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {estimates.slice(0,5).map(e=> (
                    <li key={e._id} className="flex items-center justify-between">
                      <span>#{e.number} • {e.status}</span>
                      <Link href={`/dashboard/estimates/${e._id}`} className="text-blue-600 text-xs hover:underline">Open</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
