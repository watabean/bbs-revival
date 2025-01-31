import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { threadId: string } }) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.threadId },
    include: { posts: true },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  return NextResponse.json(thread);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.thread.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }
}
