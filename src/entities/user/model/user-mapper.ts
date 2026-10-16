import { toAvatarUrl, type UserDTO } from '../../../shared/api';
import { type User } from './user';

export const toUser = (dto: UserDTO): User => ({
  id: dto.id,
  login: dto.login,
  email: dto.email,
  name: dto.first_name,
  surname: dto.second_name,
  nickName: dto.display_name || dto.first_name,
  phone: dto.phone,
  avatarUrl: toAvatarUrl(dto.avatar),
});
