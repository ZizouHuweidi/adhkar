import { useState } from "react";
import { Heart, List, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, Content } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

interface DhikrListProps {
  categories: Category[];
  dhikrList: Content[];
  selectedCategory: Category | null;
  favoritesSet: Set<number>;
  categoryFavoritesSet: Set<number>;
  onSelectCategory: (category: Category) => void;
  onBack: () => void;
  onToggleFavorite: (content: Content) => void;
  onToggleCategoryFavorite: (categoryId: number) => void;
}

function getDhikrTitle(dhikr: Content): string {
  if (dhikr.title) return dhikr.title;
  // Fallback: first 30 chars of Arabic
  const arabicWords = dhikr.arabic.split(/\s+/).slice(0, 4).join(" ");
  return arabicWords.length > 30 ? arabicWords.substring(0, 30) + "..." : arabicWords;
}

interface ExpandedContentProps {
  dhikr: Content;
}

function ExpandedContent({ dhikr }: ExpandedContentProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-3 space-y-3">
      {dhikr.translation_en && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.dhikr.translation}</p>
          <p className="text-sm text-muted-foreground">{dhikr.translation_en}</p>
        </div>
      )}

      {dhikr.transliteration && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.dhikr.transliteration}</p>
          <p className="text-sm text-muted-foreground italic">{dhikr.transliteration}</p>
        </div>
      )}

      {dhikr.reference && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.dhikr.reference}</p>
          <p className="text-sm text-muted-foreground">{dhikr.reference}</p>
        </div>
      )}

      {dhikr.virtue && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.dhikr.virtue}</p>
          <p className="text-sm text-muted-foreground">{dhikr.virtue}</p>
        </div>
      )}

      {dhikr.explanation && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.dhikr.explanation}</p>
          <p className="text-sm text-muted-foreground">{dhikr.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function DhikrList({
  categories,
  dhikrList,
  selectedCategory,
  favoritesSet,
  categoryFavoritesSet,
  onSelectCategory,
  onBack,
  onToggleFavorite,
  onToggleCategoryFavorite,
}: DhikrListProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"main" | "others">("main");
  const [expandedDhikr, setExpandedDhikr] = useState<Set<number>>(new Set());
  const [showToc, setShowToc] = useState(false);

  const mainSlugs = [
    "morning", "evening", "before-sleep", "salah", "after-salah",
    "ruqyah-and-illness-quran", "praises-of-allah", "salawat",
    "quranic-duas", "sunnah-duas", "name-of-allah", "istighfar",
  ];

  const mainCategories = categories.filter((cat) => mainSlugs.includes(cat.slug));
  const otherCategories = categories.filter((cat) => !mainSlugs.includes(cat.slug));
  const displayedCategories = activeTab === "main" ? mainCategories : otherCategories;

  if (!selectedCategory) {
    return (
      <div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "main" ? "default" : "outline"}
            onClick={() => setActiveTab("main")}
            className="flex-1"
          >
            {language === "ar" ? "الرئيسية" : "Main"}
          </Button>
          <Button
            variant={activeTab === "others" ? "default" : "outline"}
            onClick={() => setActiveTab("others")}
            className="flex-1"
          >
            {language === "ar" ? "أخرى" : "Others"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {displayedCategories.map((cat) => {
            const isCategoryFavorite = categoryFavoritesSet.has(cat.id);
            return (
              <div key={cat.id} className="relative">
                <button
                  onClick={() => onSelectCategory(cat)}
                  className="w-full p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-left pr-10"
                >
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {language === "ar" && cat.name_ar ? cat.name_ar : cat.name_en}
                  </h3>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCategoryFavorite(cat.id);
                  }}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isCategoryFavorite && "fill-red-500 text-red-500"
                    )}
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedDhikr((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDhikr(new Set(dhikrList.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedDhikr(new Set());
  };

  const categoryDescription = selectedCategory.description_en;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto">
          ← {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToc(!showToc)}
            className={cn(showToc && "bg-secondary")}
          >
            <List className="h-4 w-4 mr-1" />
            {language === "ar" ? "فهرس" : "TOC"}
          </Button>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-2">
        {language === "ar" && selectedCategory.name_ar
          ? selectedCategory.name_ar
          : selectedCategory.name_en}
      </h2>

      {categoryDescription && (
        <p className="text-sm text-muted-foreground mb-4">
          {categoryDescription}
        </p>
      )}

      {showToc && (
        <div className="mb-4 p-3 bg-secondary rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">
              {language === "ar" ? "فهرس المحتوى" : "Table of Contents"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll}>
                {language === "ar" ? "توسيع الكل" : "Expand All"}
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>
                {language === "ar" ? "طي الكل" : "Collapse All"}
              </Button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {dhikrList.map((dhikr, index) => (
              <button
                key={dhikr.id}
                onClick={() => {
                  toggleExpand(dhikr.id);
                  document.getElementById(`dhikr-${dhikr.id}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-start text-sm text-muted-foreground hover:text-foreground py-1"
              >
                {index + 1}. {getDhikrTitle(dhikr)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dhikrList.map((dhikr, index) => {
          const isExpanded = expandedDhikr.has(dhikr.id);
          const isFavorite = favoritesSet.has(dhikr.id);

          return (
            <Card
              key={dhikr.id}
              id={`dhikr-${dhikr.id}`}
              className={cn("transition-all", isExpanded && "bg-secondary/30")}
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleExpand(dhikr.id)}
                  className="w-full p-3 sm:p-4 flex items-start justify-between gap-3 text-start"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{index + 1}.</span>
                      {dhikr.title && (
                        <span className="text-xs font-medium text-primary">{dhikr.title}</span>
                      )}
                    </div>
                    <p
                      className="text-lg sm:text-xl font-medium arabic-text"
                      dir="rtl"
                    >
                      {dhikr.arabic}
                    </p>
                    {dhikr.count && dhikr.count > 0 && (
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        ({dhikr.count}x)
                      </span>
                    )}
                    
                    {isExpanded && <ExpandedContent dhikr={dhikr} />}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(dhikr);
                      }}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isFavorite && "fill-red-500 text-red-500"
                        )}
                      />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {dhikrList.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {language === "ar" ? "لا توجد أذكار" : "No dhikr found"}
        </p>
      )}
    </div>
  );
}
