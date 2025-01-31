import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const threads = await prisma.thread.findMany({
    include: {
      posts: true
    }
  });
  return NextResponse.json(threads);
}

export async function POST(request: Request) {
  const { title } = await request.json();
  
  if (!title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }

  const newThread = await prisma.thread.create({
    data: {
      title
    }
  });
  
  return NextResponse.json(newThread, { status: 201 });
}
