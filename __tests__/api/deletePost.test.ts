// __tests__/deletePost.test.ts
import { DELETE } from '@/app/api/post/[postId]/route'; // エンドポイントのパスに合わせて調整
import prisma from '@/lib/prisma';

// Prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  post: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('DELETE エンドポイント', () => {
  // 各テストの前にモックのクリアを行う
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('存在しない投稿の場合、404 を返す', async () => {
    // prisma.post.findUnique が null を返すように設定
    (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'secret' }),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Post not found');
  });

  it('パスワードが不一致の場合、401 を返す', async () => {
    // 存在する投稿を返すがパスワードが合わないシナリオ
    (prisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: '正しいパスワード',
    });

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: '間違ったパスワード' }),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBe('Invalid password');
  });

  it('正常に投稿削除できた場合、成功メッセージを返す', async () => {
    // 存在する投稿と正しいパスワードの場合
    (prisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: 'secret',
    });
    // update 処理が成功したと仮定
    (prisma.post.update as jest.Mock).mockResolvedValue({
      id: 1,
      deletedAt: new Date(),
    });

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'secret' }),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.message).toBe('Post deleted successfully');
  });

  it('Prisma の更新処理でエラーが発生した場合、500 を返す', async () => {
    (prisma.post.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: 'secret',
    });
    (prisma.post.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const params = Promise.resolve({ postId: '1' });
    const request = new Request('http://localhost/api/posts/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'secret' }),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Failed to delete post');
  });
});
