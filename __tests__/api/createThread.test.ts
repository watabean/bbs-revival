// __tests__/createThread.test.ts
import cryptoRandomString from 'crypto-random-string';

import { POST } from '@/app/api/threads/route';
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

describe('POST /threads エンドポイント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが存在しない場合、400 エラーを返す', async () => {
    const requestBody = {
      content: 'Initial post content',
      author: 'Alice',
    };

    const request = new Request('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Title is required');
  });

  it('コンテンツが存在しない場合、400 エラーを返す', async () => {
    const requestBody = {
      title: 'Test Thread',
      author: 'Alice',
    };

    const request = new Request('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Content is required');
  });

  it('正常にスレッドと初回投稿が作成できた場合、201 を返す', async () => {
    const requestBody = {
      title: 'Test Thread',
      content: 'Initial post content',
      author: 'Alice',
    };

    // 固定の updatePassword を返すようにモック
    const fixedPassword = 'fixedpassword';
    (cryptoRandomString as jest.Mock).mockReturnValue(fixedPassword);

    // 新規作成されるスレッドと初回投稿のモック結果を用意
    const newThread = {
      id: 1,
      title: 'Test Thread',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      updatePassword: fixedPassword,
    };
    const firstPost = {
      id: 101,
      threadId: 1,
      content: 'Initial post content',
      author: 'Alice',
      updatePassword: fixedPassword,
    };

    // prisma.$transaction をモック化して、トランザクション内の処理結果を返す
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      return await fn({
        thread: {
          create: jest.fn().mockResolvedValue(newThread),
        },
        post: {
          create: jest.fn().mockResolvedValue(firstPost),
        },
      });
    });

    const request = new Request('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json).toEqual({
      thread: newThread,
      updatePassword: fixedPassword,
    });

    // prisma.$transaction が呼ばれていることを確認
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('トランザクション内でエラーが発生した場合、500 エラーを返す', async () => {
    const requestBody = {
      title: 'Test Thread',
      content: 'Initial post content',
      author: 'Alice',
    };

    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to create thread');
  });
});
