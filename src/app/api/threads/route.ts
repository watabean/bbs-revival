import cryptoRandomString from 'crypto-random-string';
import { NextResponse } from 'next/server';

import {
  MAX_LENGTH_AUTHOR,
  MAX_LENGTH_CONTENT,
  MAX_LENGTH_THREAD_TITLE,
} from '@/constants/constants';
import prisma from '@/lib/prisma';
import { Post, ThreadListResponse } from '@/types/api';

export async function GET(request: Request) {
  try {
    // クエリパラメータ取得
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get('page') ?? '1');
    const limitParam = Number(searchParams.get('limit') ?? '10');

    // ページネーション用のオフセット計算
    const skip = (pageParam - 1) * limitParam;
    const take = limitParam;

    // 総スレッド数（論理削除を除外）
    const totalItems = await prisma.thread.count({
      where: { deletedAt: null },
    });

    // スレッド一覧取得（論理削除を考慮 & ページネーション適用）
    const threads = await prisma.thread.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' },
      skip,
      take,
      include: {
        posts: {
          where: { deletedAt: null },
          orderBy: { id: 'desc' },
          take: 1, // 最新の1件のみ取得
        },
        _count: {
          select: { posts: true }, // スレッド内の投稿総数を取得
        },
      },
    });

    const response: ThreadListResponse = {
      threads: threads.map((thread) => {
        const post: Post = thread.posts[0];
        return {
          id: thread.id,
          title: thread.title,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          posts: thread.posts[0]
            ? [
                {
                  id: post.id,
                  author: post.author,
                  content: post.content,
                  createdAt: post.createdAt,
                  updatedAt: post.updatedAt,
                  postNumber: thread._count.posts,
                },
              ]
            : [],
        };
      }),
      pagination: {
        currentPage: pageParam,
        totalPages: Math.ceil(totalItems / limitParam),
        totalItems,
        itemsPerPage: limitParam,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, author } = await request.json();
    const updatePassword = cryptoRandomString({ length: 12, type: 'alphanumeric' });

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (title.length > MAX_LENGTH_THREAD_TITLE) {
      return NextResponse.json({ error: 'Title is too long' }, { status: 400 });
    }
    if (author.length > MAX_LENGTH_AUTHOR) {
      return NextResponse.json({ error: 'Author name is too long' }, { status: 400 });
    }
    if (content.length > MAX_LENGTH_CONTENT) {
      return NextResponse.json({ error: 'Content is too long' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // スレッドを作成
      const newThread = await tx.thread.create({
        data: {
          title,
          updatePassword,
        },
      });

      // 初回投稿を作成
      const firstPost = await tx.post.create({
        data: {
          threadId: newThread.id,
          content,
          author,
          updatePassword,
        },
      });

      return { newThread, firstPost, updatePassword };
    });

    return NextResponse.json(
      {
        thread: result.newThread,
        updatePassword: result.updatePassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}
