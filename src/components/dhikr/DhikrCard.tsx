import { useState } from "react";
import { Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

interface DhikrCardProps {
  dhikr: Content;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}

export function DhikrCard({ dhikr, isFavorite, onClick, onToggleFavorite }: DhikrCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const hasTranslation = dhikr.translation_en || dhikr.transliteration;

  return (
    <Card 
      className="cursor-pointer hover:bg-secondary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-medium arabic-text" dir="rtl">{dhikr.arabic}</p>
            
            {hasTranslation && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      {t.dhikr.hideTranslation}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {t.dhikr.showTranslation}
                    </>
                  )}
                </Button>
                
                {expanded && (
                  <div className="mt-2 space-y-2">
                    {dhikr.translation_en && (
                      <p className="text-sm text-muted-foreground">{dhikr.translation_en}</p>
                    )}
                    {dhikr.transliteration && (
                      <p className="text-xs text-muted-foreground italic">{dhikr.transliteration}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {dhikr.count && dhikr.count > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.dhikr.count}: {dhikr.count}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isFavorite && "fill-primary text-primary")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
