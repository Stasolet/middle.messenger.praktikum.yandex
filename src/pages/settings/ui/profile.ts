import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  type BaseRefs,
  type FormField,
  isFormField,
} from '../../../shared/ui';
import { collectFormValues, validations, type SubmitHandler } from '../../../shared/lib';
import { errorMessage } from '../../../shared/api';
import { type User } from '../../../entities/user';

import template from './profile.hbs';
import './profile.scss';

/** Что показывают кнопки футера: только просмотр, правку данных или правку пароля */
export type ProfileMode = 'view' | 'profile' | 'password';

export interface ProfileProps extends BaseProps {
  title: string;
  avatarUrl: string | null;
  profileFields: FormFieldProps[];
  passwordFields: FormFieldProps[];
  /** Запросы решает страница — вьюха только просит */
  onSignOut?: () => void;
  onSaveProfile?: SubmitHandler;
  onSavePassword?: SubmitHandler;
  onUploadAvatar?: (file: File) => Promise<void>;
}

interface ProfileRefs extends BaseRefs {
  avatarInput: HTMLInputElement;
  profileFields: HTMLElement;
  passwordFields: HTMLElement;
  error: HTMLElement;
  editProfileItem: HTMLElement;
  editPasswordItem: HTMLElement;
  saveItem: HTMLElement;
  cancelItem: HTMLElement;
}

export class Profile extends BaseBlock<ProfileProps, ProfileRefs> {
  protected template = template;

  private mode: ProfileMode = 'view';

  /** Запрос в полёте: повторный submit до ответа сервера не нужен */
  private pending = false;

  /** Все поля настроек, отрендеренные из props */
  protected get fields(): FormField[] {
    return this.children.filter(isFormField);
  }

  /** Поля той группы, которая правится в текущем режиме */
  private modeFields(): FormField[] {
    const group = this.mode === 'password' ? this.props.passwordFields : this.props.profileFields;
    const names = new Set(group.map((field) => field.name));

    return this.fields.filter((field) => names.has(field.name));
  }

  private fieldByName(name: string): FormField | undefined {
    return this.fields.find((field) => field.name === name);
  }

  private setGroupEnabled(group: HTMLElement, enabled: boolean): void {
    for (const input of Array.from(group.querySelectorAll<HTMLInputElement>('input'))) {
      input.disabled = !enabled;
    }
  }

  private setItemHidden(item: HTMLElement, hidden: boolean): void {
    item.hidden = hidden;
  }

  private setMode(mode: ProfileMode): void {
    this.mode = mode;

    const editing = mode !== 'view';
    const {
      profileFields,
      passwordFields,
      editProfileItem,
      editPasswordItem,
      saveItem,
      cancelItem,
    } = this.refs;

    profileFields.hidden = mode === 'password';
    passwordFields.hidden = mode !== 'password';
    this.setGroupEnabled(profileFields, mode === 'profile');
    this.setGroupEnabled(passwordFields, mode === 'password');

    this.setItemHidden(editProfileItem, editing);
    this.setItemHidden(editPasswordItem, editing);
    this.setItemHidden(saveItem, !editing);
    this.setItemHidden(cancelItem, !editing);

    this.clearError();
  }

  /** Значения из props — те, что пришли с сервера; отмена и успешная запись к ним возвращают форму */
  private restoreValues(): void {
    const root = this.element();
    if (!(root instanceof HTMLFormElement)) {
      return;
    }

    const source = [...this.props.profileFields, ...this.props.passwordFields];
    for (const field of source) {
      const input = root.querySelector<HTMLInputElement>(`[name="${field.name}"]`);
      if (input) {
        input.value = String(field.value ?? '');
      }
      this.fieldByName(field.name)?.setError('');
    }
  }

  private setPending(pending: boolean): void {
    this.pending = pending;

    const button = this.element()?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = pending;
    }

