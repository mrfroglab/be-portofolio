export const PROJECT_CATEGORIES = ['web', 'desktop', 'tool'] as const;
export const PROJECT_STATUSES = ['live', 'open-source', 'internal'] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ProjectData {
  title: string;
  description: string;
  slug: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  releaseUrl: string | null;
  year: string | null;
  role: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  highlights: string[];
  featured: boolean;
  order: number;
  visible: boolean;
}

export type ParseResult =
  | { ok: true; data: Partial<ProjectData> }
  | { ok: false; message: string };

const NULLABLE_TEXT = ['imageUrl', 'liveUrl', 'githubUrl', 'releaseUrl', 'year', 'role'] as const;

const fail = (message: string): ParseResult => ({ ok: false, message });

// Keep in sync with the slug backfill in prisma/migrations/20261109120000_add_project_details.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Validates a create/update body for a project.
 * - create: title and description are required.
 * - update: any subset; only the given fields are returned.
 * Nullable text fields turn "" into null. A given slug is passed through slugify();
 * on create an empty slug is dropped so the route can generate one from the title.
 * tags, order and visible keep the old lenient behaviour: wrong types are ignored.
 */
export function parseProjectInput(body: unknown, mode: 'create' | 'update'): ParseResult {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const data: Partial<ProjectData> = {};

  for (const key of ['title', 'description'] as const) {
    const value = input[key];
    if (value === undefined) {
      if (mode === 'create') return fail('Judul dan deskripsi proyek wajib diisi.');
      continue;
    }
    if (typeof value !== 'string' || value.trim() === '') {
      return fail(`Field "${key}" harus berupa teks yang tidak kosong.`);
    }
    data[key] = value.trim();
  }

  for (const key of NULLABLE_TEXT) {
    const value = input[key];
    if (value === undefined) continue;
    if (value !== null && typeof value !== 'string') {
      return fail(`Field "${key}" harus berupa teks atau null.`);
    }
    data[key] = value === null || value.trim() === '' ? null : value.trim();
  }

  if (input.slug !== undefined) {
    if (input.slug !== null && typeof input.slug !== 'string') {
      return fail('Field "slug" harus berupa teks atau null.');
    }
    const raw = input.slug === null ? '' : input.slug.trim();
    if (raw === '') {
      if (mode === 'update') data.slug = null;
    } else {
      const slug = slugify(raw);
      if (slug === '') return fail('Field "slug" harus mengandung huruf atau angka.');
      data.slug = slug;
    }
  }

  if (input.category !== undefined) {
    if (!PROJECT_CATEGORIES.includes(input.category as ProjectCategory)) {
      return fail(`Field "category" harus salah satu dari: ${PROJECT_CATEGORIES.join(', ')}.`);
    }
    data.category = input.category as ProjectCategory;
  }

  if (input.status !== undefined) {
    if (!PROJECT_STATUSES.includes(input.status as ProjectStatus)) {
      return fail(`Field "status" harus salah satu dari: ${PROJECT_STATUSES.join(', ')}.`);
    }
    data.status = input.status as ProjectStatus;
  }

  if (input.highlights !== undefined) {
    if (!Array.isArray(input.highlights) || input.highlights.some((h) => typeof h !== 'string')) {
      return fail('Field "highlights" harus berupa daftar teks.');
    }
    data.highlights = (input.highlights as string[]).map((h) => h.trim()).filter(Boolean);
  }

  if (input.featured !== undefined) {
    if (typeof input.featured !== 'boolean') return fail('Field "featured" harus true atau false.');
    data.featured = input.featured;
  }

  if (Array.isArray(input.tags)) data.tags = input.tags;
  if (typeof input.order === 'number') data.order = input.order;
  if (typeof input.visible === 'boolean') data.visible = input.visible;

  return { ok: true, data };
}
