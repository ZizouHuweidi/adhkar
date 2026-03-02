import { useState, useEffect } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import * as api from "@/hooks/useApi";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export function Header({ searchQuery, onSearchChange, onSearch }: HeaderProps) {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    api.getSetting("theme").then((t) => {
      if (t === "dark" || t === "light") setTheme(t);
    });
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    api.setSetting("theme", theme);
  }, [theme]);

  return (
    <header className="border-b border-border bg-card px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold truncate">{t.app.title}</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            {language === "en" ? "عربي" : "English"}
          </Button>
        </div>
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
          <Input
            type="text"
            placeholder={t.dhikr.search}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className={cn("h-8 sm:h-10 text-sm", isRtl ? "pr-9" : "pl-9")}
          />
        </div>
      </div>
    </header>
  );
}
