import { usersApi } from '../../../shared/api';
import { type User } from './user';

export const userService = {
  getProfile(): User {
    const raw = usersApi.profile();

    return { ...raw, phone: String(raw.phone) };
  },
};
