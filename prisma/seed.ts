import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= 100; i++) {
    const thread = await prisma.thread.create({
      data: {
        title: `スレッド${i}`,
        posts: {
          create: Array.from({ length: 250 }, (_, j) => ({
            content: `スレッド${i}の投稿${j + 1}`,
            author: `ユーザー${j + 1}`,
          })),
        },
      },
    });
    console.log(`Created thread with id: ${thread.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
