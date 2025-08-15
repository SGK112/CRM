export interface DesignTemplate {
  _id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  features: string[];
  thumbnailUrl?: string;
  usesCount?: number;
}

export interface Design {
  _id: string;
  title: string;
  status: string;
  templateId?: string;
  currentRevisionId?: string;
}

export interface DesignRevision {
  _id: string;
  index: number;
  autosave: boolean;
  canvasData: any;
  createdAt: string;
}

// Reuse centralized API base + auth header helper
import { API_BASE, withAuthHeaders } from './api';

function authHeaders(): Record<string,string> {
  // Thin wrapper so we only expose headers object (some callers spread it)
  const init = withAuthHeaders();
  return (init.headers as Record<string,string>) || {};
}

export async function listTemplates(params: Record<string,string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/design-templates${qs ? `?${qs}`:''}`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
    throw new Error(`Failed to load templates (HTTP ${res.status})`);
  }
  return res.json();
}
// List designs (instances) helper
export async function listDesigns(params: Record<string,string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/designs${qs ? `?${qs}`:''}`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
    throw new Error(`Failed to load designs (HTTP ${res.status})`);
  }
  return res.json();
}

export async function createTemplate(payload: any) {
  const res = await fetch(`${API_BASE}/design-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function updateTemplate(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/design-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

export async function deleteTemplate(id: string) {
  const res = await fetch(`${API_BASE}/design-templates/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

export async function getTemplate(id: string) {
  const res = await fetch(`${API_BASE}/design-templates/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Failed to load template');
  return res.json();
}

export async function createDesign(payload: { templateId?: string; title?: string; baseData?: any; }) {
  const res = await fetch(`${API_BASE}/designs`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create design');
  return res.json();
}

export async function getDesign(id: string) {
  const res = await fetch(`${API_BASE}/designs/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Failed to load design');
  return res.json();
}

export async function saveRevision(designId: string, canvasData: any, autosave=false) {
  const res = await fetch(`${API_BASE}/designs/${designId}/revisions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ canvasData, autosave }) });
  if (!res.ok) throw new Error('Failed to save revision');
  return res.json();
}

export async function listRevisions(designId: string) {
  const res = await fetch(`${API_BASE}/designs/${designId}/revisions`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Failed to load revisions');
  return res.json();
}
