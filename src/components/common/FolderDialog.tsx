import { useState, useEffect } from "react";
import { Folder, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Folder as FolderType } from "@/lib/types";
import * as api from "@/hooks/useApi";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFolder: (folderId: number) => void;
}

export function FolderDialog({
  open,
  onOpenChange,
  onSelectFolder,
}: FolderDialogProps) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open]);

  async function loadFolders() {
    try {
      const f = await api.getFolders();
      setFolders(f);
    } catch (e) {
      console.error("Failed to load folders:", e);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      const folder = await api.createFolder(newFolderName.trim());
      setFolders([...folders, folder]);
      setNewFolderName("");
      onSelectFolder(folder.id);
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to create folder:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectFolder(folderId: number) {
    onSelectFolder(folderId);
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Save to Folder</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleSelectFolder(folder.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
            >
              <Folder className="h-5 w-5 text-muted-foreground" />
              <span>{folder.name}</span>
            </button>
          ))}
          {folders.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No folders yet
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
