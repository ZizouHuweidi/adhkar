import { useState, useEffect } from "react";
import { Heart, Folder, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Content, Folder as FolderType } from "@/lib/types";
import * as api from "@/hooks/useApi";

interface FavoritesListProps {
  onToggleFavorite: (content: Content) => void;
  onRemoveFolder: (folderId: number) => void;
}

export function FavoritesList({ onToggleFavorite, onRemoveFolder }: FavoritesListProps) {
  const [favoritesWithFolders, setFavoritesWithFolders] = useState<[FolderType, Content[]][]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFavoritesWithFolders();
  }, []);

  async function loadFavoritesWithFolders() {
    try {
      setLoading(true);
      const data = await api.getFavoritesWithFolders();
      setFavoritesWithFolders(data);
      setExpandedFolders(new Set(data.map(([f]) => f.id)));
    } catch (e) {
      console.error("Failed to load favorites:", e);
    } finally {
      setLoading(false);
    }
  }

  function toggleFolder(folderId: number) {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (favoritesWithFolders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No favorites yet</p>
        <p className="text-sm">Tap the heart icon on any dhikr to add it to favorites</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {favoritesWithFolders.map(([folder, contents]) => (
        <div key={folder.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <span className="font-medium">{folder.name}</span>
              <span className="text-sm text-muted-foreground">({contents.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFolder(folder.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </button>
          
          {expandedFolders.has(folder.id) && (
            <div className="space-y-2 p-3">
              {contents.map((fav) => (
                <Card key={fav.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg sm:text-xl font-medium truncate" dir="rtl">{fav.arabic}</p>
                        {fav.translation_en && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{fav.translation_en}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(fav); }}
                      >
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
