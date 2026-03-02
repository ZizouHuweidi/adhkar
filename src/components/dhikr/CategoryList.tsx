import { useState } from "react";
import type { Category } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

interface CategoryListProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export function CategoryList({ categories, onSelectCategory }: CategoryListProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"main" | "others">("main");

  // Define which category slugs are "main"
  const mainSlugs = [
    "morning",
    "evening",
    "before-sleep",
    "salah",
    "after-salah",
    "ruqyah-and-illness-quran",
    "praises-of-allah",
    "salawat",
    "quranic-duas",
    "sunnah-duas",
    "name-of-allah",
    "istighfar",
  ];

  const mainCategories = categories.filter((cat) => mainSlugs.includes(cat.slug));
  const otherCategories = categories.filter((cat) => !mainSlugs.includes(cat.slug));

  const displayedCategories = activeTab === "main" ? mainCategories : otherCategories;

  return (
    <div>
      {/* Main/Others Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("main")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "main"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {language === "ar" ? "الرئيسية" : "Main"}
        </button>
        <button
          onClick={() => setActiveTab("others")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "others"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {language === "ar" ? "أخرى" : "Others"}
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {displayedCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-left"
          >
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {language === "ar" && cat.name_ar ? cat.name_ar : cat.name_en}
            </h3>
            {language === "en" && cat.name_ar && (
              <p className="text-xs sm:text-sm text-muted-foreground" dir="rtl">
                {cat.name_ar}
              </p>
            )}
          </button>
        ))}
      </div>

      {displayedCategories.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {activeTab === "main"
            ? "No main categories available"
            : "No other categories available"}
        </p>
      )}
    </div>
  );
}
