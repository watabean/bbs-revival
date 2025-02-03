import request from 'supertest';

import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  thread: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  post: {
    count: jest.fn(),
  },
}));

const baseUrl: string = 'http://localhost:3000';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('API /threads/[threadId]', () => {
  const mockThread = {
    id: 1,
    title: 'Test Thread',
    deletedAt: null,
    updatePassword: 'correct-password',
    posts: [{ id: 1, content: 'Test Post', deletedAt: null, threadId: 1 }],
  };

  test('GET /api/threads/1 should return thread with posts', async () => {
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(mockThread);
    (prisma.post.count as jest.Mock).mockResolvedValue(1);

    const res = await request(baseUrl).get('/api/threads/1');

    expect(res.status).toBe(200);
    expect(res.body.thread.id).toBe(1);
    expect(res.body.thread.posts.length).toBe(1);
  });

  test('GET /api/threads/999 should return 404 if thread not found', async () => {
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(baseUrl).get('/api/threads/999');

    expect(res.status).toBe(404);
  });

  test('DELETE /api/threads/1 should delete thread when correct password is provided', async () => {
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(mockThread);
    (prisma.thread.update as jest.Mock).mockResolvedValue({
      ...mockThread,
      deletedAt: new Date(),
    });

    const res = await request(baseUrl)
      .delete('/api/threads/1')
      .send({ password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/threads/1 should return 403 if incorrect password is provided', async () => {
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(mockThread);

    const res = await request(baseUrl)
      .delete('/api/threads/1')
      .send({ password: 'wrong-password' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid password');
  });

  test('DELETE /api/threads/999 should return 404 if thread does not exist', async () => {
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(baseUrl)
      .delete('/api/threads/999')
      .send({ password: 'correct-password' });

    expect(res.status).toBe(404);
  });
});
