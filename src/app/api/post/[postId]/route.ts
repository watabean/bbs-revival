import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ postId: string }>;
};

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { postId } = await params;
    const { password } = await request.json();

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.updatePassword !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 投稿削除
    await prisma.post.update({
      where: { id: Number(postId) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { postId } = await params;
    const { content, password } = await request.json();

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.updatePassword !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 投稿更新
    const updatedPost = await prisma.post.update({
      where: { id: Number(postId) },
      data: { content },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
