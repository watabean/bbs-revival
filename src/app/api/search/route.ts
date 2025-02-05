import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { Thread } from '@/types/api';

const MAX_POST_COUNT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // (1) 投稿内容に query を含む投稿を取得
    const matchedPosts = await prisma.post.findMany({
      where: {
        content: { contains: query ?? '' },
        deletedAt: null,
      },
      orderBy: { id: 'desc' }, // 最新順に並べて取得
    });

    // (2) ヒットした投稿のスレッドIDをリスト化
    const matchedThreadIds = new Set(matchedPosts.map((post) => post.threadId));

    // (3) タイトルがヒット or 投稿がヒットしたスレッドを取得
    const threads = await prisma.thread.findMany({
      where: {
        deletedAt: null,
        OR: [{ title: { contains: query ?? '' } }, { id: { in: [...matchedThreadIds] } }],
      },
      orderBy: { id: 'desc' },
      // ひとまず最新1件だけを `thread.posts` で持っておく
      include: {
        posts: {
          where: { deletedAt: null },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });

    // (4) 「投稿マッチでヒットしているスレッド」は、posts を差し替え
    const response: Thread[] = threads.map((thread) => {
      if (matchedThreadIds.has(thread.id)) {
        thread.posts = matchedPosts
          .filter((post) => post.threadId === thread.id)
          // 最新順に最大件数でフィルタ
          .slice(0, MAX_POST_COUNT)
          // 昇順に並べ替える
          .reverse();
      }
      return {
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        posts: thread.posts.map((post) => ({
          id: post.id,
          author: post.author,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
      };
    });
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
