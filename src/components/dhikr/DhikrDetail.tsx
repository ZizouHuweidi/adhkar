import { Heart, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/types";
import { useLanguage } from "@/hooks/useLanguage";

interface DhikrDetailProps {
  dhikr: Content;
  currentCount: number;
  isFavorite: boolean;
  onClose: () => void;
  onIncrement: () => void;
  onReset: () => void;
  onToggleFavorite: () => void;
}

export function DhikrDetail({
  dhikr,
  currentCount,
  isFavorite,
  onClose,
  onIncrement,
  onReset,
  onToggleFavorite,
}: DhikrDetailProps) {
  const { t } = useLanguage();
  const targetCount = dhikr.count || 33;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.dhikr.close}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
          </div>
          
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xl sm:text-2xl font-bold mb-2 arabic-text" dir="rtl">{dhikr.arabic}</p>
            {dhikr.translation_en && (
              <p className="text-sm sm:text-base text-muted-foreground">{dhikr.translation_en}</p>
            )}
          </div>

          {(dhikr.source || dhikr.reference) && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4">
              {dhikr.source}
              {dhikr.reference && ` - ${dhikr.reference}`}
            </p>
          )}

          <div className="border-t border-border pt-3 sm:pt-4">
            <div className="text-center mb-3 sm:mb-4">
              <p className="text-4xl sm:text-5xl font-bold mb-1">{currentCount}</p>
              <p className="text-sm text-muted-foreground">
                / {targetCount}
              </p>
            </div>
            
            <div className="flex justify-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={onReset}
                className="h-10 sm:h-12 px-4 sm:px-6"
              >
                {t.dhikr.reset}
              </Button>
              <Button
                onClick={onIncrement}
                className="h-10 sm:h-12 px-6 sm:px-8 text-lg"
              >
                +1
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
