// __tests__/search.test.ts
import { GET } from '@/app/api/search/route';
import prisma from '@/lib/prisma';
import { Thread } from '@/types/api';

// Prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  post: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  thread: {
    findMany: jest.fn(),
  },
}));

describe('GET エンドポイント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常にスレッドと投稿が返る場合、フィルタされた posts を返す', async () => {
    const query = 'test';

    // (1) prisma.post.findMany: 投稿内容に query を含む投稿（最新順＝降順）を返す
    const matchedPosts = [
      { id: 3, content: 'test something', threadId: 2, deletedAt: null },
      { id: 2, content: 'another test post', threadId: 1, deletedAt: null },
      { id: 1, content: 'test post', threadId: 1, deletedAt: null },
    ];

    // (3) prisma.thread.findMany: タイトル or 投稿ヒットしたスレッドを返す（初期状態の posts を含む）
    const threadsFromDb = [
      {
        id: 1,
        title: 'test thread',
        posts: [{ id: 10, content: 'dummy', deletedAt: null }],
        deletedAt: null,
      },
      {
        id: 2,
        title: 'another thread',
        posts: [{ id: 20, content: 'dummy', deletedAt: null }],
        deletedAt: null,
      },
      {
        id: 3,
        title: 'title that contains test',
        posts: [{ id: 30, content: 'dummy', deletedAt: null }],
        deletedAt: null,
      },
    ];

    (prisma.post.findMany as jest.Mock).mockResolvedValue(matchedPosts);
    (prisma.thread.findMany as jest.Mock).mockResolvedValue(threadsFromDb);

    const request = new Request(`http://localhost/api/search?query=${query}`, {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const json = await response.json();

    // マッチした投稿の threadId は 1,2 となるので、id:1,2 のスレッドは posts を差し替え
    const thread1 = json.find((thread: Thread) => thread.id === 1);
    expect(thread1).toBeDefined();
    expect(thread1.posts).toEqual([
      // matchedPosts 内で threadId === 1 の投稿は [ { id:2, ... }, { id:1, ... } ]
      // これを reverse すると昇順になり [ { id:1, ... }, { id:2, ... } ]
      { id: 1, content: 'test post', threadId: 1, deletedAt: null },
      { id: 2, content: 'another test post', threadId: 1, deletedAt: null },
    ]);

    const thread2 = json.find((thread: Thread) => thread.id === 2);
    expect(thread2).toBeDefined();
    expect(thread2.posts).toEqual([
      { id: 3, content: 'test something', threadId: 2, deletedAt: null },
    ]);

    // thread3 は matchedPosts に含まれていないので、初期状態の posts がそのまま返る
    const thread3 = json.find((thread: Thread) => thread.id === 3);
    expect(thread3).toBeDefined();
    expect(thread3.posts).toEqual([{ id: 30, content: 'dummy', deletedAt: null }]);
  });

  it('Prisma の処理でエラーが発生した場合、500 を返す', async () => {
    (prisma.post.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/search?query=test', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Failed to search threads');
  });
});
