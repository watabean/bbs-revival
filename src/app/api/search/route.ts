import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

const MAX_POST_COUNT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Step 1: query を含むポストを全件取得
    const posts = await prisma.post.findMany({
      where: {
        content: { contains: query || '' },
        deletedAt: null,
      },
      orderBy: { id: 'asc' },
    });

    // Step 2: 取得したポストの threadId をリスト化
    const threadIds = [...new Set(posts.map((post) => post.threadId))]; // 重複を削除

    // Step 3: threadId に一致するスレッドを取得
    const threads = await prisma.thread.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: query || '' } }, // queryをタイトルに含むスレッド
          { id: { in: threadIds } }, // queryを含むポストが存在するスレッド
        ],
      },
      orderBy: { id: 'desc' },
      include: {
        posts: {
          where: { deletedAt: null },
          orderBy: { id: 'desc' },
          take: 1, // 最新の1件のみ取得
        },
      },
    });

    // Step 4: スレッドごとに関連するポストを紐づける
    const response = threads.map((thread) => ({
      ...thread,
      filteredPosts: posts.slice(0, MAX_POST_COUNT).filter((post) => post.threadId === thread.id),
    }));

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to search threads' }, { status: 500 });
  }
}
