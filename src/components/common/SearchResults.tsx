import type { Content } from "@/lib/types";

interface SearchResultsProps {
  results: Content[];
  onSelect: (content: Content) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-card p-3 sm:p-4">
      <h2 className="font-semibold mb-2 text-sm sm:text-base">Search Results ({results.length})</h2>
      <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => onSelect(result)}
            className="p-2 rounded-md hover:bg-secondary cursor-pointer"
          >
            <p className="font-medium text-base sm:text-lg truncate" dir="rtl">{result.arabic}</p>
            {result.translation_en && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{result.translation_en}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
