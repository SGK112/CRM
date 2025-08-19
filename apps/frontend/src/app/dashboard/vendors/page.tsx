'use client';
import Layout from '../../../components/Layout';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Vendor { _id:string; name:string; categories?:string[]; createdAt:string; }

export default function VendorsPage(){
  const [vendors,setVendors] = useState<Vendor[]>([]);
  const [loading,setLoading] = useState(true);
  const [name,setName] = useState('');
  const [category,setCategory] = useState('');
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/vendors`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok){ setVendors(await res.json()); }
    setLoading(false);
  };
  useEffect(()=>{ fetchVendors(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const addVendor = async () => {
    if(!name) return;
    await fetch(`${API_BASE}/vendors`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ name, categories: category? [category]:[] }) });
    setName(''); setCategory(''); fetchVendors();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vendors</h1>
            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">Manage supplier directory & price sources</p>
          </div>
        </div>
        <div className="surface-1 border border-token rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Vendor name" className="input" />
            <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (optional)" className="input" />
            <button onClick={addVendor} className="pill pill-tint-green sm self-start">Add</button>
          </div>
          <div className="border-t border-token pt-4">
            {loading && <div className="text-xs">Loading...</div>}
            {!loading && vendors.length===0 && <div className="text-xs text-gray-500">No vendors yet.</div>}
            <ul className="divide-y divide-token">
              {vendors.map(v=> (
                <li key={v._id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{v.name}</div>
                    <div className="text-[11px] text-gray-500">{v.categories?.join(', ')||'—'}</div>
                  </div>
                  <span className="text-[10px] text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
