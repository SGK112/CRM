'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PhoneInput from '../../../../components/forms/PhoneInput';
import AddressInput from '../../../../components/forms/AddressInput';
// Using rewrite paths for API calls
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ClientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  status: string;
  source?: string;
  address?: { street?: string; city?: string; state?: string; zipCode?: string; country?: string; };
  tags?: string[];
}

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/dashboard/clients';
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState<ClientCreate>({ firstName:'', lastName:'', email:'', status:'lead', source:'other', tags: [] });

  const authHeaders = (): Record<string,string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
    const base: Record<string,string> = { 'Content-Type':'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return base;
  };

  function updateField(name:string, value:any){ setForm(f=>({...f,[name]:value})); }
  function updateAddress(name:string,value:any){ setForm(f=>({...f,address:{...(f.address||{}),[name]:value}})); }
  function addTag(){ if(!tagInput.trim()) return; if(form.tags?.includes(tagInput.trim())) { setTagInput(''); return; } setForm(f=>({...f,tags:[...(f.tags||[]), tagInput.trim()]})); setTagInput(''); }
  function removeTag(t:string){ setForm(f=>({...f,tags:(f.tags||[]).filter(x=>x!==t)})); }

  async function save(e:React.FormEvent){
    e.preventDefault(); setSaving(true); setError('');
    try {
      const body:any = { ...form };
      ['phone','company','jobTitle','notes','source'].forEach(k=> { if(!body[k]) delete body[k]; });
      if (body.address) {
        const has = Object.values(body.address as Record<string, unknown>).some(v => typeof v === 'string' && v.trim() !== '');
        if(!has) delete body.address;
      }
  const res = await fetch(`/api/clients`, { method:'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        const created = await res.json();
        // Check if we need to redirect back to estimate creation
        if (returnTo.includes('estimates/new')) {
          router.push(`${returnTo}?clientId=${created._id}`);
        } else {
          router.push(`/dashboard/clients/${created._id}`);
        }
      } else {
        const msg = await res.text();
        setError(`Create failed (${res.status}) ${msg}`);
      }
    } catch (e:any) { setError('Network error creating client'); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={returnTo} className="text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
              <ArrowLeftIcon className="h-6 w-6"/>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">New Client</h1>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Add a new client to your CRM</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={returnTo} className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              Cancel
            </Link>
            <button 
              disabled={saving} 
              type="submit" 
              className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="h-5 w-5 mr-1"/>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={save} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <input 
                required 
                value={form.firstName} 
                onChange={e=>updateField('firstName', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <input 
                required 
                value={form.lastName} 
                onChange={e=>updateField('lastName', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input 
                type="email" 
                required 
                value={form.email} 
                onChange={e=>updateField('email', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <PhoneInput
                value={form.phone || ''}
                onChange={(value) => updateField('phone', value)}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
              <input 
                value={form.company||''} 
                onChange={e=>updateField('company', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
              <input 
                value={form.jobTitle||''} 
                onChange={e=>updateField('jobTitle', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                value={form.status} 
                onChange={e=>updateField('status', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {['lead','prospect','active','inactive','churned','completed'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
              <select 
                value={form.source||'other'} 
                onChange={e=>updateField('source', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {['referral','website','social_media','advertisement','cold_outreach','other'].map(s=> <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h2>
          <AddressInput
            address={form.address || {}}
            onChange={(address) => setForm(f => ({ ...f, address }))}
            className=""
            showCoordinates={true}
          />
        </section>

        {/* Notes */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          <textarea 
            rows={4} 
            value={form.notes||''} 
            onChange={e=>updateField('notes', e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical" 
            placeholder="Internal notes about this client..." 
          />
        </section>

        {/* Tags */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tags</h2>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(); } }} placeholder="Add tag and press Enter" className="input flex-1" />
            <button type="button" onClick={addTag} className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags?.map(t => (
              <span key={t} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t}
                <button type="button" onClick={()=>removeTag(t)} className="ml-2 text-blue-600 hover:text-blue-900">×</button>
              </span>
            ))}
            {(!form.tags || form.tags.length===0) && <span className="text-xs text-gray-700 >No tags yet.</span>}
          </div>
        </section>
      </form>
    </div>
  );
}
