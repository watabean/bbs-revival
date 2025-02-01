import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { threadId: string; postId: string } },
) {
  try {
    const { threadId, postId } = params;

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId, threadId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 投稿削除
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { threadId: string; postId: string } },
) {
  try {
    const { threadId, postId } = params;
    const { content } = await request.json();

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId, threadId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 投稿更新
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
