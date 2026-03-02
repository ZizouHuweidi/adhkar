export type Language = "en" | "ar";

export interface AppTranslations {
  app: {
    title: string;
    subtitle: string;
  };
  tabs: {
    dhikr: string;
    favorites: string;
    history: string;
    settings: string;
  };
  categories: {
    title: string;
    back: string;
  };
  dhikr: {
    search: string;
    count: string;
    reset: string;
    addFavorite: string;
    removeFavorite: string;
    close: string;
    showTranslation: string;
    hideTranslation: string;
    translation: string;
    transliteration: string;
    virtue: string;
    explanation: string;
    reference: string;
  };
  favorites: {
    empty: string;
    emptyHint: string;
  };
  history: {
    empty: string;
    emptyHint: string;
    viewed: string;
  };
  settings: {
    title: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    notifications: string;
    enabled: string;
    interval: string;
  };
}

export const translations: Record<Language, AppTranslations> = {
  en: {
    app: {
      title: "Adhkar",
      subtitle: "Dhikr & Dua",
    },
    tabs: {
      dhikr: "Dhikr",
      favorites: "Favorites",
      history: "History",
      settings: "Settings",
    },
    categories: {
      title: "Categories",
      back: "Back to categories",
    },
    dhikr: {
      search: "Search dhikr...",
      count: "Count",
      reset: "Reset",
      addFavorite: "Add to Favorites",
      removeFavorite: "Remove from Favorites",
      close: "Close",
      showTranslation: "Show translation",
      hideTranslation: "Hide translation",
      translation: "Translation",
      transliteration: "Transliteration",
      virtue: "Virtue",
      explanation: "Explanation",
      reference: "Reference",
    },
    favorites: {
      empty: "No favorites yet",
      emptyHint: "Tap the heart icon on any dhikr to add it here",
    },
    history: {
      empty: "No notification history yet",
      emptyHint: "Your dhikr activity will appear here",
      viewed: "Viewed",
    },
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      notifications: "Notifications",
      enabled: "Enabled",
      interval: "Default Interval (minutes)",
    },
  },
  ar: {
    app: {
      title: "أذكار",
      subtitle: "الذكر والدعاء",
    },
    tabs: {
      dhikr: "أذكار",
      favorites: "المفضلة",
      history: "السجل",
      settings: "الإعدادات",
    },
    categories: {
      title: "الفئات",
      back: "العودة للفئات",
    },
    dhikr: {
      search: "بحث في الأذكار...",
      count: "العدد",
      reset: "إعادة",
      addFavorite: "إضافة للمفضلة",
      removeFavorite: "إزالة من المفضلة",
      close: "إغلاق",
      showTranslation: "عرض الترجمة",
      hideTranslation: "إخفاء الترجمة",
      translation: "الترجمة",
      transliteration: "النطق",
      virtue: "الفضيلة",
      explanation: "الشرح",
      reference: "المرجع",
    },
    favorites: {
      empty: "لا توجد مفضلات بعد",
      emptyHint: "اضغط على أيقونة القلب على أي ذكر لإضافته هنا",
    },
    history: {
      empty: "لا يوجد سجل إشعارات بعد",
      emptyHint: "سيظهر نشاطك في الأذكار هنا",
      viewed: "معاينة",
    },
    settings: {
      title: "الإعدادات",
      language: "اللغة",
      theme: "المظهر",
      light: "فاتح",
      dark: "داكن",
      system: "النظام",
      notifications: "الإشعارات",
      enabled: "مفعّل",
      interval: "الفترة الافتراضية (دقائق)",
    },
  },
};
