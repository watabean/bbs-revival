// __tests__/getThreadDetail.test.ts
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/threads/[threadId]/route';
import prisma from '@/lib/prisma';

// prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  post: {
    count: jest.fn(),
  },
  thread: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('GET /threads/:threadId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('不正な threadId の場合、400 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: 'abc' }); // 数値に変換できない
    const request = new NextRequest('http://localhost/api/threads/abc?page=1&limit=10', {
      method: 'GET',
    });

    const response = await GET(request, { params });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Missing threadId');
  });

  it('対象スレッドが存在しない場合、404 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    const request = new NextRequest('http://localhost/api/threads/1?page=1&limit=10', {
      method: 'GET',
    });

    // 総投稿数は 0 とする（必ずしも重要ではない）
    (prisma.post.count as jest.Mock).mockResolvedValue(0);
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(request, { params });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Thread not found');
  });

  it('正常にスレッドと投稿一覧、ページネーション情報を返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    // クエリパラメータで page=2, limit=10 とする → skip = 10
    const request = new NextRequest('http://localhost/api/threads/1?page=2&limit=10', {
      method: 'GET',
    });

    // 総投稿数を 50 とする
    (prisma.post.count as jest.Mock).mockResolvedValue(50);

    // DB から返却されるスレッド情報（posts は page=2 用に 2 件返ると仮定）
    const threadFromDb = {
      id: 1,
      title: 'Test Thread',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      posts: [
        { id: 11, content: 'Post 11' },
        { id: 12, content: 'Post 12' },
      ],
    };
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(threadFromDb);

    const response = await GET(request, { params });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const json = await response.json();
    // skip = (2 - 1) * 10 = 10 → postNumber はそれぞれ 11, 12
    expect(json).toEqual({
      thread: {
        ...threadFromDb,
        posts: [
          { ...threadFromDb.posts[0], postNumber: 11 },
          { ...threadFromDb.posts[1], postNumber: 12 },
        ],
      },
      pagination: {
        currentPage: 2,
        totalPages: 5, // Math.ceil(50 / 10)
        totalItems: 50,
        itemsPerPage: 10,
      },
    });
  });
});
