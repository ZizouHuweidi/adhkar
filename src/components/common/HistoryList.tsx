import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationLog } from "@/lib/types";

interface HistoryListProps {
  history: NotificationLog[];
}

export function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No history yet</p>
        <p className="text-sm">Your dhikr activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {entry.action === "viewed" ? "Viewed" : entry.action}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.shown_at).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
