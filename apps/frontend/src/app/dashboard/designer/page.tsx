"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CapabilityGate } from '../../../components/CapabilityGate';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplate, createDesign } from '../../../lib/designsApi';
import {
  PencilSquareIcon,
  PhotoIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
  ShareIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  PlusIcon,
  EyeIcon,
  PaintBrushIcon,
  HomeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface DesignTemplate {
  id: string;
  name: string;
  type: string; // backend flexible
  category: string;
  thumbnail: string;
  description: string;
  features: string[];
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export default function DesignerPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'templates' | 'new' | 'projects'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [remoteTemplates, setRemoteTemplates] = useState<DesignTemplate[]>([]);
  const [managingTemplate, setManagingTemplate] = useState<null | { mode: 'create' | 'edit'; data: Partial<DesignTemplate> }>(null);
  const [mutating, setMutating] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0); // force refetch on CRUD
  const [notice, setNotice] = useState<null | { type: 'success' | 'error'; msg: string }>(null);
  const [creatingBlank, setCreatingBlank] = useState(false);
  const [importingCAD, setImportingCAD] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('designer_favorites') || '[]');
      setFavorites(stored);
    } catch (err) {
      // ignore JSON parse/localStorage errors
      void err; // no-op to satisfy no-empty
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
  try { localStorage.setItem('designer_favorites', JSON.stringify(next)); } catch (err) { void err; }
      return next;
    });
  };

  // Fetch templates with filters (server-side filtering where possible)
  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const params: any = {};
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedType && selectedType !== 'all') params.type = selectedType;
        if (searchTerm) params.search = searchTerm;
        const data = await listTemplates(params);
        const arr = Array.isArray(data) ? data : (data.templates || []);
        const mapped: DesignTemplate[] = arr.map((t: any) => ({
          id: t._id || t.id,
          name: t.name || 'Untitled Template',
          type: t.type || 'residential',
          category: t.category || 'full-house',
          thumbnail: t.thumbnailUrl || '/api/placeholder/400/300',
          description: t.description || '',
          features: Array.isArray(t.features) ? t.features : [],
          sqft: t.sqft,
          bedrooms: t.bedrooms,
          bathrooms: t.bathrooms
        }));
        if (alive) setRemoteTemplates(mapped);
      } catch (e: any) {
        if (alive) setTemplatesError(e.message || 'Failed to load templates');
      } finally { if (alive) setLoadingTemplates(false); }
    };
    run();
    return () => { alive = false; };
  }, [selectedCategory, selectedType, searchTerm, refreshTick]);

  const designTemplates: DesignTemplate[] = remoteTemplates;

  function toTitle(id: string) { return id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
  const categories = useMemo(() => {
    const base = [{ id: 'all', name: 'All Categories', icon: Squares2X2Icon }];
    const iconMap: Record<string, any> = {
      kitchen: HomeIcon,
      bathroom: WrenchScrewdriverIcon,
      living: HomeIcon,
      bedroom: HomeIcon,
      office: BuildingOfficeIcon,
      'full-house': HomeIcon,
      addition: PlusIcon
    };
    const cats = Array.from(new Set(designTemplates.map(t => t.category))).filter(Boolean).sort();
    cats.forEach(cat => {
      if (!base.find(b => b.id === cat)) base.push({ id: cat, name: toTitle(cat), icon: iconMap[cat] || Squares2X2Icon });
    });
    return base;
  }, [designTemplates]);

  const designTypes = useMemo(() => {
    const set = new Set(designTemplates.map(t => t.type));
    const priority = ['residential','commercial','renovation'];
    const ordered = priority.filter(p => set.has(p));
    const extra = Array.from(set).filter(s => !priority.includes(s));
    return [ { id: 'all', name: 'All Types' }, ...ordered.map(o => ({ id: o, name: toTitle(o) })), ...extra.map(e => ({ id: e, name: toTitle(e) })) ];
  }, [designTemplates]);

  const filteredTemplates = designTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const typeMatch = selectedType === 'all' || template.type === selectedType;
    const searchMatch = !searchTerm || template.name.toLowerCase().includes(searchTerm.toLowerCase()) || template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && typeMatch && searchMatch;
  });

  const renderTemplateCard = (template: DesignTemplate) => (
  <div key={template.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-500/60 flex flex-col">
      <div className="h-40 w-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        <PencilSquareIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1 leading-5">{template.name}</h3>
          <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide ${
            template.type === 'residential' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
            template.type === 'commercial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
            'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
          }`}>
            {template.type}
          </span>
        </div>
        <p className="text-xs text-gray-800 dark:text-gray-300 mb-3 line-clamp-2 min-h-[32px]">{template.description}</p>
        {template.sqft && (
          <div className="flex items-center text-[11px] text-gray-700 dark:text-gray-300 mb-3">
            <span>{template.sqft} sq ft</span>
            {template.bedrooms && (<><span className="mx-1.5">•</span><span>{template.bedrooms} bed</span></>)}
            {template.bathrooms && (<><span className="mx-1.5">•</span><span>{template.bathrooms} bath</span></>)}
          </div>
        )}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                +{template.features.length - 3}
              </span>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center space-x-2">
          <button
            onClick={() => toggleFavorite(template.id)}
            className={`p-2 rounded-md border transition-colors text-xs ${favorites.includes(template.id) ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-500/20 dark:border-yellow-400/40 dark:text-yellow-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-800 dark:text-gray-700 dark:hover:text-gray-300'}`}
            title={favorites.includes(template.id) ? 'Remove favorite' : 'Add to favorites'}
          >
            ★
          </button>
          <CapabilityGate need="design.lab" fallback={<a href="/billing/cart" className="text-amber-500 underline text-xs">Upgrade to use templates</a>}>
            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600" onClick={() => router.push(`/dashboard/designer/editor?template=${template.id}`)}>
              Use Template
            </button>
          </CapabilityGate>
          <button
            onClick={() => setPreviewTemplate(template)}
            className="p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Preview template"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplatesView = () => (
    <div className="space-y-6">
      {/* Filters & Search */}
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 xl:p-6">
        <div className="flex flex-col gap-6">
          {/* Row 1: Categories (horizontal scroll) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-all ${selectedCategory === category.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm dark:bg-blue-500 dark:border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Row 2: Type + Search + Favorites + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-12 gap-4">
            <div className="md:col-span-1 xl:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Type</label>
              <div className="flex flex-wrap gap-2">
                {designTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${selectedType === type.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-1 xl:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-700  />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
          className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            <div className="md:col-span-1 xl:col-span-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorites</label>
        <div className="p-3 rounded-lg text-xs bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/60 border border-gray-200 dark:border-gray-600 min-h-[56px] flex items-start">
                {favorites.length === 0 ? (
          <span className="text-gray-700 dark:text-gray-300">No favorites yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {favorites.map(fid => {
                      const t = designTemplates.find(dt => dt.id === fid);
                      if (!t) return null;
            return (
            <button key={fid} onClick={() => setPreviewTemplate(t)} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300">
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1 xl:col-span-2 flex items-end">
              <div className="w-full flex gap-2 flex-wrap">
        <button onClick={() => setManagingTemplate({ mode: 'create', data: { name: '', type: 'residential', category: 'full-house', description: '', features: [] } })} className="px-3 py-2 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">+ Template</button>
          <CapabilityGate need="design.lab" fallback={<a href="/billing/cart" className="text-amber-500 underline text-xs">Upgrade to create designs</a>}>
            <button onClick={() => setActiveView('new')} className="px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">New Design</button>
          </CapabilityGate>
        <button onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchTerm(''); }} className="px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Reset Filters</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {loadingTemplates && (
          Array.from({ length: 8 }).map((_,i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-4 h-72 flex flex-col">
              <div className="h-40 w-full bg-gray-200 rounded-md mb-4" />
              <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="mt-auto flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-8 flex-1 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        )}
        {templatesError && !loadingTemplates && (
          <div className="col-span-full rounded-lg border border-red-300 bg-red-50 p-5 text-sm text-red-700 space-y-3">
            <div className="font-medium">{templatesError}</div>
            {templatesError.toLowerCase().includes('unauthorized') && (
              <div className="text-xs text-red-600">
                You may be logged out. Open a new tab to log in, or refresh after signing in. Ensure localStorage has a valid token.
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTemplatesError(null); setLoadingTemplates(true);
                  listTemplates().then(data => {
                    const arr = Array.isArray(data) ? data : (data.templates || []);
                    setRemoteTemplates(arr.map((t:any)=>({ id: t._id||t.id, name: t.name||'Untitled Template', type: t.type||'residential', category: t.category||'full-house', thumbnail: t.thumbnailUrl||'/api/placeholder/400/300', description: t.description||'', features: Array.isArray(t.features)?t.features:[] })));
                    setLoadingTemplates(false);
                  }).catch(e => { setTemplatesError(e.message||'Failed to load templates'); setLoadingTemplates(false); });
                }}
                className="px-3 py-1.5 text-xs font-medium border border-red-400 rounded bg-white hover:bg-gray-50"
              >Retry</button>
              <button onClick={() => setManagingTemplate({ mode: 'create', data: { name: '', type: 'residential', category: 'full-house', description: '', features: [] } })} className="px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700">Create First Template</button>
            </div>
          </div>
        )}
        {!loadingTemplates && !templatesError && filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-20 text-sm text-gray-700 >No templates match your filters.</div>
        )}
  {!loadingTemplates && !templatesError && filteredTemplates.map(renderTemplateCard)}
      </div>
    </div>
  );

  const renderNewDesignView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <PencilSquareIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Design</h3>
        <p className="text-gray-800 mb-6">Start with a blank canvas or choose from our professional templates</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={async () => {
              if (creatingBlank) return; setImportError(null);
              setCreatingBlank(true);
              try {
                const created = await createDesign({ title: 'Untitled Design', baseData: { nodes: {} } });
                router.push(`/dashboard/designer/editor?design=${created.design._id}`);
              } catch (e:any) {
                setImportError(e.message || 'Failed to create blank design');
              } finally { setCreatingBlank(false); }
            }}
            className="p-6 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
            disabled={creatingBlank || importingCAD}
          >
            <PlusIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">{creatingBlank ? 'Creating...' : 'Blank Canvas'}</h4>
            <p className="text-sm text-gray-800">Start from scratch with our design tools</p>
          </button>
          <button
            onClick={() => { setImportError(null); fileInputRef.current?.click(); }}
            className="p-6 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
            disabled={creatingBlank || importingCAD}
          >
            <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">{importingCAD ? 'Importing...' : 'Import CAD File'}</h4>
            <p className="text-sm text-gray-800">Upload existing blueprints or CAD files</p>
          </button>
        </div>
        {importError && <div className="mt-4 text-sm text-red-600">{importError}</div>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.cad,.dxf,.txt"
          className="hidden"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImportingCAD(true); setImportError(null);
            try {
              const text = await file.text();
              let baseData: any = { nodes: {} };
              try {
                const parsed = JSON.parse(text);
                // Expect either { nodes: {...} } or { rooms: [...] }
                if (parsed.nodes) {
                  baseData.nodes = parsed.nodes;
                } else if (Array.isArray(parsed.rooms)) {
                  const nodes: any = {};
                  parsed.rooms.forEach((r:any, idx:number) => {
                    const id = r.id || `room_${idx}`;
                    nodes[id] = { id, x: r.x||50, y: r.y||50, w: r.w||160, h: r.h||100, label: r.label || r.name || 'Room', color: r.color || '#ffffff' };
                  });
                  baseData.nodes = nodes;
                } else if (Array.isArray(parsed)) { // array of simple blocks
                  const nodes: any = {};
                  parsed.forEach((r:any, idx:number) => {
                    const id = r.id || `n_${idx}`;
                    nodes[id] = { id, x: r.x||50, y: r.y||50, w: r.w||120, h: r.h||80, label: r.label || 'Block', color: r.color || '#ffffff' };
                  });
                  baseData.nodes = nodes;
                }
              } catch (jsonErr) {
                // Not JSON - basic fallback (unsupported for now)
                throw new Error('Unsupported file format (expect JSON with nodes/rooms)');
              }
              const created = await createDesign({ title: file.name.replace(/\.[^.]+$/, ''), baseData });
              router.push(`/dashboard/designer/editor?design=${created.design._id}`);
            } catch (err:any) {
              setImportError(err.message || 'Import failed');
            } finally {
              setImportingCAD(false); if (fileInputRef.current) fileInputRef.current.value='';
            }
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Designer Pro Integration</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HomeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Professional Design Tools</h4>
              <p className="text-sm text-gray-800 mt-1">
                Access advanced features like 3D visualization, material libraries, and professional rendering
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Launch Designer
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <CubeIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-800">3D Modeling</p>
            </div>
            <div className="text-center">
              <PaintBrushIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-800">Material Library</p>
            </div>
            <div className="text-center">
              <AdjustmentsHorizontalIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-800">Precise Tools</p>
            </div>
            <div className="text-center">
              <PhotoIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-800">Photo Rendering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Design Projects</h3>
        <p className="text-gray-800 mb-6">You haven't created any design projects yet</p>
        <button 
          onClick={() => setActiveView('new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Design
        </button>
      </div>
    </div>
  );

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between dark:text-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">Design Studio</h1>
            <p className="text-gray-800 dark:text-gray-300 mt-1">
              Create professional blueprints and 3D designs for your construction projects
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Import Design
            </button>
            <button 
              onClick={() => setActiveView('new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Design
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
  <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'templates', name: 'Templates', icon: Squares2X2Icon },
              { id: 'new', name: 'New Design', icon: PlusIcon },
              { id: 'projects', name: 'My Projects', icon: DocumentTextIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeView === tab.id
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeView === 'templates' && renderTemplatesView()}
        {activeView === 'new' && renderNewDesignView()}
        {activeView === 'projects' && renderProjectsView()}

        {/* Quick Tools */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-800 dark:text-gray-200 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Measure Tool</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ShareIcon className="h-8 w-8 text-gray-800 dark:text-gray-200 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Share Design</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <PrinterIcon className="h-8 w-8 text-gray-800 dark:text-gray-200 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Print Plans</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CloudArrowDownIcon className="h-8 w-8 text-gray-800 dark:text-gray-200 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Export CAD</span>
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {notice && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg text-sm border ${notice.type==='success' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}> 
            <div className="flex items-start gap-3">
              <span className="flex-1">{notice.msg}</span>
              <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        )}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{previewTemplate.name}</h3>
                <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-800 dark:text-gray-700 dark:hover:text-gray-300" aria-label="Close preview">✕</button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="h-56 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <PencilSquareIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{previewTemplate.description}</p>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.features.map((f,i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">{f}</span>
                  ))}
                </div>
                {previewTemplate.sqft && (
                  <div className="text-xs text-gray-700 dark:text-gray-300">{previewTemplate.sqft} sq ft {previewTemplate.bedrooms ? `• ${previewTemplate.bedrooms} bed` : ''} {previewTemplate.bathrooms ? `• ${previewTemplate.bathrooms} bath` : ''}</div>
                )}
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <button onClick={() => toggleFavorite(previewTemplate.id)} className="text-sm px-3 py-2 rounded-md border hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200">
                  {favorites.includes(previewTemplate.id) ? '★ Favorited' : '☆ Favorite'}
                </button>
                <div className="flex space-x-3">
                  <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200">Close</button>
                  <button onClick={() => { setPreviewTemplate(null); setActiveView('new'); }} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Use This Template</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {managingTemplate && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => !mutating && setManagingTemplate(null)} />
            <div className="w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {managingTemplate?.mode === 'create' ? 'Create Template' : 'Edit Template'}
                </h2>
                <button disabled={mutating} onClick={() => setManagingTemplate(null)} className="text-gray-400 hover:text-gray-800 dark:text-gray-700 dark:hover:text-gray-300">✕</button>
              </div>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (!managingTemplate) return;
                  setMutating(true);
                  try {
                    const payload: any = {
                      name: managingTemplate.data.name,
                      type: managingTemplate.data.type,
                      category: managingTemplate.data.category,
                      description: managingTemplate.data.description,
                      features: (managingTemplate.data.features || []).filter(f=>f)
                    };
                    if (managingTemplate.mode === 'create') {
                      await createTemplate(payload);
                      setNotice({ type: 'success', msg: 'Template created.' });
                    } else if (managingTemplate.data.id) {
                      await updateTemplate(managingTemplate.data.id, payload);
                      setNotice({ type: 'success', msg: 'Template updated.' });
                    }
                    setManagingTemplate(null);
                    setRefreshTick(t=>t+1);
                  } catch (err) {
                    setNotice({ type: 'error', msg: 'Save failed.' });
                    console.error(err);
                  } finally { setMutating(false); }
                }}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-800 dark:text-gray-300 mb-1">Name</label>
                  <input required value={managingTemplate?.data.name || ''} onChange={e => setManagingTemplate(m => m && ({ ...m, data: { ...m.data, name: e.target.value } }))} className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-800 dark:text-gray-300 mb-1">Type</label>
                    <input value={managingTemplate?.data.type || ''} onChange={e => setManagingTemplate(m => m && ({ ...m, data: { ...m.data, type: e.target.value } }))} className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" placeholder="residential" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-800 dark:text-gray-300 mb-1">Category</label>
                    <input value={managingTemplate?.data.category || ''} onChange={e => setManagingTemplate(m => m && ({ ...m, data: { ...m.data, category: e.target.value } }))} className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" placeholder="kitchen" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={managingTemplate?.data.description || ''} onChange={e => setManagingTemplate(m => m && ({ ...m, data: { ...m.data, description: e.target.value } }))} rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 dark:text-gray-300 mb-1">Features (comma separated)</label>
                  <input value={(managingTemplate?.data.features || []).join(', ')} onChange={e => setManagingTemplate(m => m && ({ ...m, data: { ...m.data, features: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) } }))} className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" />
                </div>
                <div className="flex items-center justify-between pt-4">
                  {managingTemplate?.mode === 'edit' && managingTemplate?.data.id && (
                    <button type="button" disabled={mutating} onClick={async () => { if (!confirm('Delete this template?')) return; if (!managingTemplate) return; setMutating(true); try { await deleteTemplate(managingTemplate.data.id!); setManagingTemplate(null); setRefreshTick(t=>t+1); setNotice({ type: 'success', msg: 'Template deleted.' }); } catch(e){ console.error(e); setNotice({ type: 'error', msg: 'Delete failed.' }); } finally { setMutating(false);} }} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button type="button" disabled={mutating} onClick={() => setManagingTemplate(null)} className="px-3 py-2 text-xs border rounded-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
                    <button type="submit" disabled={mutating} className="px-4 py-2 text-xs rounded-md bg-blue-600 text-white font-medium disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">{mutating ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
