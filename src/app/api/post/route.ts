import cryptoRandomString from 'crypto-random-string';
import { NextResponse } from 'next/server';

import { MAX_LENGTH_AUTHOR, MAX_LENGTH_CONTENT, MAX_POSTS_PER_THREAD } from '@/constants/constants';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { content, author, threadId } = await request.json();
    const updatePassword = cryptoRandomString({ length: 12, type: 'alphanumeric' });

    // バリデーション
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (!Number(threadId)) {
      return NextResponse.json({ error: 'ThreadId is required' }, { status: 400 });
    }
    if (content.length > MAX_LENGTH_CONTENT) {
      return NextResponse.json({ error: 'Content is too long' }, { status: 400 });
    }
    if (author?.length > MAX_LENGTH_AUTHOR) {
      return NextResponse.json({ error: 'name is too long' }, { status: 400 });
    }

    // スレッドを検索
    const thread = await prisma.thread.findUnique({
      where: {
        id: Number(threadId),
        deletedAt: null,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread?._count.posts >= MAX_POSTS_PER_THREAD) {
      return NextResponse.json({ error: 'Thread has reached the post limit' }, { status: 403 });
    }

    const newPost = await prisma.post.create({
      data: { content, author, threadId: Number(threadId), updatePassword },
    });

    return NextResponse.json({ newPost: newPost, updatePassword: updatePassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
