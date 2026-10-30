import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { auth, userService, type User } from '../../entities/user';
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

  /** Профиль создаётся императивно: страница отвечает за его размонтирование */
  private profile: Profile | null = null;

  protected componentDidMount(): void {
    this.loadProfile().catch((error: unknown) =>
      this.props.navigation.navigate(errorRouteFor(error))
    );
  }

  protected componentWillUnmount(): void {
    this.profile?.unmountComponent();
  }

  private async loadProfile(): Promise<void> {
    const { root } = this.refs;
    root.textContent = 'Загрузка профиля…';

    this.attachProfile(await userService.getProfile());
  }

  private attachProfile(user: User): void {
    const profile = new Profile(createProfileProps(user, this.actions()));

    this.profile?.unmountComponent();
    this.profile = profile;

    const profileElement = profile.element();
    if (profileElement) {
      this.refs.root.replaceChildren(profileElement);
    }
  }

  /** Ошибку запроса показывает форма, поэтому отсюда она не перехватывается и на 500 не ведёт */
  private actions(): ProfileActions {
    return {
      onSignOut: () => void this.signOut(),
      onSaveProfile: async (values) => {
        // значения после записи берутся из ответа сервера, а не из полей формы
        this.attachProfile(await userService.update(profilePayload(values)));
      },
      onSavePassword: (values) => userService.changePassword(passwordPayload(values)),
      onUploadAvatar: async (file) => {
        this.attachProfile(await userService.uploadAvatar(file));
      },
    };
  }

  /** Выход нужен и когда сервер не ответил: локальную сессию `auth` снимает в любом случае. */
  private async signOut(): Promise<void> {
    await auth.signOut().catch(() => undefined);
    this.props.navigation.navigate('/');
  }
}
