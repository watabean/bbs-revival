// __tests__/deleteThread.test.ts
import { NextRequest } from 'next/server';

import { DELETE } from '@/app/api/threads/[threadId]/route';
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

describe('DELETE /threads/:threadId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('不正な threadId の場合、400 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: 'abc' });
    const request = new NextRequest('http://localhost/api/threads/abc', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'dummy' }),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Missing threadId');
  });

  it('対象スレッドが存在しない場合、404 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    const request = new NextRequest('http://localhost/api/threads/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'dummy' }),
    });

    (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await DELETE(request, { params });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Thread not found');
  });

  it('パスワードが一致しない場合、403 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    const request = new NextRequest('http://localhost/api/threads/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'wrongpassword' }),
    });

    // DB から取得した thread の updatePassword が異なる値の場合
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: 'correctpassword',
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBe('Invalid password');
  });

  it('正しいパスワードの場合、スレッドを削除して成功レスポンスを返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    const request = new NextRequest('http://localhost/api/threads/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'correctpassword' }),
    });

    // DB から取得した thread の updatePassword と一致するケース
    (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      updatePassword: 'correctpassword',
    });

    (prisma.thread.update as jest.Mock).mockResolvedValue({
      id: 1,
      deletedAt: new Date(),
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual({ success: true });
  });

  it('内部エラーが発生した場合、catch ブロックで 404 エラーを返す', async () => {
    const params = Promise.resolve({ threadId: '1' });
    const request = new NextRequest('http://localhost/api/threads/1', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'any' }),
    });

    // prisma.thread.findUnique でエラー発生
    (prisma.thread.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const response = await DELETE(request, { params });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('Thread not found');
  });
});
