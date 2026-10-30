/**
 * Контракт Практикум API: имена полей — snake_case, как их отдаёт сервер.
 * За пределы `shared/api` эти типы не выходят — наружу идут доменные `User` и `Chat`.
 */

export type UserDTO = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  /** Путь относительно `/resources` либо уже абсолютный URL. */
  avatar: string | null;
};

/** Пользователь чата: он же участник списка `GET /chats/:id/users`, с ролью. */
export type ChatUserDTO = UserDTO & { role: string };

export type LastMessageDTO = {
  user: Pick<UserDTO, 'id' | 'first_name' | 'second_name' | 'display_name' | 'avatar'>;
  time: string | number;
  content: string;
};

export type ChatDTO = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  /** `null` у пустого чата. */
  last_message: LastMessageDTO | null;
};

/** Ответ на создание пользователя и чата — только новый id. */
export type CreatedIdDTO = { id: number };

// `type`, а не `interface`: индексная сигнатура выводится только у type,
// иначе payload не проходит как тело запроса `HttpBody`.
export type SignUpPayload = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export type SignInPayload = {
  login: string;
  password: string;
};

export type ProfileUpdatePayload = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

export type PasswordUpdatePayload = {
  oldPassword: string;
  newPassword: string;
};
