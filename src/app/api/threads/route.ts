import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ThreadListResponse } from '@/types/api';

export async function GET(request: Request) {
  // クエリパラメータ取得
  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const limitParam = Number(searchParams.get('limit') ?? '10');

  // ページネーション用のオフセット計算
  const skip = (pageParam - 1) * limitParam;
  const take = limitParam;

  // 総スレッド数（論理削除を除外）
  const totalItems = await prisma.thread.count({
    where: { deletedAt: null },
  });

  // スレッド一覧取得（論理削除を考慮 & ページネーション適用）
  const threads = await prisma.thread.findMany({
    where: { deletedAt: null },
    orderBy: { id: 'desc' },
    skip,
    take,
    include: {
      posts: {
        where: { deletedAt: null },
        orderBy: { id: 'desc' },
        take: 1, // 最新の1件のみ取得
      },
    },
  });

  const response: ThreadListResponse = {
    threads: threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      posts: thread.posts[0] ? [{ ...thread.posts[0] }] : [],
    })),
    pagination: {
      currentPage: pageParam,
      totalPages: Math.ceil(totalItems / limitParam),
      totalItems,
      itemsPerPage: limitParam,
    },
  };

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: Request) {
  const { title } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newThread = await prisma.thread.create({
    data: {
      title,
    },
  });

  return NextResponse.json(newThread, { status: 201 });
}
