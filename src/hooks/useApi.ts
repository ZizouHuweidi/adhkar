import { invoke } from "@tauri-apps/api/core";
import type {
  Category,
  Content,
  UserProgress,
  NotificationLog,
  Setting,
  Folder,
} from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  return invoke("get_categories");
}

export async function getDhikrByCategory(
  categoryId: number,
): Promise<Content[]> {
  return invoke("get_dhikr_by_category", { categoryId });
}

export async function getAllDhikr(): Promise<Content[]> {
  return invoke("get_all_dhikr");
}

export async function searchDhikr(query: string): Promise<Content[]> {
  return invoke("search_dhikr", { query });
}

export async function getFavorites(): Promise<Content[]> {
  return invoke("get_favorites");
}

export async function addFavorite(contentId: number): Promise<void> {
  return invoke("add_favorite", { contentId });
}

export async function removeFavorite(contentId: number): Promise<void> {
  return invoke("remove_favorite", { contentId });
}

export async function isFavorite(contentId: number): Promise<boolean> {
  return invoke("is_favorite", { contentId });
}

export async function getFolders(): Promise<Folder[]> {
  return invoke("get_folders");
}

export async function createFolder(name: string): Promise<Folder> {
  return invoke("create_folder", { name });
}

export async function deleteFolder(id: number): Promise<void> {
  return invoke("delete_folder", { id });
}

export async function addFavoriteToFolder(
  contentId: number,
  folderId: number,
): Promise<void> {
  return invoke("add_favorite_to_folder", { contentId, folderId });
}

export async function getFavoritesByFolder(
  folderId: number,
): Promise<Content[]> {
  return invoke("get_favorites_by_folder", { folderId });
}

export async function getFavoritesWithFolders(): Promise<
  [Folder, Content[]][]
> {
  return invoke("get_favorites_with_folders");
}

export async function createFolderForCategory(
  categoryId: number,
): Promise<Folder> {
  return invoke("create_folder_for_category", { categoryId });
}

export async function isCategoryFavorite(categoryId: number): Promise<boolean> {
  return invoke("is_category_favorite", { categoryId });
}

export async function removeCategoryFavorite(categoryId: number): Promise<void> {
  return invoke("remove_category_favorite", { categoryId });
}

export async function getUserProgress(
  contentId: number,
): Promise<UserProgress | null> {
  return invoke("get_user_progress", { contentId });
}

export async function updateProgress(
  contentId: number,
  currentCount: number,
  targetCount: number,
): Promise<void> {
  return invoke("update_progress", { contentId, currentCount, targetCount });
}

export async function getNotificationHistory(
  limit: number = 50,
): Promise<NotificationLog[]> {
  return invoke("get_notification_history", { limit });
}

export async function addNotificationLog(
  contentId: number,
  action: string,
): Promise<number> {
  return invoke("add_notification_log", { contentId, action });
}

export async function getSetting(key: string): Promise<string | null> {
  return invoke("get_setting", { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke("set_setting", { key, value });
}

export async function getAllSettings(): Promise<Setting[]> {
  return invoke("get_all_settings");
}
