import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { content, author, threadId } = await request.json();

  // バリデーション
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  if (!Number(threadId)) {
    return NextResponse.json({ error: 'ThreadId is required' }, { status: 400 });
  }

  // スレッドを検索
  const thread = await prisma.thread.findUnique({
    where: {
      id: Number(threadId),
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const newPost = await prisma.post.create({
    data: { content, author, threadId: Number(threadId) },
  });

  return NextResponse.json(newPost, { status: 201 });
}
