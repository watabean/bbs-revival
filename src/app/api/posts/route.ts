import prisma from '@/lib/prisma';
import { Post, Thread } from '@prisma/client/wasm';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const { content, author } = await request.json();

  // バリデーション
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // スレッドを検索
  const thread = await prisma.thread.findUnique({
    where: {
      id: params.threadId,
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  // 新しい投稿を作成
  const newPost: Post = {
    id: Date.now().toString(),
    content,
    author: author ?? '名無しさん',
    createdAt: new Date(),
    threadId: params.threadId,
  };

  await prisma.post.create({ data: newPost });

  return NextResponse.json(newPost, { status: 201 });
}
