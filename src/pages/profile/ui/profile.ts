import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  type BaseRefs,
  type FormField,
  isFormField,
} from '../../../shared/ui';
import { collectFormValues, logFormValues, validations } from '../../../shared/lib';
import { type User } from '../../../entities/user';
import '../../../widgets/form/ui/form.scss';

import template from './profile.hbs';
import './profile.scss';

export interface ProfileProps extends BaseProps {
  title: string;
  fields: FormFieldProps[];
}

interface ProfileRefs extends BaseRefs {
  avatarInput: HTMLInputElement;
}

export class Profile extends BaseBlock<ProfileProps, ProfileRefs> {
  protected template = template;

  /** Все поля настроек, отрендеренные из props.fields */
  protected get fields(): FormField[] {
    return this.children.filter(isFormField);
  }

  protected events = {
    click: (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-action="change-avatar"]')) {
        const avatarInput = this.refs['avatarInput'];
        avatarInput.click();
      }
    },
    submit: (e: Event) => {
      e.preventDefault();

      const root = this.element();
      if (!(root instanceof HTMLFormElement)) {
        return;
      }

      const fieldErrors = this.fields.map((field) => field.validate());
      if (fieldErrors.some((error) => error !== null)) {
        return;
      }

      logFormValues(collectFormValues(root));
    },
  };
}

/** Собирает props вьюхи из профиля пользователя */
export const createProfileProps = (user: User): ProfileProps => ({
  title: user.nickName,
  fields: [
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
    {
      label: 'Старый пароль',
      name: 'old_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
      enabled: false,
      validators: [validations.required, validations.password],
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
