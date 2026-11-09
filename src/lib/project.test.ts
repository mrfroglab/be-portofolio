import { describe, expect, it } from 'vitest';
import { parseProjectInput, slugify, uniqueSlug } from './project';

const valid = { title: 'Cak MaD Editor', description: 'Editor Markdown.' };

describe('slugify', () => {
  it('lowercases and collapses non-alphanumerics into dashes', () => {
    expect(slugify('Cak MaD Editor')).toBe('cak-mad-editor');
    expect(slugify("Java Al-'Alim UGM")).toBe('java-al-alim-ugm');
    expect(slugify("Jama'ah Vokasi Al-'Alim (WordPress)")).toBe('jama-ah-vokasi-al-alim-wordpress');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('  --Boros Token!! ')).toBe('boros-token');
    expect(slugify('***')).toBe('');
  });
});

describe('uniqueSlug', () => {
  it('returns the base when free', () => {
    expect(uniqueSlug('cepaty', ['other'])).toBe('cepaty');
  });

  it('appends the first free counter', () => {
    expect(uniqueSlug('cepaty', ['cepaty'])).toBe('cepaty-2');
    expect(uniqueSlug('cepaty', ['cepaty', 'cepaty-2', 'cepaty-3'])).toBe('cepaty-4');
  });
});

describe('parseProjectInput (create)', () => {
  it('requires title and description', () => {
    expect(parseProjectInput({}, 'create')).toEqual({ ok: false, message: 'Judul dan deskripsi proyek wajib diisi.' });
    expect(parseProjectInput({ title: 'x' }, 'create').ok).toBe(false);
    expect(parseProjectInput(null, 'create').ok).toBe(false);
  });

  it('accepts a minimal body', () => {
    expect(parseProjectInput(valid, 'create')).toEqual({ ok: true, data: valid });
  });

  it('accepts every new field', () => {
    const r = parseProjectInput(
      {
        ...valid,
        slug: 'cak-mad-editor',
        category: 'tool',
        status: 'open-source',
        year: '2026',
        role: 'Solo developer',
        highlights: [' Ekspor PDF ', ''],
        releaseUrl: 'https://example.com/releases',
        featured: true
      },
      'create'
    );
    expect(r).toEqual({
      ok: true,
      data: {
        ...valid,
        slug: 'cak-mad-editor',
        category: 'tool',
        status: 'open-source',
        year: '2026',
        role: 'Solo developer',
        highlights: ['Ekspor PDF'],
        releaseUrl: 'https://example.com/releases',
        featured: true
      }
    });
  });

  it('rejects values outside the allowed sets', () => {
    expect(parseProjectInput({ ...valid, category: 'mobile' }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, status: 'archived' }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, highlights: 'a' }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, highlights: [1] }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, featured: 'true' }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, liveUrl: 5 }, 'create').ok).toBe(false);
    expect(parseProjectInput({ ...valid, slug: '!!!' }, 'create').ok).toBe(false);
  });

  it('turns empty nullable text into null', () => {
    const r = parseProjectInput({ ...valid, liveUrl: '', githubUrl: '  ', role: null }, 'create');
    expect(r).toEqual({ ok: true, data: { ...valid, liveUrl: null, githubUrl: null, role: null } });
  });

  it('normalises a given slug and drops an empty one', () => {
    expect(parseProjectInput({ ...valid, slug: 'My Slug' }, 'create')).toEqual({
      ok: true,
      data: { ...valid, slug: 'my-slug' }
    });
    expect(parseProjectInput({ ...valid, slug: '' }, 'create')).toEqual({ ok: true, data: valid });
  });

  it('keeps the lenient handling of tags, order and visible', () => {
    expect(parseProjectInput({ ...valid, tags: 'x', order: '1', visible: 'no' }, 'create')).toEqual({
      ok: true,
      data: valid
    });
    expect(parseProjectInput({ ...valid, tags: ['Swift'], order: 3, visible: false }, 'create')).toEqual({
      ok: true,
      data: { ...valid, tags: ['Swift'], order: 3, visible: false }
    });
  });
});

describe('parseProjectInput (update)', () => {
  it('allows an empty body and partial updates', () => {
    expect(parseProjectInput({}, 'update')).toEqual({ ok: true, data: {} });
    expect(parseProjectInput({ featured: false }, 'update')).toEqual({ ok: true, data: { featured: false } });
  });

  it('stores empty url strings as null', () => {
    expect(parseProjectInput({ liveUrl: '', imageUrl: '' }, 'update')).toEqual({
      ok: true,
      data: { liveUrl: null, imageUrl: null }
    });
  });

  it('clears the slug with an empty value', () => {
    expect(parseProjectInput({ slug: '' }, 'update')).toEqual({ ok: true, data: { slug: null } });
    expect(parseProjectInput({ slug: null }, 'update')).toEqual({ ok: true, data: { slug: null } });
  });

  it('rejects blank title', () => {
    expect(parseProjectInput({ title: ' ' }, 'update').ok).toBe(false);
  });
});
