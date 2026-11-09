import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateAdminOrReadToken, authenticateAdminOrWriteToken, AuthenticatedRequest } from '../middleware/auth';
import { parseProjectInput, slugify, uniqueSlug } from '../lib/project';

const router = Router();

const SLUG_TAKEN = 'Slug sudah dipakai proyek lain.';

const isSlugConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

async function generateSlug(title: string): Promise<string | null> {
  const base = slugify(title);
  if (!base) return null;
  const taken = await prisma.project.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  });
  return uniqueSlug(base, taken.map((p) => p.slug as string));
}

// GET /api/projects - Public route to fetch all visible projects
router.get('/', async (_req, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { visible: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }]
    });
    return res.json(projects);
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/admin/projects - Admin route to fetch all projects
router.get('/admin-list', authenticateAdminOrReadToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' }
    });
    return res.json(projects);
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// POST /api/admin/projects - Create a new project
router.post('/', authenticateAdminOrWriteToken, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = parseProjectInput(req.body, 'create');
  if (!parsed.ok) return res.status(400).json({ message: parsed.message });

  const { title, description, ...rest } = parsed.data as typeof parsed.data & { title: string; description: string };

  try {
    const project = await prisma.project.create({
      data: {
        ...rest,
        title,
        description,
        slug: rest.slug ?? (await generateSlug(title))
      }
    });
    return res.status(201).json(project);
  } catch (error) {
    if (isSlugConflict(error)) return res.status(409).json({ message: SLUG_TAKEN });
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// PUT /api/projects/reorder - Reorder projects (bulk update)
router.put('/reorder', authenticateAdminOrWriteToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'orderedIds harus berupa array dari ID proyek.' });
  }

  try {
    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.project.update({
          where: { id: Number(id) },
          data: { order: index + 1 }
        })
      )
    );
    return res.json({ message: 'Urutan proyek berhasil diperbarui.' });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/projects/:slug - Public detail of one visible project
router.get('/:slug', async (req, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, visible: true }
    });
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    return res.json(project);
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// PUT /api/admin/projects/:id - Update an existing project
router.put('/:id', authenticateAdminOrWriteToken, async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) {
    return res.status(400).json({ message: 'ID proyek tidak valid.' });
  }

  const parsed = parseProjectInput(req.body, 'update');
  if (!parsed.ok) return res.status(400).json({ message: parsed.message });

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: parsed.data
    });

    return res.json(updatedProject);
  } catch (error) {
    if (isSlugConflict(error)) return res.status(409).json({ message: SLUG_TAKEN });
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// DELETE /api/admin/projects/:id - Delete a project
router.delete('/:id', authenticateAdminOrWriteToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const projectId = parseInt(id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID proyek tidak valid.' });
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    return res.json({ message: 'Proyek berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
