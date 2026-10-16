import { API_BASE_URL } from './http';

/** Основа для URL загруженных файлов: API отдаёт аватары относительным путём. */
export const RESOURCES_URL = `${API_BASE_URL}/resources`;

export const toAvatarUrl = (avatar: string | null): string | null => {
  if (!avatar) {
    return null;
  }

  if (/^https?:\/\//.test(avatar)) {
    return avatar;
  }

  return `${RESOURCES_URL}/${avatar.replace(/^\/+/, '')}`;
};
