/*
  What the browser remembers of the cloth: the wear map at a fixed size, the
  mends, and how many times it has been opened. Per browser, never shared.
  Instagram's in-app browser may not keep this between sessions; accepted.
*/

export const KEY = 'cloth.v1';
export const WASH_EVENT = 'cloth:wash';

/** The wear map is stored at this size whatever the viewport. */
export const MAP_W = 128;
export const MAP_H = 96;

export interface Mend {
  kind: 'site' | 'hand';
  /* Normalised to the viewport, 0–1. */
  x: number;
  y: number;
  w: number;
  h: number;
  /* Which piece's cover photograph patches it. */
  patch: string;
  /* Hand mends: the stitch path, normalised, as [x0, y0, x1, y1, …]. */
  path?: number[];
}

export interface Saved {
  wear: string;
  mends: Mend[];
  visits: number;
  at: number;
}

export function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Saved>;
    if (typeof data.wear !== 'string' || !Array.isArray(data.mends)) return null;
    return {
      wear: data.wear,
      mends: data.mends,
      visits: typeof data.visits === 'number' ? data.visits : 0,
      at: typeof data.at === 'number' ? data.at : 0,
    };
  } catch {
    return null;
  }
}

export function save(data: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* Storage full or forbidden: the cloth simply does not remember. */
  }
}

export function wash(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* Nothing to forget. */
  }
}

export function encodeMap(map: Uint8Array): string {
  let s = '';
  for (let i = 0; i < map.length; i += 0x8000) {
    s += String.fromCharCode(...map.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

export function decodeMap(s: string): Uint8Array | null {
  try {
    const bin = atob(s);
    if (bin.length !== MAP_W * MAP_H) return null;
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}
