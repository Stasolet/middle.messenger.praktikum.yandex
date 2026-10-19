import { initHbs } from './shared/lib';
import { http } from './shared/api';
import { Router } from './shared/router';
import { auth } from './entities/user';
import { LoginPage } from './pages/login/login';
import { SignUpPage } from './pages/sign-up/sign-up';
import { SettingsPage } from './pages/settings/settings';
import { MessengerPage } from './pages/messenger/messenger';
import { Error404Page } from './pages/error_404/error_404';
import { Error500Page } from './pages/error_500/error_500';

initHbs();

http.onUnauthorized = () => auth.invalidate();

const appContainer = document.getElementById('app');

if (!(appContainer instanceof HTMLElement)) {
  throw new Error('Контейнер #app не найден в index.html');
}

/** Требуют сессию; остальные пути гость открывает свободно, включая неизвестные — там 404 от роутера. */
const PROTECTED_PATH = /^\/(settings|messenger)(\/|$)/;

/** Вход и регистрация не нужны тому, кто уже вошёл. */
const LOGIN_PATHS = new Set(['/', '/sign-up']);

function authGuard(pathname: string): string | null {
  if (auth.isAuthorized()) {
    return LOGIN_PATHS.has(pathname) ? '/messenger' : null;
  }

  return PROTECTED_PATH.test(pathname) ? '/' : null;
}

const router = new Router(appContainer, { guard: authGuard });

router
  .add({ path: '/', Page: LoginPage })
  .add({ path: '/sign-up', Page: SignUpPage })
  .add({ path: '/settings', Page: SettingsPage })
  .add({ path: '/messenger', Page: MessengerPage })
  .add({ path: '/messenger/:chatId', Page: MessengerPage })
  .add({ path: '/404', Page: Error404Page })
  .add({ path: '/500', Page: Error500Page })
  .notFound({ path: '/404', Page: Error404Page });

// Авторизованность известна только после GET /auth/user, поэтому первый рендер — после restore().
void auth.restore().then(() => router.start());
