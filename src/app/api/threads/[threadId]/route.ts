import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ threadId: string }>;
};

export async function GET(_request: NextRequest, { params }: Props) {
  const { threadId } = await params;
  if (!Number(threadId)) {
    return new Response(JSON.stringify({ error: 'Missing threadId' }), { status: 400 });
  }

  const thread = await prisma.thread.findUnique({
    where: { id: Number(threadId), deletedAt: null },
    include: {
      posts: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  return NextResponse.json(thread);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { threadId } = await params;

  if (!Number(threadId)) {
    return new Response(JSON.stringify({ error: 'Missing threadId' }), { status: 400 });
  }

  try {
    await prisma.thread.update({
      where: { id: Number(threadId) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }
}
