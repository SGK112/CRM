// Domain design model scaffolding for cabinets, countertops, walls, and takeoff-ready state.
// This is an initial lightweight schema; will evolve.

export type UnitSystem = 'imperial' | 'metric'; // internal base unit: millimeters (mm) for geometry

export interface Wall {
  id: string;
  start: { x: number; y: number }; // mm
  end: { x: number; y: number };   // mm
  thickness: number; // mm
  height: number; // mm
  openings: Array<{
    id: string;
    type: 'door' | 'window';
    offset: number; // distance from start along wall centerline (mm)
    width: number; // mm
    height: number; // mm
    sillHeight?: number; // mm for windows
  }>;  
}

export type CabinetMount = 'base' | 'wall' | 'tall' | 'island' | 'corner-blind' | 'corner-diag';

export interface Cabinet {
  id: string;
  mount: CabinetMount;
  width: number; // mm
  depth: number; // mm
  height: number; // mm (carcass height)
  x: number; // mm
  y: number; // mm
  rotation: number; // deg (0 default)
  label?: string;
  sku?: string;
  doorStyleId?: string;
  finishId?: string;
  drawers?: Array<{ id: string; height: number }>; // optional drawer stack
  metadata?: Record<string, any>;
}

export interface CountertopSurface {
  id: string;
  polygon: { x: number; y: number }[]; // mm coordinates
  thickness: number; // mm
  materialId?: string;
  edgeProfileId?: string;
  cutouts: Array<{ id: string; type: 'sink' | 'cooktop' | 'faucet'; x: number; y: number; width: number; height: number; }>; // simple rectangular for now
}

export interface DesignState {
  walls: Record<string, Wall>;
  cabinets: Record<string, Cabinet>;
  countertops: Record<string, CountertopSurface>;
  tileSurfaces?: Record<string, { id: string; polygon: {x:number;y:number}[]; materialId?: string; }>; // simple tile regions
  settings: { units: UnitSystem };
}

export const createEmptyDesignState = (): DesignState => ({
  walls: {},
  cabinets: {},
  countertops: {},
  tileSurfaces: {},
  settings: { units: 'imperial' }
});

// Simple sample cabinet catalog with imperial front-facing dimensions converted to mm (1 inch = 25.4mm)
const INCH = 25.4;
export interface CatalogCabinetSpec { id: string; mount: CabinetMount; widthIn: number; depthIn: number; heightIn: number; label: string; }
export const CABINET_CATALOG: CatalogCabinetSpec[] = [
  { id: 'base-30', mount: 'base', widthIn: 30, depthIn: 24, heightIn: 34.5, label: 'Base 30"' },
  { id: 'base-36', mount: 'base', widthIn: 36, depthIn: 24, heightIn: 34.5, label: 'Base 36"' },
  { id: 'wall-30x30', mount: 'wall', widthIn: 30, depthIn: 12, heightIn: 30, label: 'Wall 30"H' },
  { id: 'tall-24x84', mount: 'tall', widthIn: 24, depthIn: 24, heightIn: 84, label: 'Tall 84"' },
  { id: 'island-36', mount: 'island', widthIn: 36, depthIn: 24, heightIn: 34.5, label: 'Island 36"' },
];

export const catalogToCabinet = (specId: string, x: number, y: number): Cabinet | null => {
  const spec = CABINET_CATALOG.find(c => c.id === specId);
  if (!spec) return null;
  return {
    id: `cab_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    mount: spec.mount,
    width: spec.widthIn * INCH,
    depth: spec.depthIn * INCH,
    height: spec.heightIn * INCH,
    x, y,
    rotation: 0,
    label: spec.label
  };
};

export const formatDimension = (mm: number, units: UnitSystem): string => {
  if (units === 'metric') return `${(mm).toFixed(0)} mm`;
  const inchesTotal = mm / 25.4;
  const whole = Math.floor(inchesTotal);
  const frac = inchesTotal - whole;
  const eighth = Math.round(frac * 8);
  const fracStr = eighth === 0 ? '' : (eighth === 8 ? ' 1' : ` ${eighth}/8`);
  return `${whole}${fracStr}"`;
};
