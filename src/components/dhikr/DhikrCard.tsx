import { Heart } from "lucide-react";
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

  return (
    <Card 
      className="cursor-pointer hover:bg-secondary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-medium truncate arabic-text" dir="rtl">{dhikr.arabic}</p>
            {dhikr.translation_en && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dhikr.translation_en}</p>
            )}
            {dhikr.count && (
              <p className="text-xs text-muted-foreground mt-1">{t.dhikr.count}: {dhikr.count}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
