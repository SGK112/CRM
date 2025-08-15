'use client';

import { useState, useRef } from 'react';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function ClientsImportPage() {
  const [dryRun, setDryRun] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement|null>(null);

  const upload = async (file: File, overrideDryRun?: boolean) => {
    setUploading(true); setError(null); setResult(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) { throw new Error('Not authenticated'); }
      const form = new FormData(); form.append('file', file);
      const dr = (overrideDryRun !== undefined ? overrideDryRun : dryRun);
      const resp = await fetch(`${API_BASE}/clients/import?dryRun=${dr}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      if (!resp.ok) throw new Error(`Import failed (HTTP ${resp.status})`);
      const data = await resp.json();
      setResult(data);
      if (!data.dryRun) {
        // optional: notify user to return to list
      }
    } catch (e:any) { setError(e.message); }
    finally { setUploading(false); }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Import Clients</h1>
            <p className="text-gray-600 mt-1">Validate with a dry run, then apply to populate the CRM.</p>
          </div>
          <Link href="/dashboard/clients" className="text-sm text-blue-600 hover:underline">← Back to Clients</Link>
        </div>

  <div className="surface-1 rounded-2xl border border-token shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-token bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[var(--surface-2)] dark:to-[var(--surface-2)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upload CSV</h2>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={dryRun} onChange={e=>setDryRun(e.target.checked)} /> Dry Run
            </label>
          </div>
          <div className="p-6 space-y-6">
            <div
              onDragOver={e=>{e.preventDefault();}}
              onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) upload(f);}}
              className="flex flex-col items-center justify-center px-8 py-14 border-2 border-dashed rounded-xl text-center bg-gray-50/60 dark:bg-[var(--surface-2)]/40 hover:border-blue-400 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 mb-1">Drag & Drop CSV or Click</span>
              <span className="text-xs text-gray-500 mb-4">UTF-8 .csv up to 25k rows</span>
              <button
                onClick={()=>fileRef.current?.click()}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                disabled={uploading}
              >{uploading ? 'Uploading...' : 'Choose File'}</button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) upload(f); }} />
              <a
                href="data:text/csv;charset=utf-8,firstName,lastName,email,phone,company,tags%0AJane,Doe,jane@example.com,555-111-2222,Acme,lead%0AJohn,Smith,john@smith.io,555-333-4444,Globex,prospect"
                download="sample-clients.csv"
                className="mt-4 text-[11px] text-blue-600 hover:underline"
              >Download Sample CSV</a>
            </div>
            {error && <div className="px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
            {result && (
              <div className="space-y-5">
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${result.dryRun ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{result.dryRun ? 'Dry Run' : 'Applied'}</span>
                    <span className="text-gray-700">{result.count} processed • {result.created} new • {result.updated} updated • {result.skipped} skipped • {result.duplicatesCollapsed} duplicates collapsed</span>
                  </div>
                  {result.skipReasons && <div className="text-[11px] text-gray-500">Skips: {Object.entries(result.skipReasons).map(([k,v]: any) => `${k}:${v}`).join(' | ')}</div>}
                </div>
                {result.preview && result.preview.length>0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Preview (first 5 normalized rows)</div>
                    <div className="overflow-x-auto border border-token rounded-md">
                      <table className="min-w-full text-[11px]">
                        <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
                          <tr>
                            {['firstName','lastName','email','phone','company','tags','status','source'].map(h=> <th key={h} className="px-2 py-1 text-left font-semibold text-gray-600">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {result.preview.map((row:any, idx:number) => (
                            <tr key={idx} className="odd:bg-white even:bg-gray-50 dark:odd:bg-[var(--surface-1)] dark:even:bg-[var(--surface-2)]">
                              {['firstName','lastName','email','phone','company','tags','status','source'].map(h => (
                                <td key={h} className="px-2 py-1 whitespace-nowrap text-gray-700">{Array.isArray(row[h]) ? row[h].join(',') : (row[h] || '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {result.dryRun && (
                  <button
                    onClick={()=>{ if(!fileRef.current?.files?.[0]) { setError('Re-select file to apply.'); return;} upload(fileRef.current.files[0], false); }}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                  >Apply Import</button>
                )}
                <div className="text-[11px] text-gray-500">Existing clients matched by email (or synthesized from phone). Duplicates collapsed. Tags merged. You can re-run later; updates overwrite core fields.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
