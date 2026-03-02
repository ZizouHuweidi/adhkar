import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { Header } from "@/components/layout";
import { DhikrList } from "@/components/dhikr";
import { FavoritesList, HistoryList, SearchResults, FolderDialog } from "@/components/common";
import type { Category, Content, NotificationLog } from "@/lib/types";
import * as api from "@/hooks/useApi";
import "./index.css";

function AppContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dhikr");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dhikrList, setDhikrList] = useState<Content[]>([]);
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [categoryFavoritesSet, setCategoryFavoritesSet] = useState<Set<number>>(new Set());

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [pendingContentId, setPendingContentId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
    loadCategoryFavorites();
    loadHistory();
  }, []);

  async function loadCategories() {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  }

  async function loadCategoryFavorites() {
    try {
      const cats = await api.getCategories();
      const favSet = new Set<number>();
      for (const cat of cats) {
        const isFav = await api.isCategoryFavorite(cat.id);
        if (isFav) {
          favSet.add(cat.id);
        }
      }
      setCategoryFavoritesSet(favSet);
    } catch (e) {
      console.error("Failed to load category favorites:", e);
    }
  }

  async function loadHistory() {
    try {
      const hist = await api.getNotificationHistory(50);
      setHistory(hist);
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }

  async function loadDhikrForCategory(category: Category) {
    try {
      const dhikr = await api.getDhikrByCategory(category.id);
      setDhikrList(dhikr);
      setSelectedCategory(category);
      
      const favSet = new Set<number>();
      for (const d of dhikr) {
        const isFav = await api.isFavorite(d.id);
        if (isFav) {
          favSet.add(d.id);
        }
      }
      setFavoritesSet(favSet);
    } catch (e) {
      console.error("Failed to load dhikr:", e);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchDhikr(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error("Failed to search:", e);
    }
  }

  function handleToggleFavoriteClick(content: Content) {
    if (favoritesSet.has(content.id)) {
      removeFavorite(content.id);
    } else {
      setPendingContentId(content.id);
      setFolderDialogOpen(true);
    }
  }

  async function removeFavorite(contentId: number) {
    try {
      await api.removeFavorite(contentId);
      setFavoritesSet((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    } catch (e) {
      console.error("Failed to remove favorite:", e);
    }
  }

  async function handleSelectFolder(folderId: number) {
    if (pendingContentId === null) return;
    try {
      await api.addFavoriteToFolder(pendingContentId, folderId);
      setFavoritesSet((prev) => new Set(prev).add(pendingContentId));
      setPendingContentId(null);
    } catch (e) {
      console.error("Failed to add favorite to folder:", e);
    }
  }

  async function handleToggleCategoryFavorite(categoryId: number) {
    try {
      if (categoryFavoritesSet.has(categoryId)) {
        await api.removeCategoryFavorite(categoryId);
        setCategoryFavoritesSet((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
      } else {
        await api.createFolderForCategory(categoryId);
        setCategoryFavoritesSet((prev) => new Set(prev).add(categoryId));
      }
    } catch (e) {
      console.error("Failed to toggle category favorite:", e);
    }
  }

  async function handleRemoveFolder(folderId: number) {
    try {
      await api.deleteFolder(folderId);
      loadHistory();
    } catch (e) {
      console.error("Failed to remove folder:", e);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <SearchResults
        results={searchResults}
        onSelect={(content) => {
          handleToggleFavoriteClick(content);
          setSearchQuery("");
          setSearchResults([]);
        }}
      />

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onSelectFolder={handleSelectFolder}
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-border bg-card px-2 sm:px-4 overflow-x-auto">
          <Tabs.Trigger
            value="dhikr"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            {t.tabs.dhikr}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="favorites"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            {t.tabs.favorites}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="history"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
          >
            {t.tabs.history}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="dhikr" className="p-3 sm:p-4">
          <DhikrList
            categories={categories}
            dhikrList={dhikrList}
            selectedCategory={selectedCategory}
            favoritesSet={favoritesSet}
            categoryFavoritesSet={categoryFavoritesSet}
            onSelectCategory={loadDhikrForCategory}
            onBack={() => {
              setSelectedCategory(null);
              setDhikrList([]);
            }}
            onToggleFavorite={handleToggleFavoriteClick}
            onToggleCategoryFavorite={handleToggleCategoryFavorite}
          />
        </Tabs.Content>

        <Tabs.Content value="favorites" className="p-3 sm:p-4">
          <FavoritesList
            onToggleFavorite={handleToggleFavoriteClick}
            onRemoveFolder={handleRemoveFolder}
          />
        </Tabs.Content>

        <Tabs.Content value="history" className="p-3 sm:p-4">
          <HistoryList history={history} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
