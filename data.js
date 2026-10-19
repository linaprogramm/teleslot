/**
 * TeleSlot — База данных каналов, слотов, форматов постов, платформ и ИИ-пакетов
 */

const PLATFORMS = {
  TELEGRAM: { id: "telegram", name: "Telegram", icon: "✈️" },
  MAX: { id: "max", name: "MAX", icon: "⚡" },
  CROSS: { id: "cross", name: "TG + MAX", icon: "🚀" }
};

// 4 формата рекламы с разной стоимостью
const POST_FORMATS = [
  { id: "photo", label: "📝 Пост", tag: "Базовый", priceMod: 1.0, desc: "Пост с фото и текстом" },
  { id: "repost", label: "🔄 Репост", tag: "-25%", priceMod: 0.75, desc: "Прямой репост из канала" },
  { id: "story", label: "📱 История", tag: "-40%", priceMod: 0.60, desc: "Stories на 24 часа" },
  { id: "link", label: "🔗 Ссылка", tag: "-15%", priceMod: 0.85, desc: "Нативная ссылка в тексте" }
];

const AD_OBJECT_CATEGORIES = [
  { id: "channel", label: "Канал или блог" },
  { id: "shop", label: "Товар / Магазин" },
  { id: "service", label: "Услуги / Эксперт" },
  { id: "app", label: "Сервис / Приложение" }
];

const CHANNELS_DATA = [
  {
    id: "tech-future",
    name: "ТехноПульс & AI",
    handle: "@techno_pulse",
    platform: "cross",
    platformLabel: "TG + MAX",
    category: "deals",
    categoryLabel: "Выгодные",
    subscribers: 145000,
    dailyViews: 52400,
    err: "36.1%",
    badge: "🔥 Скидка на слот 18:00",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 68, female: 32 },
      age: [
        { label: "18-24", pct: 44 },
        { label: "25-34", pct: 38 },
        { label: "35+", pct: 18 }
      ],
      geo: [
        { country: "Россия", pct: 76 },
        { country: "Беларусь", pct: 11 },
        { country: "Казахстан", pct: 8 },
        { country: "Другие", pct: 5 }
      ]
    },
    slots: [
      { id: "s1", date: "23 октября", time: "14:00", status: "free" },
      { id: "s2", date: "23 октября", time: "18:00", status: "free", hot: true },
      { id: "s3", date: "24 октября", time: "12:30", status: "free" }
    ],
    prices: {
      "12h": 4800,
      "24h": 7200,
      "48h": 10500,
      "week": 15800
    },
    description: "Тренды технологий, IT и стартапов. Платежеспособная молодежная аудитория в Telegram и MAX."
  },
  {
    id: "mini-blog-sofia",
    name: "Софа | Личный блог",
    handle: "@sofa_cozy_life",
    platform: "cross",
    platformLabel: "TG + MAX",
    category: "blogs",
    categoryLabel: "Начинающие",
    subscribers: 6200,
    dailyViews: 4100,
    err: "66.1%",
    badge: "🌱 От 840 ₽ (ERR 66%)",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 22, female: 78 },
      age: [
        { label: "14-17", pct: 26 },
        { label: "18-24", pct: 56 },
        { label: "25+", pct: 18 }
      ],
      geo: [
        { country: "Россия", pct: 91 },
        { country: "Беларусь", pct: 5 },
        { country: "Другие", pct: 4 }
      ]
    },
    slots: [
      { id: "s20", date: "23 октября", time: "12:00", status: "free" },
      { id: "s21", date: "23 октября", time: "19:00", status: "free", hot: true }
    ],
    prices: {
      "12h": 950,
      "24h": 1400,
      "48h": 2100,
      "week": 3200
    },
    description: "Начинающий автор с ультра-высоким вовлечением. Нативные рекомендации и истории по доступной цене."
  },
  {
    id: "beauty-eva",
    name: "Ева про Бьюти",
    handle: "@eva_beauty_glow",
    platform: "telegram",
    platformLabel: "Telegram",
    category: "beauty",
    categoryLabel: "Красота",
    subscribers: 98000,
    dailyViews: 41800,
    err: "42.6%",
    badge: "✨ Топ для брендов",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 14, female: 86 },
      age: [
        { label: "18-24", pct: 52 },
        { label: "25-34", pct: 36 },
        { label: "35+", pct: 12 }
      ],
      geo: [
        { country: "Россия", pct: 82 },
        { country: "Казахстан", pct: 10 },
        { country: "Беларусь", pct: 5 },
        { country: "Другие", pct: 3 }
      ]
    },
    slots: [
      { id: "s5", date: "23 октября", time: "15:00", status: "free" },
      { id: "s6", date: "23 октября", time: "20:00", status: "free" }
    ],
    prices: {
      "12h": 3900,
      "24h": 5800,
      "48h": 8600,
      "week": 13200
    },
    description: "Косметика, стиль, одежда и маркетплейсы. Живой отклик и высокие продажи."
  },
  {
    id: "news-pulse",
    name: "Новости Трендов",
    handle: "@trends_today_tg",
    platform: "max",
    platformLabel: "MAX",
    category: "news",
    categoryLabel: "Новости",
    subscribers: 280000,
    dailyViews: 110000,
    err: "39.2%",
    badge: "⚡ Быстрый охват",
    avatar: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 54, female: 46 },
      age: [
        { label: "18-24", pct: 40 },
        { label: "25-34", pct: 41 },
        { label: "35+", pct: 19 }
      ],
      geo: [
        { country: "Россия", pct: 85 },
        { country: "Казахстан", pct: 8 },
        { country: "Беларусь", pct: 4 },
        { country: "Другие", pct: 3 }
      ]
    },
    slots: [
      { id: "s8", date: "23 октября", time: "11:00", status: "free" },
      { id: "s9", date: "23 октября", time: "17:00", status: "free", hot: true }
    ],
    prices: {
      "12h": 8500,
      "24h": 12900,
      "48h": 18500,
      "week": 27000
    },
    description: "Срочные новости и вирусные инфоповоды на платформе MAX и в Telegram."
  },
  {
    id: "blog-mark",
    name: "Дневник Марка",
    handle: "@mark_lifestyle",
    platform: "telegram",
    platformLabel: "Telegram",
    category: "blogs",
    categoryLabel: "Блоги",
    subscribers: 76000,
    dailyViews: 34500,
    err: "45.3%",
    badge: "🎙 Нативные интеграции",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 48, female: 52 },
      age: [
        { label: "18-24", pct: 58 },
        { label: "25-34", pct: 30 },
        { label: "35+", pct: 12 }
      ],
      geo: [
        { country: "Россия", pct: 88 },
        { country: "Беларусь", pct: 6 },
        { country: "Другие", pct: 6 }
      ]
    },
    slots: [
      { id: "s11", date: "23 октября", time: "16:00", status: "free" },
      { id: "s12", date: "24 октября", time: "15:00", status: "free" }
    ],
    prices: {
      "12h": 3200,
      "24h": 4900,
      "48h": 7400,
      "week": 11000
    },
    description: "Будни студента и стартапера. Авторские посты, репосты и живые истории."
  },
  {
    id: "biz-cases",
    name: "Бизнес & Запуски",
    handle: "@startup_cases",
    platform: "max",
    platformLabel: "MAX",
    category: "business",
    categoryLabel: "Бизнес",
    subscribers: 112000,
    dailyViews: 43000,
    err: "38.4%",
    badge: "💼 B2B аудитория",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    verified: true,
    eridAuto: true,
    demographics: {
      gender: { male: 72, female: 28 },
      age: [
        { label: "18-24", pct: 32 },
        { label: "25-34", pct: 49 },
        { label: "35+", pct: 19 }
      ],
      geo: [
        { country: "Россия", pct: 79 },
        { country: "Казахстан", pct: 11 },
        { country: "Другие", pct: 10 }
      ]
    },
    slots: [
      { id: "s14", date: "23 октября", time: "13:00", status: "free" },
      { id: "s15", date: "24 октября", time: "11:00", status: "free" }
    ],
    prices: {
      "12h": 5400,
      "24h": 7900,
      "48h": 11900,
      "week": 17500
    },
    description: "Фаундеры, эксперты, маркетологи и предприниматели с высоким чеком."
  }
];

