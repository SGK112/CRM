'use client';

import { useState, useRef } from 'react';
// @ts-ignore - fallback if types not installed
import Papa from 'papaparse';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { 
  DocumentArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

export default function ClientsImportPage() {
  const [dryRun, setDryRun] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [headerMap, setHeaderMap] = useState<Record<string,string>>({});
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number,string[]>>({});
  const [step, setStep] = useState<'upload'|'map'|'preview'|'importing'|'done'>('upload');
  const [error, setError] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement|null>(null);

  // Simplified options - hiding complex developer settings
  const [allowEmailOnly, setAllowEmailOnly] = useState(false);
  const [allowPhoneOnly, setAllowPhoneOnly] = useState(true);
  const [synthEmailFromPhone, setSynthEmailFromPhone] = useState(true);
  const [dedupeByPhone, setDedupeByPhone] = useState(true);

  const buildQuery = (overrideDry?: boolean) => {
    const params = new URLSearchParams();
    params.set('dryRun', String(overrideDry !== undefined ? overrideDry : dryRun));
    params.set('allowEmailOnly', String(allowEmailOnly));
    params.set('allowPhoneOnly', String(allowPhoneOnly));
    params.set('synthEmailFromPhone', String(synthEmailFromPhone));
    params.set('dedupeByPhone', String(dedupeByPhone));
    return params.toString();
  };

  // Core identifiers: require first & last name plus at least one contact method (email or phone)
  const requiredFields = ['first_name','last_name'];
  // Expanded optional fields to include user-provided headers (normalized with underscores)
  const optionalFields = [
    'email','phone','company','tags','status','source',
    // Address related
    'street','city','state','zip','zip_code','country','country_name','address',
    // Extended / marketing
    'notes','time_zone','source_channel','source_campaign','source_url','created_at','unsubscribed','email_blocked','last_activity_time','assigned_staff','review_score','next_booking','pending_estimates_total','open_payments','approved_estimates_total','second_contact_name','project_name','how_did_you_hear_about_us','phone_number_1','second_contact_phone_number'
  ];
  const allowedStatuses = ['lead','prospect','active','inactive','churned','completed','client','dead_lead'];
  const allowedSources = ['referral','website','social_media','advertisement','cold_outreach','other'];

  function parseCsv(file: File){
    setUploading(true); setError(null); setResult(null); setValidationErrors({});
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformHeader: (h: string) => h.trim(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (res: any) => {
        const rows = res.data as any[];
        setRawRows(rows);
        const headers: string[] = res.meta.fields || [];
        setDetectedHeaders(headers);
        // Build default mapping (exact matches only)
        const map: Record<string,string> = {};
        const canon = (s:string)=> s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
        headers.forEach((h: string)=> {
          const c = canon(h);
          if(requiredFields.includes(c) || optionalFields.includes(c)) map[h]=c;
        });
        setHeaderMap(map);
        setStep('map');
        setUploading(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (err: any) => { setError(err.message); setUploading(false); }
    });
  }

  // Backwards compatibility wrapper for legacy UI handlers still calling upload()
  function upload(file: File){
    parseCsv(file);
  }

  function applyMapping(){
    // Create normalized rows
  const canon = (s:string)=> s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const mapped = rawRows.map((r, idx) => {
      const obj: any = {};
      Object.entries(headerMap).forEach(([orig, target]) => {
    obj[target] = r[orig];
      });
      return { __row: idx+1, ...obj };
    });
    // Validate
    const errors: Record<number,string[]> = {};
    const emailSeen = new Set<string>();
    const phoneSeen = new Set<string>();
    mapped.forEach(row => {
      const rowErrs:string[]=[];
      // Trim & normalize
      if(row.email) row.email = String(row.email).trim();
      if(row.phone) row.phone = String(row.phone).replace(/[^\d]/g,'');
      requiredFields.forEach(f=>{ if(!row[f] || String(row[f]).trim()===''){ rowErrs.push(`Missing ${f.replace(/_/g,' ')}`);} });
      // Need at least one contact method
      if(!row.email && !row.phone) rowErrs.push('Missing contact (email or phone)');
      if(row.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) rowErrs.push('Invalid email');
      if(row.status && !allowedStatuses.includes(row.status)) rowErrs.push('Bad status');
      if(row.source && !allowedSources.includes(row.source)) rowErrs.push('Bad source');
      if(row.tags){ row.tags = String(row.tags).split(/[,;]+/).map((t:string)=>t.trim()).filter(Boolean); }
      // Address parsing from combined 'address' if components missing
      const hasAnyAddress = row.street || row.city || row.state || row.zip || row.zip_code || row.country || row.country_name;
      if(row.address && !hasAnyAddress){
        const parts = String(row.address).split(',').map((p:string)=>p.trim()).filter(Boolean);
        if(parts.length>=3){
          // Heuristic: last part maybe country or zip/state, second last maybe state+zip
          row.street = parts[0];
          if(parts.length===3){
            row.city = parts[1];
            const stateZip = parts[2];
            const m = stateZip.match(/([A-Za-z]{2,})\s+(\d{4,6})/);
            if(m){ row.state = m[1]; row.zip = m[2]; }
          } else {
            row.city = parts[1];
            row.state = parts[2];
            if(parts[3]) row.zip = parts[3];
            if(parts[4]) row.country = parts[4];
          }
        }
      }
      // Duplicate detection (within file)
      if(row.email){
        if(emailSeen.has(row.email)) rowErrs.push('Duplicate email in file');
        else emailSeen.add(row.email);
      }
      if(dedupeByPhone && row.phone){
        if(phoneSeen.has(row.phone)) rowErrs.push('Duplicate phone in file');
        else phoneSeen.add(row.phone);
      }
      // Optional synthetic email preview (not persisted until import)
      if(!row.email && row.phone && synthEmailFromPhone){
        row.syntheticEmail = `${row.phone}@import.local`;
      }
      if(rowErrs.length) errors[row.__row]=rowErrs;
    });
    setValidationErrors(errors);
    setParsedPreview(mapped.slice(0,50));
    setStep('preview');
  }

  async function performImport(){
    setStep('importing'); setUploading(true); setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if(!token) throw new Error('Not authenticated');
      // Filter valid rows
    const validRows = rawRows.map((r, idx) => {
        const obj:any={};
        Object.entries(headerMap).forEach(([orig,target])=>{ obj[target]=r[orig]; });
  // Normalize now to align with backend expectations
  if(obj.phone) obj.phone = String(obj.phone).replace(/[^\d]/g,'');
  if(obj.email) obj.email = String(obj.email).trim();
  if(!obj.email && obj.phone && synthEmailFromPhone) obj.email = `${obj.phone}@import.local`;
  // Build address object if components present
  const addr:any = {};
  ['street','city','state','zip','zip_code','country','country_name'].forEach(k=> { if(obj[k]) addr[k==='zip_code'?'zipCode':k==='zip'?'zipCode':k==='country_name'?'country':k] = obj[k]; });
  if(Object.keys(addr).length){ obj.address = addr; }
  // Cleanup standalone address fields if address object created
  if(obj.address){ ['street','city','state','zip','zip_code','country','country_name'].forEach(k=> delete obj[k]); }
  return obj;
      }).filter((_,i)=> !validationErrors[i+1]);
      const resp = await fetch(`${API_BASE}/clients/bulk`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ clients: validRows }) });
      if(!resp.ok) throw new Error(`Bulk import failed (${resp.status})`);
      const data = await resp.json();
      setResult({ summary:data, imported: validRows.length, total: rawRows.length });
      setStep('done');
    } catch(e:any){ setError(e.message); setStep('preview'); }
    finally { setUploading(false); }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/dashboard/clients" 
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Clients
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Import Clients</h1>
            <p className="text-gray-600 mt-1">Upload a CSV file to add multiple clients at once</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">How it works</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>1. Download our sample CSV template to see the required format</p>
                <p>2. Add your client data following the same structure</p>
                <p>3. Upload and preview your data before importing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-[var(--surface-1)] rounded-lg border border-gray-200 dark:border-[var(--border)] shadow-sm overflow-hidden">
          {/* Header with simplified options */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--border)] bg-gray-50 dark:bg-[var(--surface-2)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">Upload CSV File</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={dryRun} 
                    onChange={e=>setDryRun(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700 dark:text-[var(--text-dim)]">Preview before importing</span>
                </label>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="p-6">
            <div
              onDragOver={e=>{e.preventDefault();}}
              onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) upload(f);}}
              className="relative flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50/50 dark:bg-[var(--surface-2)]/40 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200"
            >
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-2">
                {uploading ? 'Processing...' : 'Drop your CSV file here'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-[var(--text-dim)] mb-4">
                or click to browse files
              </p>
              <button
                onClick={()=>fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
              <input 
                ref={fileRef} 
                type="file" 
                accept=".csv,text/csv" 
                className="hidden" 
                onChange={e => { const f=e.target.files?.[0]; if(f) parseCsv(f); }} 
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <a
                  href="data:text/csv;charset=utf-8,firstName,lastName,email,phone,company,tags%0AJane,Doe,jane@example.com,555-111-2222,Acme,lead%0AJohn,Smith,john@smith.io,555-333-4444,Globex,prospect"
                  download="sample-clients.csv"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-1" />
                  Download Sample CSV Template
                </a>
                <p className="text-xs text-gray-500">Columns recognized automatically: firstName, lastName, email, phone, company, tags, status, source</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {/* Mapping Step */}
            {step==='map' && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text)]">Map Columns</h3>
                <p className="text-xs text-gray-600 dark:text-[var(--text-dim)]">Match your CSV headers to system fields. Unmapped required fields will block import.</p>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">CSV Header</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Map To</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Sample Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detectedHeaders.map(h => (
                        <tr key={h} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2 font-mono text-xs">{h}</td>
                          <td className="px-3 py-2">
                            <select
                              value={headerMap[h] || ''}
                              onChange={e=> setHeaderMap(m=> { const v=e.target.value; const next={...m}; if(!v) { delete next[h]; } else { next[h]=v; } return next; }) }
                              className="px-2 py-1 border border-gray-300 rounded text-xs bg-white dark:bg-[var(--surface-2)]"
                            >
                              <option value="">-- ignore --</option>
                              {[...requiredFields, ...optionalFields].map(f=> <option key={f} value={f}>{f}{requiredFields.includes(f)?' *':''}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[180px]">{rawRows[0]?.[h] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={applyMapping}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
                    disabled={!requiredFields.every(req => Object.values(headerMap).includes(req))}
                  >
                    Continue
                  </button>
                  <button onClick={()=>{ setRawRows([]); setStep('upload'); }} className="px-4 py-2 border text-sm rounded-md">Restart</button>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step==='preview' && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text)]">Preview & Validation</h3>
                <p className="text-xs text-gray-600 dark:text-[var(--text-dim)]">Showing first {parsedPreview.length} rows. Errors must be fixed or those rows will be skipped.</p>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
                      <tr>
                        <th className="px-2 py-2">Row</th>
                        {requiredFields.map(f=> <th key={f} className="px-2 py-2 text-left">{f.replace(/_/g,' ')} *</th>)}
                        {optionalFields.map(f=> <th key={f} className="px-2 py-2 text-left">{f.replace(/_/g,' ')}</th>)}
                        <th className="px-2 py-2 text-left">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedPreview.map(r => (
                        <tr key={r.__row} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[var(--surface-2)]">
                          <td className="px-2 py-1 font-mono">{r.__row}</td>
                          {requiredFields.map(f=> <td key={f} className="px-2 py-1">{r[f] || <span className="text-red-500">—</span>}</td>)}
                          {optionalFields.map(f=> <td key={f} className="px-2 py-1">{Array.isArray(r[f])? r[f].join(', '): (r[f]||'')}</td>)}
                          <td className="px-2 py-1 text-red-500 min-w-[140px]">{validationErrors[r.__row]?.join('; ')||''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3 items-center text-xs text-gray-600 dark:text-[var(--text-dim)]">
                  <span>Total rows: {rawRows.length}</span>
                  <span>Errors: {Object.keys(validationErrors).length}</span>
                  <span>Will import: {rawRows.length - Object.keys(validationErrors).length}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={()=> setStep('map')} className="px-4 py-2 border text-sm rounded-md">Back</button>
                  <button onClick={performImport} disabled={rawRows.length===Object.keys(validationErrors).length || uploading} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50">Import {rawRows.length - Object.keys(validationErrors).length} Clients</button>
                </div>
              </div>
            )}

            {/* Done Step */}
            {step==='done' && result && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                  <h4 className="text-sm font-medium text-green-800">Import Complete</h4>
                  <p className="text-sm text-green-700 mt-1">Imported {result.imported} of {result.total} rows.</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/clients" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">View Clients</Link>
                  <button onClick={()=>{ setRawRows([]); setParsedPreview([]); setResult(null); setStep('upload'); }} className="px-4 py-2 border text-sm rounded-md">Import Another</button>
                </div>
              </div>
            )}

            {result && step!=='done' && step!=='preview' && step!=='map' && (
              <div className="mt-6 space-y-4">
                {/* Summary */}
                <div className={`p-4 rounded-lg border ${
                  result.dryRun 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.dryRun ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        result.dryRun ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'
                      }`}>
                        {result.dryRun ? 'Preview Complete' : 'Import Successful'}
                      </h4>
                      <div className={`text-sm mt-1 ${
                        result.dryRun ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
                      }`}>
                        <p><strong>{result.count}</strong> rows processed</p>
                        <p><strong>{result.created}</strong> new clients • <strong>{result.updated}</strong> updated • <strong>{result.skipped}</strong> skipped</p>
                        {result.duplicatesCollapsed > 0 && (
                          <p><strong>{result.duplicatesCollapsed}</strong> duplicates merged</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Skip Reasons and Suggestions */}
                {result.skipReasons && Object.keys(result.skipReasons).length > 0 && (
                  <div className="bg-gray-50 dark:bg-[var(--surface-2)] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-[var(--text)] mb-2">Skipped Rows</h5>
                    <div className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                      {Object.entries(result.skipReasons).map(([reason, count]: any) => (
                        <div key={reason} className="flex justify-between">
                          <span>{reason}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.remediation && result.remediation.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Suggestions</h5>
                    <div className="space-y-2">
                      {result.remediation.map((r:any, idx:number) => (
                        <div key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-medium">{r.reason}:</span> {r.suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Table */}
                {result.preview && result.preview.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-[var(--text)] mb-3">
                      Preview (first {result.preview.length} rows)
                    </h5>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
                          <tr>
                            {['Name', 'Email', 'Phone', 'Company', 'Status', 'Source'].map(header => (
                              <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[var(--surface-1)] divide-y divide-gray-200 dark:divide-gray-700">
                          {result.preview.map((row:any, idx:number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[var(--surface-2)]">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-[var(--text)]">
                                {row.firstName} {row.lastName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-[var(--text-dim)]">
                                {row.email || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-[var(--text-dim)]">
                                {row.phone || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-[var(--text-dim)]">
                                {row.company || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  {row.status || 'lead'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-[var(--text-dim)]">
                                {row.source || 'other'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {result.dryRun && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={()=>{ 
                        if(!fileRef.current?.files?.[0]) { 
                          setError('Please re-select the file to import.'); 
                          return;
                        } 
                        upload(fileRef.current.files[0]); 
                      }}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Import {result.created + result.updated} Clients
                    </button>
                    <Link
                      href="/dashboard/clients"
                      className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--surface-2)] hover:bg-gray-50 dark:hover:bg-[var(--surface-3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                )}

                {!result.dryRun && (
                  <div className="flex justify-center pt-4">
                    <Link
                      href="/dashboard/clients"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      View All Clients
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 dark:bg-[var(--surface-2)] rounded-lg p-6 border border-gray-200 dark:border-[var(--border)]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">CSV Format Requirements</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-[var(--text-dim)] mb-2">Required Columns</h4>
              <ul className="text-sm text-gray-600 dark:text-[var(--text-dim)] space-y-1">
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">firstName</code> - Client's first name</li>
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">lastName</code> - Client's last name</li>
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">email</code> - Valid email address</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-[var(--text-dim)] mb-2">Optional Columns</h4>
              <ul className="text-sm text-gray-600 dark:text-[var(--text-dim)] space-y-1">
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">phone</code> - Phone number</li>
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">company</code> - Company name</li>
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">tags</code> - Comma-separated tags</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