    // второй файл, выбранный во время загрузки, дал бы второй запрос
    this.refs.avatarInput.disabled = pending;
  }

  private showError(error: unknown): void {
    const node = this.refs.error;
    node.textContent = errorMessage(error);
    node.hidden = false;
  }

  private clearError(): void {
    const node = this.refs.error;
    node.textContent = '';
    node.hidden = true;
  }

  protected events = {
    click: (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-action="change-avatar"]')) {
        this.refs.avatarInput.click();
        return;
      }

      if (target.closest('[data-action="edit-profile"]')) {
        this.setMode('profile');
        return;
      }

      if (target.closest('[data-action="edit-password"]')) {
        this.setMode('password');
        return;
      }

      if (target.closest('[data-action="cancel"]')) {
        this.setMode('view');
        this.restoreValues();
        return;
      }

      if (target.closest('[data-action="sign-out"]')) {
        this.props.onSignOut?.();
      }
    },

    change: (e: Event) => {
      const input = e.target;
      if (!(input instanceof HTMLInputElement) || input.name !== 'avatar') {
        return;
      }

      const file = input.files?.[0];
      // сброс: повторный выбор того же файла должен снова дать change
      input.value = '';

      if (!file || this.pending) {
        return;
      }

      this.clearError();
      this.setPending(true);
      Promise.resolve(this.props.onUploadAvatar?.(file))
        .catch((error: unknown) => this.showError(error))
        .finally(() => this.setPending(false));
    },

    submit: (e: Event) => {
      e.preventDefault();

      const root = this.element();
      if (!(root instanceof HTMLFormElement) || this.pending || this.mode === 'view') {
        return;
      }

      const fields = this.modeFields();
      const values = collectFormValues(root);
      const hasFieldErrors = fields
        .map((field) => field.validate())
        .some((error) => error !== null);

      if (hasFieldErrors) {
        return;
      }

      // после возврата по ошибкам полей: иначе при обоих пустых паролях затрём «Поле обязательно»
      if (this.mode === 'password' && values.new_password !== values.new_password_repeat) {
        this.fieldByName('new_password_repeat')?.setError('Пароли не совпадают');
        return;
      }

      this.clearError();
      const send =
        this.mode === 'password'
          ? this.props.onSavePassword?.(values)
          : this.props.onSaveProfile?.(values);

      this.setPending(true);
      Promise.resolve(send)
        .then(() => {
          this.setMode('view');
          this.restoreValues();
        })
        .catch((error: unknown) => this.showError(error))
        .finally(() => this.setPending(false));
    },
  };
}

export interface ProfileActions {
  onSignOut: () => void;
  onSaveProfile: SubmitHandler;
  onSavePassword: SubmitHandler;
  onUploadAvatar: (file: File) => Promise<void>;
}

/** Собирает props вьюхи из профиля пользователя; поля изначально только для чтения */
export const createProfileProps = (user: User, actions: ProfileActions): ProfileProps => ({
  title: user.nickName,
  avatarUrl: user.avatarUrl,
  ...actions,
  profileFields: [
    {
      label: 'Почта',
      name: 'email',
      type: 'email',
      labelPosition: 'left',
      value: user.email,
      validators: [validations.required, validations.email],
      enabled: false,
    },
    {
      label: 'Логин',
      name: 'login',
      type: 'text',
      labelPosition: 'left',
      value: user.login,
      enabled: false,
      validators: [validations.required, validations.login],
    },
    {
      label: 'Имя',
      name: 'first_name',
      type: 'text',
      labelPosition: 'left',
      value: user.name,
      enabled: false,
      validators: [validations.required, validations.name],
    },
    {
      label: 'Фамилия',
      name: 'second_name',
      type: 'text',
      labelPosition: 'left',
      value: user.surname,
      enabled: false,
      validators: [validations.required, validations.name],
    },
    {
      label: 'Имя в чате',
      name: 'display_name',
      type: 'text',
      labelPosition: 'left',
      value: user.nickName,
      enabled: false,
      validators: [validations.required, validations.name],
    },
    {
      label: 'Телефон',
      name: 'phone',
      type: 'tel',
      labelPosition: 'left',
      value: user.phone,
      enabled: false,
      validators: [validations.required, validations.phone],
    },
  ],
  passwordFields: [
    {
      label: 'Старый пароль',
      name: 'old_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
      enabled: false,
      // формат и сложность проверяются только для новых паролей:
      // существующий мог быть задан по иным правилам
      validators: [validations.required],
    },
    {
      label: 'Новый пароль',
      name: 'new_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
      enabled: false,
      validators: [validations.required, validations.password],
    },
    {
      label: 'Повторите новый пароль',
      name: 'new_password_repeat',
      type: 'password',
      placeholder: '•••••••••••',
      labelPosition: 'left',
      enabled: false,
      validators: [validations.required, validations.password],
    },
  ],
});
