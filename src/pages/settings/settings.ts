import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { auth, userService } from '../../entities/user';
import { errorRouteFor, type PageProps } from '../../shared/router';
import { createProfileProps, Profile } from './ui/profile';
import template from './settings.hbs';

interface SettingsPageRefs extends BaseRefs {
  root: HTMLElement;
}

export class SettingsPage extends BaseBlock<PageProps, SettingsPageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    void this.renderProfile();
  }

  private async renderProfile(): Promise<void> {
    const { root } = this.refs;
    root.textContent = 'Загрузка профиля…';

    try {
      const profile = new Profile(
        createProfileProps(await userService.getProfile(), () => void this.signOut())
      );

      const profileElement = profile.element();
      if (profileElement) {
        root.replaceChildren(profileElement);
      }
    } catch (error) {
      this.props.navigation.navigate(errorRouteFor(error));
    }
  }

  /** Выход нужен и когда сервер не ответил: локальную сессию `auth` снимает в любом случае. */
  private async signOut(): Promise<void> {
    await auth.signOut().catch(() => undefined);
    this.props.navigation.navigate('/');
  }
}
