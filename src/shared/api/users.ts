import { http } from './http';
import {
  type ChatUserDTO,
  type CreatedIdDTO,
  type PasswordUpdatePayload,
  type ProfileUpdatePayload,
  type SignInPayload,
  type SignUpPayload,
  type UserDTO,
} from './dto';

export const usersApi = {
  signUp: (payload: SignUpPayload): Promise<CreatedIdDTO> =>
    http.post<CreatedIdDTO>('/auth/signup', payload),

  login: (payload: SignInPayload): Promise<void> => http.post<void>('/auth/signin', payload),

  logout: (): Promise<void> => http.post<void>('/auth/logout', {}),

  /** Профиль владельца сессии; 401, если сессии нет. */
  getProfile: (): Promise<UserDTO> => http.get<UserDTO>('/auth/user'),

  update: (payload: ProfileUpdatePayload): Promise<UserDTO> =>
    http.put<UserDTO>('/user/profile', payload),

  changePassword: (payload: PasswordUpdatePayload): Promise<void> =>
    http.put<void>('/user/password', payload),

  uploadAvatar: (file: File): Promise<UserDTO> => {
    const form = new FormData();
    form.append('avatar', file);

    return http.put<UserDTO>('/user/profile/avatar', form);
  },

  search: (login: string): Promise<ChatUserDTO[]> =>
    http.post<ChatUserDTO[]>('/user/search', { login }),
};
