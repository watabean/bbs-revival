import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const threadTitles = [
  '今日の天気について',
  'おすすめのプログラミング言語',
  '最近見た映画の感想',
  '好きなゲームについて語ろう',
  '旅行の思い出',
  '最新のガジェット情報',
  '趣味を共有しよう',
  'ニュース速報',
  'ペット自慢スレ',
  '雑談スレッド',
];

const users = [
  '',
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eve',
  'Frank',
  'Grace',
  'Hannah',
  'Ivan',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Nathan',
  'Olivia',
];

const messages = [
  'これは面白いですね！',
  'どう思いますか？',
  '確かにそうですね。',
  'いや、それは違うと思います。',
  '詳しく教えてください！',
  '私もそれ好きです！',
  'なんか違和感あるな…',
  'なるほど、勉強になります。',
  'これは知らなかった！',
  'それはどこで見つけましたか？',
  `みんな、しあわせにな〜れ
　∧＿∧　
（｡･ω･｡)つ━☆・*。
⊂　　 ノ 　　　・゜+.
　しーＪ　　　°。+ *´¨)
　　　　　　　　　.· ´¸.·*´¨) ¸.·*¨)
　　　　　　　　　　(¸.·´ (¸.·'* ☆
  `,
];

async function main() {
  for (let i = 1; i <= 100; i++) {
    const thread = await prisma.thread.create({
      data: {
        title: threadTitles[Math.floor(Math.random() * threadTitles.length)],
        posts: {
          create: Array.from(
            { length: Math.floor(Math.random() * 200) + 50 }, // 50〜250のランダム投稿数
            () => ({
              content: messages[Math.floor(Math.random() * messages.length)],
              author: users[Math.floor(Math.random() * users.length)],
            }),
          ),
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
