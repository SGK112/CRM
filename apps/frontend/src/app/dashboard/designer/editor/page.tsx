'use client';

"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import Layout from '../../../../components/Layout';
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { createDesign, getDesign, saveRevision } from '../../../../lib/designsApi';
import { CABINET_CATALOG, catalogToCabinet, createEmptyDesignState, DesignState } from '../../../../lib/designModel';
import { computeTakeoff } from '../../../../lib/takeoff';

function DesignEditorPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const templateId = params.get('template');
  const designId = params.get('design');
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [design, setDesign] = useState<any>(null);
  // Legacy nodes (rooms/doors/windows) remain for now; new parametric state added
  const [nodes, setNodes] = useState<Record<string, any>>({});
  const [designState, setDesignState] = useState<DesignState>(createEmptyDesignState());
  const [selection, setSelection] = useState<string | null>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [snap, setSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });
  const [history, setHistory] = useState<{ past: Record<string, any>[], future: Record<string, any>[] }>({ past: [], future: [] });

  const pushHistory = (nextNodes: Record<string, any>) => {
    setHistory(h => ({ past: [...h.past.slice(-49), nodes], future: [] }));
    setNodes(nextNodes);
    setIsDirty(true);
  };

  const undo = () => {
    setHistory(h => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      const newFuture = [nodes, ...h.future];
      setNodes(previous);
      setIsDirty(true);
      return { past: newPast, future: newFuture };
    });
  };

  const redo = () => {
    setHistory(h => {
      if (!h.future.length) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      const newPast = [...h.past, nodes];
      setNodes(next);
      setIsDirty(true);
      return { past: newPast, future: newFuture };
    });
  };

  const GRID_SIZE = 20;

  // Node type configuration for dynamic fields
  interface NodeFieldMeta {
    type: 'text' | 'number' | 'color' | 'select';
    label: string;
    min?: number; max?: number; step?: number;
    options?: string[];
  }
  interface NodeTypeConfig {
    label: string;
    defaults: Record<string, any>;
    fields: Record<string, NodeFieldMeta>;
  }
  const nodeTypes = useMemo<Record<string, NodeTypeConfig>>(() => ({
    room: {
      label: 'Room',
      defaults: { w: 160, h: 100, label: 'Room', color: '#ffffff' },
      fields: {
        label: { type: 'text', label: 'Label' },
        w: { type: 'number', label: 'Width', min: 20, step: 10 },
        h: { type: 'number', label: 'Height', min: 20, step: 10 },
        color: { type: 'color', label: 'Color' },
        floor: { type: 'select', label: 'Floor', options: ['Basement', '1', '2', '3'] }
      }
    },
    door: {
      label: 'Door',
      defaults: { w: 60, h: 12, label: 'Door', color: '#f5f5f5', swing: 'left' },
      fields: {
        label: { type: 'text', label: 'Label' },
        w: { type: 'number', label: 'Width', min: 20, step: 5 },
        swing: { type: 'select', label: 'Swing', options: ['left', 'right'] },
        color: { type: 'color', label: 'Color' }
      }
    },
    window: {
      label: 'Window',
      defaults: { w: 80, h: 10, label: 'Window', color: '#e0f2fe', style: 'double' },
      fields: {
        label: { type: 'text', label: 'Label' },
        w: { type: 'number', label: 'Width', min: 20, step: 5 },
        style: { type: 'select', label: 'Style', options: ['single', 'double', 'bay'] },
        color: { type: 'color', label: 'Color' }
      }
    }
  }), []);

  const loadOrCreate = useCallback(async () => {
    try {
      if (designId) {
        const data = await getDesign(designId);
        setDesign(data.design);
  setNodes(data.revision?.canvasData?.nodes || {});
  // Future: load parametric design state from revision once stored
      } else {
        const created = await createDesign({ templateId: templateId || undefined });
        setDesign(created.design);
        setNodes(created.revision?.canvasData?.nodes || {});
  setDesignState(createEmptyDesignState());
        const sp = new URLSearchParams(Array.from(params.entries()));
        sp.delete('template');
        sp.set('design', created.design._id);
        router.replace(`/dashboard/designer/editor?${sp.toString()}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [designId, templateId, params, router]);

  useEffect(() => { loadOrCreate(); }, [loadOrCreate]);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isDirty]);

  const scheduleAutosave = useCallback(() => {
    if (!design) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      try {
        await saveRevision(design._id, { nodes }, true);
        setIsDirty(false);
      } catch (e) {
        console.warn('Autosave failed', e);
      }
    }, 3000);
  }, [design, nodes]);

  useEffect(() => { if (isDirty) scheduleAutosave(); }, [isDirty, scheduleAutosave]);

  const addNode = (type: string = 'room') => {
    const config: NodeTypeConfig = nodeTypes[type] || nodeTypes.room;
    const id = `node_${Date.now()}`;
    const defaults = config.defaults || {};
  const next = { ...nodes, [id]: { id, type, x: Math.round((80 - pan.x)/scale), y: Math.round((80 - pan.y)/scale), ...defaults } };
  pushHistory(next);
  setSelection(id);
  };

  const updateNode = (id: string, patch: Partial<any>) => {
  setNodes(n => ({ ...n, [id]: { ...n[id], ...patch } }));
  setIsDirty(true); // fine-grained updates not pushing every move to history for performance
  };

  const onDragNode = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX; const startY = e.clientY;
    const node = nodes[id];
    const orig = { x: node.x, y: node.y };
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX; const dy = ev.clientY - startY;
      let nx = orig.x + dx / scale; let ny = orig.y + dy / scale;
      if (snap) {
        nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
        ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
      }
      updateNode(id, { x: nx, y: ny });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); pushHistory({ ...nodes, [id]: { ...nodes[id] } }); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const onResizeNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX; const startY = e.clientY;
    const node = nodes[id];
    const orig = { w: node.w, h: node.h };
    const move = (ev: MouseEvent) => {
      let nw = orig.w + (ev.clientX - startX) / scale;
      let nh = orig.h + (ev.clientY - startY) / scale;
      if (snap) {
        nw = Math.max(10, Math.round(nw / GRID_SIZE) * GRID_SIZE);
        nh = Math.max(10, Math.round(nh / GRID_SIZE) * GRID_SIZE);
      }
      updateNode(id, { w: nw, h: nh });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); pushHistory({ ...nodes, [id]: { ...nodes[id] } }); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // Canvas panning
  const startPan = (e: React.MouseEvent) => {
    if (!(e.button === 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.currentTarget === e.target)) return; // only background / mid click / with modifier
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY, origX: pan.x, origY: pan.y };
    e.preventDefault();
  };
  useEffect(() => {
    const move = (ev: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = ev.clientX - panStartRef.current.x;
      const dy = ev.clientY - panStartRef.current.y;
      setPan({ x: panStartRef.current.origX + dx, y: panStartRef.current.origY + dy });
    };
    const up = () => { isPanningRef.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [pan.x, pan.y]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if ((e.key === 'Z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
        else if (e.key === '+' || e.key === '=') { e.preventDefault(); setScale(s => Math.min(3, parseFloat((s + 0.1).toFixed(2)))); }
        else if (e.key === '-') { e.preventDefault(); setScale(s => Math.max(0.2, parseFloat((s - 0.1).toFixed(2)))); }
        else if (e.key === '0') { e.preventDefault(); setScale(1); setPan({ x: 0, y: 0 }); }
      }
      if (selection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        const next = { ...nodes }; delete next[selection]; setSelection(null); pushHistory(next);
      }
      if (selection && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 2;
        const node = nodes[selection]; if (!node) return;
        let patch: any = {};
        if (e.key === 'ArrowUp') patch.y = node.y - delta;
        if (e.key === 'ArrowDown') patch.y = node.y + delta;
        if (e.key === 'ArrowLeft') patch.x = node.x - delta;
        if (e.key === 'ArrowRight') patch.x = node.x + delta;
        updateNode(selection, patch);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selection, nodes]);

  const duplicateSelection = () => {
    if (!selection || !nodes[selection]) return;
    const original = nodes[selection];
    const id = `node_${Date.now()}`;
    const next = { ...nodes, [id]: { ...original, id, x: original.x + 20, y: original.y + 20 } };
    pushHistory(next);
    setSelection(id);
  };

  // Drag cabinets (simplistic - no snap yet)
  const onDragCabinet = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX; const startY = e.clientY;
    const cab = designState.cabinets[id]; if(!cab) return;
    const orig = { x: cab.x, y: cab.y };
    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale; const dy = (ev.clientY - startY) / scale;
      setDesignState(s => ({ ...s, cabinets: { ...s.cabinets, [id]: { ...s.cabinets[id], x: orig.x + dx, y: orig.y + dy } }}));
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); setIsDirty(true); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };

  const generateCountertopFromCabinets = () => {
    const cabs = Object.values(designState.cabinets);
    if (!cabs.length) return;
    const pad = 40; // mm padding outward
    const minX = Math.min(...cabs.map(c=>c.x)) * 4 - pad;
    const minY = Math.min(...cabs.map(c=>c.y)) * 4 - pad;
    const maxX = Math.max(...cabs.map(c=>c.x + c.width/4)) * 4 + pad;
    const maxY = Math.max(...cabs.map(c=>c.y + c.depth/4)) * 4 + pad;
    const poly = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY }
    ];
    const id = 'ct_auto';
    setDesignState(s => ({ ...s, countertops: { ...s.countertops, [id]: { id, polygon: poly, thickness: 30, cutouts: [] } } }));
    setIsDirty(true);
  };

  const manualSave = async () => {
    if (!design) return;
    setSaving(true);
    try {
      await saveRevision(design._id, { nodes }, false);
      setIsDirty(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // Cabinet placement helper
  const placeCatalogCabinet = (specId: string) => {
    const cab = catalogToCabinet(specId, Math.round((120 - pan.x)/scale), Math.round((120 - pan.y)/scale));
    if (!cab) return;
    setDesignState(s => ({ ...s, cabinets: { ...s.cabinets, [cab.id]: cab } }));
    setIsDirty(true);
  };

  const takeoff = computeTakeoff(designState);

  return (
    <Layout>
      <div className="space-y-6 dark:text-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="pill pill-tint-neutral" aria-label="Back">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <span className="pill pill-tint-blue sm mr-2"><PencilSquareIcon className="h-4 w-4" /></span>
              {design?.title || 'Design Editor'} {templateId && !designId && <span className="ml-2 pill pill-tint-neutral sm">Template</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="pill sm pill-tint-green disabled:opacity-40" onClick={manualSave} disabled={!isDirty || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="pill sm pill-tint-indigo" onClick={() => setIsDirty(false)}>
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[60vh] flex items-center justify-center text-gray-400">Loading design...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="relative lg:col-span-3 surface-1 rounded-xl border border-token h-[60vh] overflow-hidden" onMouseDown={startPan}>
              {/* Grid */}
              {showGrid && (
                <>
                  <div className="absolute inset-0 pointer-events-none dark:hidden" style={{ backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`, backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`, transform: `translate(${pan.x % (GRID_SIZE*scale)}px, ${pan.y % (GRID_SIZE*scale)}px)`, backgroundPosition: `${pan.x}px ${pan.y}px`, backgroundRepeat: 'repeat' }} />
                  <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`, backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`, transform: `translate(${pan.x % (GRID_SIZE*scale)}px, ${pan.y % (GRID_SIZE*scale)}px)` }} />
                </>
              )}
              {/* Nodes + Cabinets layer with pan & zoom */}
              <div className="absolute inset-0" style={{ cursor: isPanningRef.current ? 'grabbing' : 'default' }}>
                <div
                  className="w-full h-full relative"
                  style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}
                >
                  {/* Countertops */}
                  {Object.values(designState.countertops).map(ct => (
                    <svg key={ct.id} className="absolute overflow-visible" style={{ left:0, top:0 }}>
                      <polygon points={ct.polygon.map(p=>`${p.x},${p.y}`).join(' ')} className="fill-pink-500/10 stroke-pink-500/60" strokeWidth={2} />
                    </svg>
                  ))}
                  {/* Cabinets */}
                  {Object.values(designState.cabinets).map(c => (
                    <div
                      key={c.id}
                      onMouseDown={e => { e.stopPropagation(); setSelection(c.id); /* allow future drag logic */ }}
                      className={`absolute border rounded-md text-[9px] font-medium flex items-center justify-center select-none transition-colors ${selection===c.id ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10 dark:ring-emerald-400 dark:border-emerald-400' : 'border-emerald-600/40 dark:border-emerald-400/40 hover:border-emerald-400/80'} bg-emerald-500/5 dark:bg-emerald-400/10`}
                      style={{ left: c.x, top: c.y, width: c.width/4, height: c.depth/4 }}
                      title={c.label}
                    >
                      <span className="px-1 text-emerald-600 dark:text-emerald-300 truncate">{c.label}</span>
                    </div>
                  ))}
                  {/* Legacy nodes */}
                  {Object.values(nodes).map((n: any) => (
                    <div
                      key={n.id}
                      onMouseDown={e => { setSelection(n.id); onDragNode(n.id, e); }}
                      className={`absolute border rounded-md shadow-sm select-none text-[11px] font-medium flex items-center justify-center transition-colors group ${selection===n.id ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400' : 'cursor-move border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-300'} bg-white/90 dark:bg-[var(--surface-2)]/80 backdrop-blur-[2px]`}
                      style={{ left: n.x, top: n.y, width: n.w, height: n.h, background: n.color }}
                    >
                      {n.label || n.type}
                      {selection===n.id && (
                        <div
                          onMouseDown={(e) => onResizeNode(n.id, e)}
                          className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-3 w-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-900 rounded-sm cursor-se-resize shadow"
                          title="Drag to resize"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Canvas Toolbar */}
              <div className="absolute top-2 right-2 flex flex-wrap gap-1 p-2 rounded-2xl bg-[var(--surface-1)]/90 backdrop-blur-sm border border-[var(--border)] shadow-md">
                <button aria-label="Zoom out" onClick={()=> setScale(s=> Math.max(0.2, parseFloat((s-0.1).toFixed(2))))} className="pill sm pill-tint-neutral">-</button>
                <div className="pill sm pill-tint-indigo min-w-[50px] justify-center" title="Current zoom">{Math.round(scale*100)}%</div>
                <button aria-label="Zoom in" onClick={()=> setScale(s=> Math.min(3, parseFloat((s+0.1).toFixed(2))))} className="pill sm pill-tint-neutral">+</button>
                <button title="Reset view" onClick={()=> { setScale(1); setPan({ x:0,y:0}); }} className="pill sm pill-tint-indigo">100%</button>
                <button aria-pressed={showGrid} onClick={()=> setShowGrid(g=>!g)} className={`pill sm ${showGrid ? 'pill-tint-blue' : 'pill-tint-neutral'}`}>Grid</button>
                <button aria-pressed={snap} onClick={()=> setSnap(s=>!s)} className={`pill sm ${snap ? 'pill-tint-blue' : 'pill-tint-neutral'}`}>Snap</button>
                <button disabled={!history.past.length} title="Undo (⌘Z)" onClick={undo} className="pill sm pill-tint-neutral disabled:opacity-40">↶</button>
                <button disabled={!history.future.length} title="Redo (⌘⇧Z)" onClick={redo} className="pill sm pill-tint-neutral disabled:opacity-40">↷</button>
                <button title="Auto-generate countertop" onClick={generateCountertopFromCabinets} className="pill sm pill-tint-purple">CT</button>
              </div>
              {/* Add Nodes Palette */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1 p-2 rounded-xl bg-[var(--surface-1)]/85 backdrop-blur-sm border border-[var(--border)] shadow">
                {Object.entries(nodeTypes).map(([t, cfg]: any) => (
                  <button key={t} onClick={() => addNode(t)} className="pill sm pill-tint-blue">+ {cfg.label}</button>
                ))}
              </div>
              {isDirty && <div className="absolute bottom-2 right-2 pill sm pill-tint-yellow">Unsaved</div>}
            </div>
            <div className="space-y-6">
              <div className="surface-1 rounded-xl border border-token p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Layers</h3>
                <div className="space-y-1 max-h-40 overflow-auto pr-1 custom-scroll">
                  {Object.values(nodes).length === 0 && <div className="text-xs text-gray-400 dark:text-gray-500">No elements yet.</div>}
                  {Object.values(nodes).map((n:any) => (
                    <button key={n.id} onClick={() => setSelection(n.id)} className={`w-full text-left px-2 py-1 rounded-md text-xs border transition-colors ${(selection===n.id) ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-400 dark:border-blue-400 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{n.label || n.type}</button>
                  ))}
                </div>
              </div>
              <div className="surface-1 rounded-xl border border-token p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Cabinet Catalog</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CABINET_CATALOG.map(c => (
                    <button key={c.id} onClick={()=> placeCatalogCabinet(c.id)} className="text-[10px] px-2 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{c.label}</div>
                      <div className="text-[9px] text-gray-500 dark:text-gray-400">{c.widthIn}" x {c.heightIn}"</div>
                    </button>
                  ))}
                </div>
                {Object.values(designState.cabinets).length === 0 && <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Click to place on canvas.</div>}
              </div>
              <div className="surface-1 rounded-xl border border-token p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Properties</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Design Title</label>
                    <input className="input text-sm" value={design?.title || ''} onChange={e => { setDesign({ ...design, title: e.target.value }); setIsDirty(true); }} />
                  </div>
                  {selection && nodes[selection] && (() => {
                    const node = nodes[selection];
                    const config: NodeTypeConfig = nodeTypes[(node.type as string) || 'room'] || nodeTypes.room;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <span>{config.label} Properties</span>
                          <span className="pill sm pill-tint-neutral">{node.type || 'room'}</span>
                        </div>
                        {Object.entries(config.fields).map(([field, meta]: any) => {
                          const value = node[field] ?? '';
                          const commonProps = {
                            key: field,
                            className: meta.type === 'color' ? 'w-full h-8 border rounded bg-white dark:bg-[var(--surface-2)] dark:border-gray-800' : 'w-full px-2 py-1 text-xs border rounded bg-white dark:bg-[var(--surface-2)] dark:border-gray-800 dark:text-gray-200',
                            value,
                            onChange: (e: any) => {
                              let v: any = e.target.value;
                              if (meta.type === 'number') v = Number(v);
                              updateNode(selection, { [field]: v });
                            }
                          };
                          return (
                            <div key={field} className="space-y-1">
                              <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400">{meta.label || field}</label>
                              {meta.type === 'select' ? (
                                <select {...commonProps}>
                                  {meta.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : meta.type === 'color' ? (
                                <input type="color" {...commonProps} />
                              ) : (
                                <input type={meta.type} step={meta.step} min={meta.min} max={meta.max} {...commonProps} />
                              )}
                            </div>
                          );
                        })}
                        <div className="pt-2 flex gap-2">
                          <button type="button" onClick={duplicateSelection} className="flex-1 px-2 py-1 rounded-md text-[11px] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Duplicate</button>
                          <button type="button" onClick={() => { if(!selection) return; const next = { ...nodes }; delete next[selection]; setSelection(null); pushHistory(next); }} className="px-2 py-1 rounded-md text-[11px] border border-red-400 text-red-600 hover:bg-red-50 dark:border-red-600/60 dark:text-red-400 dark:hover:bg-red-500/10">Delete</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="surface-1 rounded-xl border border-token p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Take-Off Summary</h3>
                <div className="space-y-2 text-[11px] text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between"><span>Cabinets</span><span>{takeoff.summary.cabinetCount}</span></div>
                  <div className="flex justify-between"><span>Cabinet LF</span><span>{takeoff.summary.cabinetLF}</span></div>
                  {takeoff.summary.countertopAreaSqFt > 0 && (
                    <div className="flex justify-between"><span>CT Area (sqft)</span><span>{takeoff.summary.countertopAreaSqFt}</span></div>
                  )}
                  {takeoff.summary.edgeLF > 0 && (
                    <div className="flex justify-between"><span>CT Edge LF</span><span>{takeoff.summary.edgeLF}</span></div>
                  )}
                </div>
                <button onClick={()=> console.log('Detailed Takeoff', takeoff)} className="mt-3 w-full px-3 py-1.5 text-[11px] rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Log Detail</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function DesignEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading editor...</div>}>
      <DesignEditorPageInner />
    </Suspense>
  );
}
