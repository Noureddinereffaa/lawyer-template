// ============================================================
//  CLIENT CONFIG — تعديل هذا الملف فقط لكل عميل جديد
//  Modify ONLY this file to customize for a new lawyer client
// ============================================================

export const clientConfig = {
  // ─── الهوية ───────────────────────────────────────────────
  lawyerName: "الأستاذ محمد بن علي",
  officeName: "مكتب بن علي للمحاماة",
  tagline: "خبرة قانونية تحمي حقوقك",
  logo: "/logo.svg",
  favicon: "/favicon.ico",
  ogImage: "/og-image.jpg",

  // ─── الثيم ────────────────────────────────────────────────
  theme: {
    primaryColor: "#1a3c5e",
    primaryLight: "#2a5c8e",
    secondaryColor: "#c9a84c",
    secondaryLight: "#e8c96a",
    bgColor: "#f8f9fa",
    surfaceColor: "#ffffff",
    textPrimary: "#1a1a2e",
    textSecondary: "#555577",
    borderColor: "#e2e8f0",
    fontHeading: "Amiri",
    fontBody: "Tajawal",
    borderRadius: "8px",
  },

  // ─── التواصل ──────────────────────────────────────────────
  contact: {
    phone: "+213 XX XX XX XX",
    phoneDisplay: "0X XX XX XX XX",
    email: "contact@benali-law.dz",
    address: "شارع 1 نوفمبر، الجزائر العاصمة",
    wilaya: "الجزائر",
    postalCode: "16000",
    googleMapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.0!2d3.042!3d36.737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ0JzEzLjIiTiAzwrAwMicxNS4yIkU!5e0!3m2!1sen!2sdz!4v1234567890",
  },

  // ─── ساعات العمل ──────────────────────────────────────────
  workingHours: [
    { day: "الأحد – الخميس", hours: "09:00 – 17:00" },
    { day: "السبت",          hours: "09:00 – 13:00" },
    { day: "الجمعة",         hours: "مغلق" },
  ],

  // ─── إحصائيات Hero ────────────────────────────────────────
  stats: [
    { label: "سنوات الخبرة",   value: "15+" },
    { label: "قضية ناجحة",    value: "500+" },
    { label: "عميل راضٍ",     value: "300+" },
    { label: "تخصص قانوني",   value: "8" },
  ],

  // ─── نصوص الواجهة الأمامية (جديد - CMS) ───────────────────
  hero: {
    title: "خبرة قانونية تحمي حقوقك",
    description: "نقدم استشارات قانونية احترافية في مجالات الأسرة، التجارة، العقارات والقضايا الجنائية. فريقنا يضمن لك الحماية القانونية الكاملة بخبرة تمتد لأكثر من 15 سنة."
  },

  trustBar: [
    "✅ محامٍ معتمد لدى المجلس الأعلى للقضاء",
    "🔒 سرية تامة",
    "⚡ رد خلال 24 ساعة",
    "📍 الجزائر العاصمة"
  ],

  about: {
    description: "محامٍ معتمد لدى المحاكم الجزائرية بخبرة تمتد لـ 15 عاماً في مجالات القانون التجاري، الأسرة، والعقارات. نلتزم بالشفافية التامة والدفاع الكامل عن حقوق موكلينا.",
    features: [
      "عضو نقابة المحامين الجزائريين",
      "دكتوراه في القانون الخاص – جامعة الجزائر 1",
      "أكثر من 500 قضية مُنجزة بنجاح",
      "لغات العمل: العربية، الفرنسية"
    ]
  },

  testimonials: [
    { name: "أحمد بلقاسم", role: "عميل، قانون الأسرة", text: "خدمة احترافية جداً، المحامي شرح لي كل خطوة بوضوح وكسبنا القضية. أنصح به بكل ثقة.", stars: 5 },
    { name: "فاطمة مهداوي", role: "عميلة، قانون العقارات", text: "تعاملت معه في قضية تسجيل عقار معقدة وحُلّت بسرعة مذهلة. شكراً جزيلاً.", stars: 5 },
    { name: "كريم بوزيد", role: "صاحب شركة، قانون تجاري", text: "مكّنني من حل نزاع تجاري كان يهدد شركتي. اتفاق عادل وسرعة في الإنجاز.", stars: 5 },
  ],

  // ─── التخصصات الرئيسية (Hero/Services) ────────────────────
  specialties: [
    {
      id: "family",
      title: "قانون الأسرة",
      description: "الطلاق، الحضانة، النفقة، الميراث، وجميع قضايا الأحوال الشخصية.",
      icon: "⚖️",
      priceFrom: 3000,
    },
    {
      id: "commercial",
      title: "القانون التجاري",
      description: "تأسيس الشركات، العقود التجارية، النزاعات، والإفلاس.",
      icon: "🏢",
      priceFrom: 5000,
    },
    {
      id: "realestate",
      title: "قانون العقارات",
      description: "بيع وشراء العقارات، النزاعات العقارية، والتسجيل.",
      icon: "🏠",
      priceFrom: 4000,
    },
    {
      id: "criminal",
      title: "القانون الجنائي",
      description: "الدفاع الجنائي، الطعون، وقضايا المخالفات.",
      icon: "🔒",
      priceFrom: 6000,
    },
    {
      id: "labor",
      title: "قانون العمل",
      description: "النزاعات العمالية، الفصل التعسفي، والضمان الاجتماعي.",
      icon: "👷",
      priceFrom: 3500,
    },
    {
      id: "admin",
      title: "القانون الإداري",
      description: "الطعن في القرارات الإدارية، الصفقات العمومية.",
      icon: "📋",
      priceFrom: 4000,
    },
  ],

  // ─── نظام الحجز ───────────────────────────────────────────
  booking: {
    // 0=أحد، 1=اثنين ... 6=سبت
    workDays: [0, 1, 2, 3, 4, 6],
    workHours: { start: "09:00", end: "17:00" },
    slotDurationMin: 60,
    maxAdvanceDays: 30,
    consultationTypes: [
      { id: "family",     label: "قانون الأسرة",    price: 3000 },
      { id: "commercial", label: "قانون تجاري",     price: 5000 },
      { id: "realestate", label: "قانون عقارات",    price: 4000 },
      { id: "criminal",   label: "قانون جنائي",     price: 6000 },
      { id: "labor",      label: "قانون العمل",     price: 3500 },
      { id: "admin",      label: "قانون إداري",     price: 4000 },
      { id: "other",      label: "أخرى / عامة",    price: 3000 },
    ],
  },

  // ─── SEO ──────────────────────────────────────────────────
  seo: {
    defaultTitle: "مكتب بن علي للمحاماة | استشارات قانونية – الجزائر",
    titleTemplate: "%s | مكتب بن علي للمحاماة",
    description:
      "محامٍ معتمد في الجزائر متخصص في القانون التجاري والأسرة والعقارات. احجز استشارتك القانونية عبر الإنترنت.",
    keywords: [
      "محامي الجزائر",
      "استشارة قانونية",
      "محامي تجاري",
      "محامي أسرة",
      "cabinet avocat algerie",
    ],
    locale: "ar_DZ",
    siteUrl: "https://benali-law.dz",
  },

  // ─── شبكات اجتماعية ────────────────────────────────────────
  social: {
    facebook: "https://facebook.com/",
    linkedin:  "https://linkedin.com/",
    whatsapp:  "+213XXXXXXXXX",
  },
};

export type ClientConfig = typeof clientConfig;