// Сводка того, что мы НЕ берем в рекламу
const FORBIDDEN_THEMES = [
  { icon: "🚫", title: "Пирамиды и легкий заработок", desc: "Схемы обогащения, бинарные опционы, крипто-скам" },
  { icon: "🎰", title: "Казино и серые ставки", desc: "Нелегальный гемблинг и обман слот-машин" },
  { icon: "💊", title: "Запрещенные вещества", desc: "Нелицензированная фарма и опасные БАДы" },
  { icon: "🔞", title: "18+ адалт и знакомства", desc: "Приватные каналы со взрослым контентом" },
  { icon: "🤖", title: "Накрутка и спам", desc: "Ботоводческие софты, фишинг и вредоносы" },
  { icon: "⚖️", title: "Нарушение законов РФ", desc: "Любые запрещенные законом товары и услуги" }
];

// ИИ-пакеты размещения
const AI_PACKAGES = [
  {
    id: "ai-starter",
    name: "ИИ-Пакет «Тест»",
    channelsCount: "2–3 канала",
    reach: "15k–25k охват",
    price: 6900,
    badge: "Для новичков"
  },
  {
    id: "ai-growth",
    name: "ИИ-Пакет «Рост»",
    channelsCount: "4–6 каналов",
    reach: "50k–90k охват",
    price: 18900,
    badge: "Хит выбора ИИ 🔥",
    popular: true
  },
  {
    id: "ai-max-reach",
    name: "ИИ-Пакет «Топ»",
    channelsCount: "8–12 каналов",
    reach: "180k–300k+ охват",
    price: 49000,
    badge: "Федеральный"
  }
];

const FAQ_DATA = [
  {
    q: "Как рассчитывается цена в зависимости от вида поста?",
    a: "Цена зависит от выбранного формата: 📝 Пост (100% базовый прайс), 🔄 Репост (-25% от цены поста), 📱 История (-40% — самый доступный быстрый охват на 24 часа), 🔗 Ссылка (-15%). При смене формата цена пересчитывается мгновенно."
  },
  {
    q: "Как работает автоматическая маркировка и токен erid?",
    a: "Система автоматически регистрирует публикацию в ОРД, генерирует токен erid и передает данные в ЕРИР (Роскомнадзор). Никаких штрафов и рутинных отчетов."
  },
  {
    q: "Могут ли блогеры от 500 подписчиков подключить канал?",
    a: "Да! Мы сотрудничаем со всеми авторами с живой аудиторией. Бот сам присылает готовые заявки, а рекламодатели вносят 100% предоплату в Escrow."
  },
  {
    q: "Как настроить рекламу пакетом через ИИ?",
    a: "ИИ подбирает связку каналов в Telegram и MAX без пересечения аудиторий и присылает готовый отчёт прямо в Telegram-бот на согласование."
  }
];
