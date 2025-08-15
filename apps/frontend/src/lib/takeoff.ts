// Basic take-off computation utilities.
import { DesignState, Cabinet, CountertopSurface } from './designModel';

export interface TakeoffItem { sku?: string; category: string; description: string; qty: number; unit: string; extra?: Record<string, any>; }
export interface TakeoffResult { items: TakeoffItem[]; summary: { cabinetCount: number; cabinetLF: number; countertopAreaSqFt: number; edgeLF: number }; }

const MM_PER_IN = 25.4;
const SQMM_PER_SQFT = (304.8*304.8);

function cabinetLinearFoot(c: Cabinet): number {
  // width in inches /12 yields linear feet contribution; treat tall/island same for now
  return (c.width / MM_PER_IN) / 12; // Actually width in inches divided by 12 => feet, then treat as run; refine later
}

function polygonArea(points: {x:number;y:number}[]): number { // signed area (positive expected)
  let a = 0; for (let i=0;i<points.length;i++){ const p=points[i]; const n=points[(i+1)%points.length]; a += p.x*n.y - n.x*p.y; } return Math.abs(a)/2;
}

function perimeter(points: {x:number;y:number}[]): number {
  let p=0; for (let i=0;i<points.length;i++){ const a=points[i]; const b=points[(i+1)%points.length]; p += Math.hypot(b.x-a.x, b.y-a.y); } return p;
}

function countertopMetrics(ct: CountertopSurface){
  const areaMM2 = polygonArea(ct.polygon);
  const edge = perimeter(ct.polygon); // naive: all edges counted
  return { areaMM2, edgeMM: edge };
}

export function computeTakeoff(state: DesignState): TakeoffResult {
  const items: TakeoffItem[] = [];
  const cabinets = Object.values(state.cabinets);
  const cabinetCount = cabinets.length;
  const cabinetLF = cabinets.reduce((s,c)=> s + cabinetLinearFoot(c), 0);
  items.push({ category: 'cabinets', description: 'Cabinets (count)', qty: cabinetCount, unit: 'ea' });
  items.push({ category: 'cabinets', description: 'Cabinet Run', qty: parseFloat(cabinetLF.toFixed(2)), unit: 'LF' });

  const countertops = Object.values(state.countertops);
  let areaMM2 = 0; let edgeMM = 0;
  countertops.forEach(ct => { const m = countertopMetrics(ct); areaMM2 += m.areaMM2; edgeMM += m.edgeMM; });
  const areaSqFt = areaMM2 / SQMM_PER_SQFT;
  const edgeLF = (edgeMM / MM_PER_IN) / 12;
  if (countertops.length) {
    items.push({ category: 'countertops', description: 'Countertop Area', qty: parseFloat(areaSqFt.toFixed(2)), unit: 'sqft' });
    items.push({ category: 'countertops', description: 'Countertop Edge', qty: parseFloat(edgeLF.toFixed(2)), unit: 'LF' });
  }
  return { items, summary: { cabinetCount, cabinetLF: parseFloat(cabinetLF.toFixed(2)), countertopAreaSqFt: parseFloat(areaSqFt.toFixed(2)), edgeLF: parseFloat(edgeLF.toFixed(2)) } };
}
