// __tests__/getThreads.test.ts

import { GET } from '@/app/api/threads/route';
import prisma from '@/lib/prisma';

// Prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  thread: {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(), // POST 内では直接使用しないが、念のため
  },
  post: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

// cryptoRandomString もモック化
jest.mock('crypto-random-string', () => jest.fn());

describe('GET /threads エンドポイント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常にスレッド一覧とページネーション情報が返る場合', async () => {
    // クエリパラメータとして page=2, limit=5 を指定（skip = (2-1)*5 = 5, take = 5）
    const page = '2';
    const limit = '5';

    // 総スレッド数 (論理削除されていないもの) を返す
    (prisma.thread.count as jest.Mock).mockResolvedValue(12);

    // スレッド一覧（findMany）のモック結果を用意
    const threadsFromDb = [
      {
        id: 1,
        title: 'Thread 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        posts: [{ id: 101, content: 'First post', deletedAt: null }],
        _count: { posts: 3 },
      },
      {
        id: 2,
        title: 'Thread 2',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        posts: [],
        _count: { posts: 0 },
      },
    ];
    (prisma.thread.findMany as jest.Mock).mockResolvedValue(threadsFromDb);

    // リクエスト作成
    const request = new Request(`http://localhost/api/threads?page=${page}&limit=${limit}`, {
      method: 'GET',
    });

    // エンドポイント実行
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const json = await response.json();

    // 返却されるレスポンスの期待値
    expect(json).toEqual({
      threads: [
        {
          id: 1,
          title: 'Thread 1',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          posts: [{ id: 101, content: 'First post', deletedAt: null, postNumber: 3 }],
        },
        {
          id: 2,
          title: 'Thread 2',
          createdAt: '2023-01-02T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          posts: [],
        },
      ],
      pagination: {
        currentPage: 2,
        totalPages: Math.ceil(12 / Number(limit)), // Math.ceil(12/5) = 3
        totalItems: 12,
        itemsPerPage: 5,
      },
    });
  });

  it('Prisma の処理でエラーが発生した場合、500 エラーを返す', async () => {
    // prisma.thread.count でエラーを発生させる
    (prisma.thread.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/threads?page=1&limit=10', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Failed to fetch threads');
  });
});
