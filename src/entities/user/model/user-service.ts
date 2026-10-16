import {
  usersApi,
  type PasswordUpdatePayload,
  type ProfileUpdatePayload,
} from '../../../shared/api';
import { toUser } from './user-mapper';
import { type User } from './user';

export const userService = {
  getProfile: async (): Promise<User> => toUser(await usersApi.getProfile()),

  update: async (payload: ProfileUpdatePayload): Promise<User> =>
    toUser(await usersApi.update(payload)),

  changePassword: (payload: PasswordUpdatePayload): Promise<void> =>
    usersApi.changePassword(payload),

  /** Замена аватара: удаления аватара API не знает, файл можно только заменить. */
  uploadAvatar: async (file: File): Promise<User> => toUser(await usersApi.uploadAvatar(file)),
};
