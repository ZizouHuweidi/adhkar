export interface Category {
  id: number;
  type_id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Content {
  id: number;
  type_id: number;
  source_id: number;
  arabic: string;
  transliteration: string | null;
  translation_en: string | null;
  translation_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  count: number | null;
  source: string | null;
  reference: string | null;
  grade: string | null;
  hadith_arabic: string | null;
  hadith_english: string | null;
}

export interface UserProgress {
  content_id: number;
  current_count: number;
  target_count: number;
  last_practiced: string | null;
}

export interface NotificationLog {
  id: number;
  content_id: number | null;
  shown_at: string;
  action: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Folder {
  id: number;
  name: string;
}
