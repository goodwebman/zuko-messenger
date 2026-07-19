import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Плейсхолдеры генерятся локально как data:URI (SVG) — никаких внешних CDN,
// поэтому нет геоблокировок и всё грузится мгновенно в любом регионе.

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0);
  return h;
};

const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

/** Обложка поста: тёмный градиент по теме + акцентные пятна и lime-точка. */
const img = (slug: string): string => {
  const h1 = hash(slug) % 360;
  const h2 = (h1 + 40) % 360;
  const h3 = (h1 + 180) % 360;
  return svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${h1},46%,15%)"/>
          <stop offset="1" stop-color="hsl(${h2},52%,8%)"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.72" cy="0.28" r="0.65">
          <stop offset="0" stop-color="hsl(${h1},82%,55%)" stop-opacity="0.5"/>
          <stop offset="1" stop-color="hsl(${h1},82%,55%)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="600" fill="url(#bg)"/>
      <rect width="900" height="600" fill="url(#glow)"/>
      <circle cx="170" cy="480" r="260" fill="hsl(${h3},70%,50%)" fill-opacity="0.16"/>
      <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
        <path d="M0 150 H900 M0 300 H900 M0 450 H900 M225 0 V600 M450 0 V600 M675 0 V600"/>
      </g>
      <circle cx="705" cy="175" r="9" fill="#a8ff53"/>
    </svg>`);
};

/** Аватар: детерминированный градиент по нику + инициалы. */
const avatarDataUri = (displayName: string, seed: number): string => {
  const hue = (seed * 47) % 360;
  const initials =
    displayName
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  return svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue},62%,48%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 45) % 360},64%,32%)"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#a)"/>
      <text x="100" y="100" dy="0.35em" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-size="82" font-weight="700"
        fill="#ffffff" fill-opacity="0.92">${initials}</text>
    </svg>`);
};

interface SeedUser {
  username: string;
  displayName: string;
  bio: string;
  avatarImg: number;
}

const USERS: SeedUser[] = [
  { username: 'alice', displayName: 'Alice Rivera', bio: 'Продукт-дизайнер. Строю Zuko 🛠️', avatarImg: 5 },
  { username: 'bob', displayName: 'Bob Chen', bio: 'Тут ради мемов и тёмной темы 🌚', avatarImg: 12 },
  { username: 'maria', displayName: 'Maria Kowalska', bio: 'Frontend @ Zuko. React до мозга костей.', avatarImg: 20 },
  { username: 'dan', displayName: 'Dan Osei', bio: 'Backend / Postgres / очереди сообщений.', avatarImg: 33 },
  { username: 'lena', displayName: 'Lena Frost', bio: 'Motion-дизайн и микроанимации ✨', avatarImg: 45 },
  { username: 'viktor', displayName: 'Viktor Sokolov', bio: 'DevOps. Если что-то упало — это ко мне.', avatarImg: 51 },
  { username: 'nina', displayName: 'Nina Patel', bio: 'PM. Пишу таски, которые никто не читает.', avatarImg: 26 },
  { username: 'sam', displayName: 'Sam Brooks', bio: 'Indie hacker, кофе, сайд-проекты ☕️', avatarImg: 60 },
];

interface SeedPost {
  author: string;
  body: string;
  images?: string[];
  minutesAgo: number;
  likes?: string[];
  comments?: { author: string; body: string }[];
}

