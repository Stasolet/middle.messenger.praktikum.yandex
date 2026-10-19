import {
  TransportError,
  usersApi,
  type SignInPayload,
  type SignUpPayload,
} from '../../../shared/api';
import { toUser } from './user-mapper';
import { type User } from './user';

/**
 * Сессия живёт в cookie браузера, своего токена у приложения нет: авторизованность
 * можно только восстановить запросом профиля. Поэтому вход в приложение делает
 * `restore()` до старта роутера — middleware роутера читает статус синхронно.
 */
class Auth {
  private currentUser: User | null = null;

  get user(): User | null {
    return this.currentUser;
  }

  isAuthorized(): boolean {
    return this.currentUser !== null;
  }

  /** Нет профиля (401) или нет связи — считаем пользователя гостем. */
  async restore(): Promise<User | null> {
    try {
      this.currentUser = toUser(await usersApi.getProfile());
    } catch {
      this.currentUser = null;
    }

    return this.currentUser;
  }

  /**
   * Вход не считается успешным, пока профиль не подтвердил сессию: без cookie
   * следующий запрос ушёл бы гостем, и страница вернула бы пользователя назад.
   */
  async signIn(payload: SignInPayload): Promise<User> {
    await usersApi.login(payload);

    const user = await this.restore();
    if (!user) {
      throw new TransportError('Сервер не подтвердил вход');
    }

    return user;
  }

  /** Сессию даёт вход, поэтому после регистрации входим теми же данными. */
  async signUp(payload: SignUpPayload): Promise<User> {
    await usersApi.signUp(payload);

    return this.signIn({ login: payload.login, password: payload.password });
  }

  async signOut(): Promise<void> {
    try {
      await usersApi.logout();
    } finally {
      this.currentUser = null;
    }
  }

  /** Сброс при 401 «в полёте»: иначе guard сочтёт сессию живой и вернёт `/` на `/messenger` */
  invalidate(): void {
    this.currentUser = null;
  }
}

export const auth = new Auth();
