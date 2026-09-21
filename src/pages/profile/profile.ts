import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  type BaseRefs,
} from '../../shared/ui';
import { initHbs } from '../../shared/lib';
initHbs();
import '../../widgets/form/ui/form.scss';

import template from './profile.hbs';
import './profile.scss';

import '@fontsource-variable/material-symbols-outlined';

const profileMock = {
  email: 'stasolet@gmail.com',
  login: 'stasolet',
  name: 'Станислав',
  surname: 'Емельянов',
  nickName: 'Stasolet',
  phone: 88005553535,
};

interface ProfileProps extends BaseProps {
  title: string;
  fields: FormFieldProps[];
}

const profileContent: ProfileProps = {
  title: profileMock.nickName,
  fields: [
    {
      label: 'Почта',
      name: 'email',
      type: 'email',
      labelPosition: 'left',
      value: profileMock.email,
      enabled: false,
    },
    {
      label: 'Логин',
      name: 'login',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.login,
      enabled: false,
    },
    {
      label: 'Имя',
      name: 'first_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.name,
      enabled: false,
    },
    {
      label: 'Фамилия',
      name: 'second_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.surname,
      enabled: false,
    },
    {
      label: 'Имя в чате',
      name: 'display_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.nickName,
      enabled: false,
    },
    {
      label: 'Телефон',
      name: 'phone',
      type: 'tel',
      labelPosition: 'left',
      value: profileMock.phone,
      enabled: false,
    },
    {
      label: 'Старый пароль',
      name: 'old_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
      enabled: false,
    },
    {
      label: 'Новый пароль',
      name: 'new_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
      enabled: false,
    },
    {
      label: 'Повторите новый пароль',
      name: 'new_password_repeat',
      type: 'password',
      placeholder: '•••••••••••',
      labelPosition: 'left',
      enabled: false,
    },
  ],
};

interface ProfileRefs extends BaseRefs {
  avatarInput: HTMLElement;
  avatarButton: HTMLElement;
}
class Profile extends BaseBlock<ProfileProps, ProfileRefs> {
  protected template = template;
  protected events = {
    "click": (e: Event) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-action="change-avatar"]')) {
        const avatarInput = this.refs['avatarInput'] as HTMLInputElement;
        avatarInput.click();
      }
    }
  };
}
const profile = new Profile(profileContent);
const profileElement = profile.element();

if (profileElement) {
  document.getElementById('profile-container')!.appendChild(profileElement);
}
