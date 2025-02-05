// __tests__/patchPost.test.ts
// __tests__/deletePost.test.ts
import { PATCH } from '@/app/api/post/[postId]/route';
import prisma from '@/lib/prisma';

// Prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  post: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('PATCH エンドポイント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('存在しない投稿の場合、404 を返す', async () => {
    (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({ password: 'secret', content: '新しいコンテンツ' }),
    });

    const response = await PATCH(request, { params });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Post not found');
  });

  it('パスワードが不一致の場合、401 を返す', async () => {
    (prisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: '正しいパスワード',
    });

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({ password: '間違ったパスワード', content: '新しいコンテンツ' }),
    });

    const response = await PATCH(request, { params });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBe('Invalid password');
  });

  it('正常に投稿更新できた場合、更新後の投稿データを返す', async () => {
    const originalPost = { id: 1, updatePassword: 'secret', content: '古いコンテンツ' };
    (prisma.post.findUnique as jest.Mock).mockResolvedValue(originalPost);

    const updatedPost = { ...originalPost, content: '更新されたコンテンツ' };
    (prisma.post.update as jest.Mock).mockResolvedValue(updatedPost);

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({ password: 'secret', content: '更新されたコンテンツ' }),
    });

    const response = await PATCH(request, { params });
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.content).toBe('更新されたコンテンツ');
  });

  it('Prisma の更新処理でエラーが発生した場合、500 を返す', async () => {
    const originalPost = { id: 1, updatePassword: 'secret', content: '古いコンテンツ' };
    (prisma.post.findUnique as jest.Mock).mockResolvedValue(originalPost);
    (prisma.post.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({ password: 'secret', content: '更新されたコンテンツ' }),
    });

    const response = await PATCH(request, { params });
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Failed to update post');
  });
});