const POSTS: SeedPost[] = [
  {
    author: 'alice',
    body: 'Выкатили новую тёмную тему для Zuko. Signal Lime на угольном фоне выглядит космос 🌌 Как вам?',
    images: [img('theme-1'), img('theme-2')],
    minutesAgo: 8,
    likes: ['bob', 'maria', 'lena', 'sam'],
    comments: [
      { author: 'lena', body: 'Контраст 🔥 глаза отдыхают' },
      { author: 'bob', body: 'Наконец-то не выжигает сетчатку в 2 ночи' },
    ],
  },
  {
    author: 'lena',
    body: 'Добавила spring-анимации на появление сообщений. Мелочь, а чат сразу оживает.',
    images: [img('motion')],
    minutesAgo: 34,
    likes: ['alice', 'maria', 'nina'],
    comments: [{ author: 'alice', body: 'Тот самый polish, ради которого всё и делается' }],
  },
  {
    author: 'dan',
    body: 'Переписал доставку сообщений на Socket.io rooms. p95 latency упала с 180мс до 40мс. Графики ниже 👇',
    images: [img('latency')],
    minutesAgo: 72,
    likes: ['viktor', 'alice', 'sam', 'nina', 'maria'],
    comments: [
      { author: 'viktor', body: '40мс это уже почти телепатия' },
      { author: 'nina', body: 'Огонь, закрываю тикет ZUKO-142' },
    ],
  },
  {
    author: 'bob',
    body: 'когда прод лежит, но ты уже запушил фикс 😎',
    images: [img('meme')],
    minutesAgo: 95,
    likes: ['viktor', 'dan', 'sam'],
  },
  {
    author: 'maria',
    body: 'Вопрос дня: useEffect для производного состояния — это боль или это только у меня? Считайте при рендере, люди 🙏',
    minutesAgo: 140,
    likes: ['alice', 'dan', 'lena'],
    comments: [
      { author: 'dan', body: 'Это боль у всех, кто не читал доку про то, когда эффект НЕ нужен' },
      { author: 'alice', body: '+100, деривативы в state = второй источник правды' },
    ],
  },
  {
    author: 'viktor',
    body: 'Подняли health-чек и алерты в Grafana. Теперь узнаю о падении раньше, чем вы напишете в поддержку.',
    images: [img('grafana-1'), img('grafana-2'), img('grafana-3')],
    minutesAgo: 210,
    likes: ['dan', 'nina'],
    comments: [{ author: 'sam', body: 'Красота. Дашборды залипательные' }],
  },
  {
    author: 'sam',
    body: 'За выходные накидал MVP бота, который постит в Zuko через наш API. Документация — топ, всё завелось за вечер.',
    minutesAgo: 300,
    likes: ['alice', 'bob', 'maria', 'dan'],
    comments: [{ author: 'maria', body: 'Скинь репо, интересно как ты гоняешь auth' }],
  },
  {
    author: 'nina',
    body: 'Roadmap на квартал: группы, реакции на сообщения, поиск по истории. Что берём первым? Голосуем в комментах.',
    minutesAgo: 420,
    likes: ['alice', 'lena', 'viktor', 'sam', 'bob'],
    comments: [
      { author: 'lena', body: 'Реакции 💚' },
      { author: 'bob', body: 'реакции, очевидно же' },
      { author: 'dan', body: 'Поиск. Группы без поиска — ад.' },
    ],
  },
  {
    author: 'alice',
    body: 'Скетчи нового профиля. Обложка + закреплённый пост + статус онлайн. Ещё сырое, но направление нравится.',
    images: [img('profile-1'), img('profile-2')],
    minutesAgo: 620,
    likes: ['lena', 'nina', 'maria'],
  },
  {
    author: 'dan',
    body: 'Напоминание: refresh-токены теперь ротируются. Если разлогинило — это фича, а не баг 🙃',
    minutesAgo: 900,
    likes: ['viktor', 'sam'],
    comments: [{ author: 'bob', body: 'ну спасибо что предупредил, а то я уже панику поднял' }],
  },
];

async function main() {
  // Полный сброс демо-данных для идемпотентного seed (порядок — под FK).
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Пользователи
  const users = new Map<string, { id: string }>();
  for (const u of USERS) {
    const created = await prisma.user.create({
      data: {
        username: u.username,
        email: `${u.username}@zuko.dev`,
        passwordHash,
        displayName: u.displayName,
        bio: u.bio,
        avatarUrl: avatarDataUri(u.displayName, u.avatarImg),
      },
    });
    users.set(u.username, created);
  }
  const idOf = (username: string) => {
    const u = users.get(username);
    if (!u) throw new Error(`Unknown seed user: ${username}`);
    return u.id;
  };

  // Посты + лайки + комментарии
  let firstPostId: string | null = null;
  for (const p of POSTS) {
    const createdAt = new Date(Date.now() - p.minutesAgo * 60_000);
    const post = await prisma.post.create({
      data: {
        authorId: idOf(p.author),
        body: p.body,
        images: p.images ?? [],
        createdAt,
        likes: p.likes?.length
          ? { create: p.likes.map((username) => ({ userId: idOf(username) })) }
          : undefined,
        comments: p.comments?.length
          ? {
              create: p.comments.map((c) => ({
                authorId: idOf(c.author),
                body: c.body,
                createdAt: new Date(createdAt.getTime() + 60_000),
              })),
            }
          : undefined,
      },
    });
    firstPostId ??= post.id;
  }

  // Репост (11-й пост) с комментарием — чтобы лента выглядела живее
  if (firstPostId) {
    await prisma.post.create({
      data: {
        authorId: idOf('nina'),
        body: 'Вот это уровень отделки — забираем в шоукейс 👏',
        repostOfId: firstPostId,
        createdAt: new Date(Date.now() - 5 * 60_000),
      },
    });
  }

  // Демо-диалог alice <-> bob
  const conversation = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: idOf('alice') }, { userId: idOf('bob') }] },
      messages: {
        create: [
          { senderId: idOf('alice'), body: 'Привет, Bob! Глянул новую тему?' },
          { senderId: idOf('bob'), body: 'Здарова 👋 да, лайк. Lime — топ' },
          { senderId: idOf('alice'), body: 'Го тогда катить в прод 🚀' },
        ],
      },
    },
  });

  console.log('Seed complete:', {
    users: USERS.length,
    posts: POSTS.length + 1,
    conversationId: conversation.id,
    login: 'alice / bob / maria / dan / …, пароль: password123',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
