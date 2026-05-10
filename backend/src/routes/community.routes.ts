import { Router } from 'express';
import { prisma } from '../lib/prisma';
const router = Router();


function getUserId(req: any): string | null {
  try {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    return decoded.userId;
  } catch { return null; }
}

// GET / - Get all community posts
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { type } = req.query;
    const where: any = {};
    if (type && type !== 'all') where.type = String(type);

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: posts });
  } catch (error) { next(error); }
});

// POST / - Create a community post
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { type, title, body, mediaUrl } = req.body;
    const post = await prisma.communityPost.create({
      data: { userId, type: type || 'text', title, body, mediaUrl },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) { next(error); }
});

// GET /:id - Get a single post with all comments
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
});

// POST /:id/comments - Add a comment
router.post('/:id/comments', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { body } = req.body;
    const comment = await prisma.communityComment.create({
      data: { postId: req.params.id, userId, body },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) { next(error); }
});

// PATCH /:id/like - Toggle like on a post
router.patch('/:id/like', async (req: any, res: any, next: any) => {
  try {
    const post = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } }
    });
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
});

// DELETE /:id - Delete a post
router.delete('/:id', async (req: any, res: any, next: any) => {
  try {
    await prisma.communityPost.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) { next(error); }
});

export default router;
