import { initHbs } from './shared/lib';
import { Router } from './shared/router';
import { LoginPage } from './pages/login/login';
import { SignUpPage } from './pages/sign-up/sign-up';
import { SettingsPage } from './pages/settings/settings';
import { MessengerPage } from './pages/messenger/messenger';
import { Error404Page } from './pages/error_404/error_404';
import { Error500Page } from './pages/error_500/error_500';

initHbs();

const appContainer = document.getElementById('app');

if (!(appContainer instanceof HTMLElement)) {
  throw new Error('Контейнер #app не найден в index.html');
}

const router = new Router(appContainer);

router
  .add({ path: '/', Page: LoginPage })
  .add({ path: '/sign-up', Page: SignUpPage })
  .add({ path: '/settings', Page: SettingsPage })
  .add({ path: '/messenger', Page: MessengerPage })
  .add({ path: '/404', Page: Error404Page })
  .add({ path: '/500', Page: Error500Page })
  .notFound({ path: '/404', Page: Error404Page })
  .start();
