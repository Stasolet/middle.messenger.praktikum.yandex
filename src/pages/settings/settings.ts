import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { auth, userService } from '../../entities/user';
import { errorRouteFor, type PageProps } from '../../shared/router';
import { type FormValues } from '../../shared/lib';
import { type PasswordUpdatePayload, type ProfileUpdatePayload } from '../../shared/api';
import { createProfileProps, Profile, type ProfileActions } from './ui/profile';
import template from './settings.hbs';

interface SettingsPageRefs extends BaseRefs {
  root: HTMLElement;
}

const profilePayload = (values: FormValues): ProfileUpdatePayload => ({
  first_name: values.first_name,
  second_name: values.second_name,
  display_name: values.display_name,
  login: values.login,
  email: values.email,
  phone: values.phone,
});

const passwordPayload = (values: FormValues): PasswordUpdatePayload => ({
  oldPassword: values.old_password,
  newPassword: values.new_password,
});

export class SettingsPage extends BaseBlock<PageProps, SettingsPageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    this.renderProfile().catch((error: unknown) =>
      this.props.navigation.navigate(errorRouteFor(error))
    );
  }

  private async renderProfile(): Promise<void> {
    const { root } = this.refs;
    root.textContent = 'Загрузка профиля…';

    const profile = new Profile(createProfileProps(await userService.getProfile(), this.actions()));

    const profileElement = profile.element();
    if (profileElement) {
      root.replaceChildren(profileElement);
    }
  }

  /** Ошибку запроса показывает форма, поэтому отсюда она не перехватывается и на 500 не ведёт */
  private actions(): ProfileActions {
    return {
      onSignOut: () => void this.signOut(),
      onSaveProfile: async (values) => {
        await userService.update(profilePayload(values));
        // значения после записи берутся с сервера, а не из полей формы
        await this.renderProfile();
      },
      onSavePassword: (values) => userService.changePassword(passwordPayload(values)),
      onUploadAvatar: async (file) => {
        await userService.uploadAvatar(file);
        await this.renderProfile();
      },
    };
  }

  /** Выход нужен и когда сервер не ответил: локальную сессию `auth` снимает в любом случае. */
  private async signOut(): Promise<void> {
    await auth.signOut().catch(() => undefined);
    this.props.navigation.navigate('/');
  }
}
