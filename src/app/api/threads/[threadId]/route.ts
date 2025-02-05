import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { PostListResponse } from '@/types/api';

type Props = {
  params: Promise<{ threadId: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { threadId } = await params;
  if (!Number(threadId)) {
    return new Response(JSON.stringify({ error: 'Missing threadId' }), { status: 400 });
  }

  // クエリパラメータ取得
  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const limitParam = Number(searchParams.get('limit') ?? '100');

  const skip = (pageParam - 1) * limitParam;
  const take = limitParam;

  // 総投稿数（論理削除を除外）
  const totalItems = await prisma.post.count({
    where: { deletedAt: null, threadId: Number(threadId) },
  });

  const thread = await prisma.thread.findUnique({
    where: { id: Number(threadId), deletedAt: null },
    include: {
      posts: {
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const postsWithIndex = thread.posts.map((post, index) => ({
    ...post,
    postNumber: skip + index + 1, // 何番目の投稿か
  }));

  const response: PostListResponse = {
    thread: {
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      posts: postsWithIndex.map((post) => ({
        id: post.id,
        author: post.author,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        postNumber: post.postNumber,
      })),
    },
    pagination: {
      currentPage: pageParam,
      totalPages: Math.ceil(totalItems / limitParam),
      totalItems,
      itemsPerPage: limitParam,
    },
  };

  return NextResponse.json(response);
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { threadId } = await params;
    const { password } = await request.json();

    if (!Number(threadId)) {
      return new Response(JSON.stringify({ error: 'Missing threadId' }), { status: 400 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: Number(threadId) },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.updatePassword !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    await prisma.thread.update({
      where: { id: Number(threadId) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }
}
