import { useEffect, useMemo, useState } from 'react';
import './App.css';

type ArabicFont = 'kitab' | 'naskh' | 'system';
type Theme = 'light' | 'dark';
type Language = 'en' | 'ar';
type Tab = 'dhikr' | 'favorites' | 'history';

type DhikrItem = {
  title: string;
  arabic: string;
  translation: string;
  transliteration: string;
  reference: string;
  virtue: string;
  explanation: string;
  count: string;
};

type DhikrCategory = {
  slug: string;
  name: string;
  name_ar: string;
  description?: string;
  dhikr: DhikrItem[];
};

type DhikrData = {
  main: DhikrCategory[];
  others: DhikrCategory[];
};

type Reminder = DhikrItem & {
  id: string;
  categorySlug: string;
  categoryName: string;
};

type HistoryEntry = {
  id: string;
  reminderId: string;
  title: string;
  shownAt: string;
};

const fontLabels: Record<ArabicFont, string> = {
  kitab: 'Kitab',
  naskh: 'Naskh',
  system: 'System fallback',
};

const loadJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [data, setData] = useState<DhikrData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState('morning');
  const [activeTab, setActiveTab] = useState<Tab>('dhikr');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(loadJson<string[]>('favorites', [])),
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadJson<HistoryEntry[]>('history', []),
  );
  const [arabicFont, setArabicFont] = useState<ArabicFont>(
    () => (localStorage.getItem('arabic-font') as ArabicFont) || 'kitab',
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'light',
  );
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'en',
  );

  useEffect(() => {
    window.electron.adhkar
      .getData()
      .then((loadedData) => setData(loadedData as DhikrData))
      .catch((loadError) => setError(String(loadError)));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.arabicFont = arabicFont;
    localStorage.setItem('arabic-font', arabicFont);
  }, [arabicFont]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const categories = useMemo(() => {
    if (!data) return [];
    return [...data.main, ...data.others];
  }, [data]);

  const reminders = useMemo<Reminder[]>(
    () =>
      categories.flatMap((category) =>
        category.dhikr.map((dhikr, index) => ({
          ...dhikr,
          id: `${category.slug}-${index}`,
          categorySlug: category.slug,
          categoryName: category.name,
        })),
      ),
    [categories],
  );

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.slug === selectedSlug) ??
      categories[0],
    [categories, selectedSlug],
  );

  const selectedReminders = useMemo(
    () =>
      reminders.filter((reminder) => reminder.categorySlug === selectedSlug),
    [reminders, selectedSlug],
  );

  const filteredReminders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return reminders.filter(
      (reminder) =>
        reminder.arabic.includes(searchQuery.trim()) ||
        reminder.translation.toLowerCase().includes(query) ||
        reminder.transliteration.toLowerCase().includes(query) ||
        reminder.title.toLowerCase().includes(query),
    );
  }, [reminders, searchQuery]);

  const favoriteReminders = useMemo(
    () => reminders.filter((reminder) => favorites.has(reminder.id)),
    [favorites, reminders],
  );

  const recordHistory = (reminder: Reminder) => {
    const entry: HistoryEntry = {
      id: `${reminder.id}-${Date.now()}`,
      reminderId: reminder.id,
      title: reminder.title || reminder.categoryName,
      shownAt: new Date().toISOString(),
    };
    setHistory((current) => [entry, ...current].slice(0, 50));
  };

  const toggleFavorite = (reminder: Reminder) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(reminder.id)) next.delete(reminder.id);
      else next.add(reminder.id);
      return next;
    });
  };

  const toggleExpanded = (reminder: Reminder) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(reminder.id)) next.delete(reminder.id);
      else next.add(reminder.id);
      return next;
    });
    recordHistory(reminder);
  };

  const renderReminderCard = (reminder: Reminder, index: number) => {
    const isExpanded = expandedIds.has(reminder.id);
    const isFavorite = favorites.has(reminder.id);

    return (
      <article key={reminder.id} className="card">
        <button
          type="button"
          className="cardButton"
          onClick={() => toggleExpanded(reminder)}
        >
          <div className="cardMeta">
            <span>{index + 1}</span>
            {reminder.title && <strong>{reminder.title}</strong>}
            {reminder.count && <span>{reminder.count}</span>}
          </div>
          <p className="arabicText" dir="rtl" lang="ar">
            {reminder.arabic}
          </p>
        </button>
        <div className="cardActions">
          <button type="button" onClick={() => toggleFavorite(reminder)}>
            {isFavorite ? 'Remove favorite' : 'Favorite'}
          </button>
          <button type="button" onClick={() => toggleExpanded(reminder)}>
            {isExpanded ? 'Hide details' : 'Show details'}
          </button>
        </div>
        {isExpanded && (
          <div className="details">
            {reminder.translation && (
              <p>
                <strong>Translation</strong>
                {reminder.translation}
              </p>
            )}
            {reminder.transliteration && (
              <p>
                <strong>Transliteration</strong>
                {reminder.transliteration}
              </p>
            )}
            {reminder.reference && (
              <p>
                <strong>Reference</strong>
                {reminder.reference}
              </p>
            )}
            {reminder.virtue && (
              <p>
                <strong>Virtue</strong>
                {reminder.virtue}
              </p>
            )}
          </div>
        )}
      </article>
    );
  };

  if (error) {
    return <main className="shell">Failed to load adhkar data: {error}</main>;
  }

  if (!data || !selectedCategory) {
    return <main className="shell">Loading adhkar data...</main>;
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Daily remembrance</p>
          <h1>{language === 'ar' ? 'الأذكار' : 'Adhkar'}</h1>
          <p className="summary">
            Read morning, evening, and daily adhkar offline with clear Arabic
            typography, saved favorites, and local reading history.
          </p>
        </div>
        <div className="toolbar">
          <label className="field" htmlFor="arabic-font">
            Arabic font
            <select
              id="arabic-font"
              value={arabicFont}
              onChange={(event) =>
                setArabicFont(event.target.value as ArabicFont)
              }
            >
              {Object.entries(fontLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
        </div>
      </header>

      <div className="searchBar">
        <input
          type="search"
          placeholder="Search Arabic, translation, or transliteration"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <nav className="tabs" aria-label="Primary">
        {(['dhikr', 'favorites', 'history'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {searchQuery.trim() && (
        <section className="searchResults">
          <h2>Search results ({filteredReminders.length})</h2>
          <div className="cards compact">
            {filteredReminders.map(renderReminderCard)}
          </div>
        </section>
      )}

      {activeTab === 'dhikr' && (
        <section className="layout">
          <aside className="sidebar">
            <h2>Collections</h2>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={
                  category.slug === selectedCategory.slug
                    ? 'category active'
                    : 'category'
                }
                onClick={() => setSelectedSlug(category.slug)}
              >
                <span>{category.name}</span>
                <span className="categoryArabic" dir="rtl" lang="ar">
                  {category.name_ar}
                </span>
              </button>
            ))}
          </aside>

          <section className="content">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">{selectedCategory.name}</p>
                <h2 dir="rtl" lang="ar" className="arabicTitle">
                  {selectedCategory.name_ar}
                </h2>
              </div>
              <p>{selectedReminders.length} reminders</p>
            </div>
            <div className="cards">
              {selectedReminders.map(renderReminderCard)}
            </div>
          </section>
        </section>
      )}

      {activeTab === 'favorites' && (
        <section className="content fullWidth">
          <div className="sectionHeader">
            <h2>Favorites</h2>
            <p>{favoriteReminders.length} saved</p>
          </div>
          <div className="cards">
            {favoriteReminders.map(renderReminderCard)}
            {favoriteReminders.length === 0 && <p>No favorites yet.</p>}
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="content fullWidth">
          <div className="sectionHeader">
            <h2>History</h2>
            <button type="button" onClick={() => setHistory([])}>
              Clear
            </button>
          </div>
          <div className="historyList">
            {history.map((entry) => (
              <div key={entry.id} className="historyItem">
                <strong>{entry.title}</strong>
                <span>{new Date(entry.shownAt).toLocaleString()}</span>
              </div>
            ))}
            {history.length === 0 && <p>No history yet.</p>}
          </div>
        </section>
      )}
    </main>
  );
}
