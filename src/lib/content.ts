import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import matter from 'gray-matter';
import { marked } from 'marked';
import sharp from 'sharp';

/*
  Everything he will ever edit lives in content/ and public/work/. This is
  the only module that reads them. It runs at build time: nothing here
  reaches a visitor's browser.

  It is strict on purpose. A photograph without alt text fails the build,
  because that is the exact path by which an image ships without one.
*/

const ROOT = process.cwd();
const WORK_DIR = path.join(ROOT, 'content', 'work');
const PUBLIC_WORK = path.join(ROOT, 'public', 'work');
const ABOUT_FILE = path.join(ROOT, 'content', 'about.md');

export type Kind = 'made' | 'mended';
export type Camera = 'phone' | 'broken';

export interface Photo {
  file: string;
  alt: string;
  /** URL under /public. */
  src: string;
  width: number;
  height: number;
  /** The photograph itself at sixteen pixels wide, as a data URL. */
  placeholder: string;
}

export interface Piece {
  slug: string;
  number: string;
  title: string;
  year?: number;
  kind?: Kind;
  materials: string[];
  tools: string[];
  owner?: string;
  hours?: number;
  camera: Camera;
  cover: Photo;
  photos: Photo[];
  /** The body, rendered. Placeholders in square brackets are marked. */
  html: string;
  /** For <meta name="description">. */
  summary: string;
}

export interface About {
  title: string;
  summary: string;
  html: string;
}

/* ─── helpers ─────────────────────────────────────────────────────────── */

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function strings(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

/* Anything he has not confirmed is wrapped so the page can make it loud. */
function markPlaceholders(html: string): string {
  return html.replace(/\[[^\]\n]+\]/g, (m) => `<span class="todo">${m}</span>`);
}

async function render(markdown: string): Promise<string> {
  const html = await marked.parse(markdown, { async: true, gfm: true });
  return markPlaceholders(html);
}

function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function photo(slug: string, file: string, alt: unknown): Promise<Photo> {
  const where = `content/work/${slug}.md`;
  if (typeof alt !== 'string' || !alt.trim()) fail(where, `photo ${file} has no alt text; every photograph needs one`);

  const abs = path.join(PUBLIC_WORK, slug, file);
  const image = sharp(abs);
  const meta = await image.metadata().catch(() => fail(where, `cannot read public/work/${slug}/${file}`));
  if (!meta.width || !meta.height) fail(where, `cannot read the dimensions of ${file}`);
  /* EXIF orientation 5–8 means the stored pixels are rotated a quarter turn. */
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  /* Sixteen pixels wide, scaled up pixelated behind the real image. */
  const tiny = await image.clone().rotate().resize(16).jpeg({ quality: 60 }).toBuffer();

  return {
    file,
    alt: alt.trim(),
    src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/work/${slug}/${file}`,
    width,
    height,
    placeholder: `data:image/jpeg;base64,${tiny.toString('base64')}`,
  };
}

async function readPiece(slug: string): Promise<Piece> {
  const where = `content/work/${slug}.md`;
  const raw = await fs.readFile(path.join(WORK_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);

  const title = typeof data.title === 'string' ? data.title.trim() : fail(where, 'needs a title');
  const number = data.number !== undefined ? String(data.number).padStart(3, '0') : fail(where, 'needs a number');
  if (!slug.startsWith(number)) fail(where, `number ${number} does not match the file name`);

  const list = Array.isArray(data.photos) ? data.photos : fail(where, 'needs a photos list');
  if (list.length === 0) fail(where, 'needs at least one photograph');
  const photos = await Promise.all(
    list.map((p: { file?: string; alt?: string }) =>
      typeof p.file === 'string' ? photo(slug, p.file, p.alt) : fail(where, 'a photo entry has no file'),
    ),
  );

  const coverFile = typeof data.cover === 'string' ? data.cover : photos[0].file;
  const cover = photos.find((p) => p.file === coverFile) ?? fail(where, `cover ${coverFile} is not in the photos list`);

  const kind = data.kind === 'made' || data.kind === 'mended' ? data.kind : undefined;
  if (data.kind !== undefined && !kind) fail(where, `kind must be made or mended, not ${String(data.kind)}`);
  const camera: Camera = data.camera === 'broken' ? 'broken' : 'phone';

  const html = await render(content.trim());
  const text = plain(html);
  const summary = text ? (text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text) : title;

  return {
    slug,
    number,
    title,
    year: typeof data.year === 'number' ? data.year : undefined,
    kind,
    materials: strings(data.materials),
    tools: strings(data.tools),
    owner: typeof data.owner === 'string' ? data.owner : undefined,
    hours: typeof data.hours === 'number' ? data.hours : undefined,
    camera,
    cover,
    photos,
    html,
    summary,
  };
}

/* ─── public ──────────────────────────────────────────────────────────── */

/** Every piece, newest first: the highest number is the latest. */
export const pieces = cache(async (): Promise<Piece[]> => {
  const files = (await fs.readdir(WORK_DIR)).filter((f) => f.endsWith('.md')).sort();
  const all = await Promise.all(files.map((f) => readPiece(f.replace(/\.md$/, ''))));
  return all.sort((a, b) => b.number.localeCompare(a.number));
});

export async function piece(slug: string): Promise<Piece | undefined> {
  return (await pieces()).find((p) => p.slug === slug);
}

/** The pieces either side of this one in the index order. */
export async function neighbours(slug: string): Promise<{ previous?: Piece; next?: Piece }> {
  const all = await pieces();
  const i = all.findIndex((p) => p.slug === slug);
  if (i < 0) return {};
  /* The index runs newest first, so "previous" is the older piece below it. */
  return { previous: all[i + 1], next: all[i - 1] };
}

export const about = cache(async (): Promise<About> => {
  const raw = await fs.readFile(ABOUT_FILE, 'utf8');
  const { data, content } = matter(raw);
  return {
    title: typeof data.title === 'string' ? data.title : 'about',
    summary: typeof data.summary === 'string' ? data.summary : '',
    html: await render(content.trim()),
  };
});
