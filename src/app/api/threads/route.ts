import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ThreadListResponse } from '@/types/api';

export async function getThreads(page: number = 1) {
  const ITEMS_PER_PAGE = 10;
  
  const totalCount = await prisma.thread.count();
  const threads = await prisma.thread.findMany({
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    orderBy: { createdAt: 'desc' },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return {
    threads: threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      posts: thread.posts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
      })),
      postsCount: thread.posts.length,
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      totalItems: totalCount,
      itemsPerPage: ITEMS_PER_PAGE,
    },
  };
}

export async function GET(request: Request) {
  // クエリパラメータ取得
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page') ?? '1';
  const limitParam = searchParams.get('limit') ?? '10';

  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const response: ThreadListResponse = {
      threads: threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        posts: thread.posts.map((post) => ({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
        })),
        postsCount: thread.posts.length,
      })),
    pagination: {
      currentPage: Number(pageParam),
      totalPages: 1,
      totalItems: threads.length,
      itemsPerPage: Number(limitParam),
    },
  };

  console.log(response);

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
