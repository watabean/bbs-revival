// __tests__/createPost.test.ts
import cryptoRandomString from 'crypto-random-string';

import { POST } from '@/app/api/post/route';
import { MAX_POSTS_PER_THREAD } from '@/constants/constants';
import prisma from '@/lib/prisma';

// Prisma のメソッドをモック化
jest.mock('@/lib/prisma', () => ({
  thread: {
    findUnique: jest.fn(),
  },
  post: {
    create: jest.fn(),
  },
}));

// crypto-random-string もモック化（テスト内で決まった文字列を返すようにする）
jest.mock('crypto-random-string', () => jest.fn());

describe('POST エンドポイント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('content が存在しない場合、400 エラーを返す', async () => {
    const requestBody = {
      author: 'Alice',
      threadId: '1',
      // content がない
    };

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Content is required');
  });

  it('threadId が存在しない場合、400 エラーを返す', async () => {
    const requestBody = {
      content: 'Hello',
      author: 'Alice',
      // threadId がない
    };

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('ThreadId is required');
  });

  it('指定された threadId のスレッドが存在しない場合、404 エラーを返す', async () => {
    const requestBody = {
      content: 'Hello',
      author: 'Alice',
      threadId: '1',
    };

    // スレッドが見つからないケース
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Thread not found');
  });

  it('スレッドの投稿数が上限に達している場合、403 エラーを返す', async () => {
    const requestBody = {
      content: 'Hello',
      author: 'Alice',
      threadId: '1',
    };

    // thread が見つかるが、投稿数が上限に達しているケース
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      _count: { posts: MAX_POSTS_PER_THREAD },
    });

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBe('Thread has reached the post limit');
  });

  it('正常に投稿が作成された場合、201 ステータスと作成された投稿データ、updatePassword を返す', async () => {
    const requestBody = {
      content: 'Hello',
      author: 'Alice',
      threadId: '1',
    };

    // 有効なスレッドが見つかり、投稿数は上限未満
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      _count: { posts: 0 },
    });

    // 固定のパスワードを返すようにモック（例: 'fixedpassword'）
    const fakeUpdatePassword = 'fixedpassword';
    (cryptoRandomString as jest.Mock).mockReturnValue(fakeUpdatePassword);

    // 投稿作成処理のモック
    const createdPost = {
      id: 123,
      content: 'Hello',
      author: 'Alice',
      threadId: 1,
      updatePassword: fakeUpdatePassword,
    };
    (prisma.post.create as jest.Mock).mockResolvedValue(createdPost);

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.newPost).toEqual(createdPost);
    expect(json.updatePassword).toBe(fakeUpdatePassword);

    // prisma.post.create が正しいデータで呼ばれていることを検証
    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        content: requestBody.content,
        author: requestBody.author,
        threadId: Number(requestBody.threadId),
        updatePassword: fakeUpdatePassword,
      },
    });
  });

  it('投稿作成処理でエラーが発生した場合、500 エラーを返す', async () => {
    const requestBody = {
      content: 'Hello',
      author: 'Alice',
      threadId: '1',
    };

    // 有効なスレッドが見つかり、投稿数は上限未満
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      _count: { posts: 0 },
    });

    // 固定のパスワードを返す
    const fakeUpdatePassword = 'fixedpassword';
    (cryptoRandomString as jest.Mock).mockReturnValue(fakeUpdatePassword);

    // prisma.post.create でエラーが発生するケース
    (prisma.post.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Failed to create post');
  });
});
