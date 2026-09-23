import { userService } from '../../entities/user';
import { initHbs, validations } from '../../shared/lib';
import { Profile, type ProfileProps } from './ui/profile';

initHbs();

import '@fontsource-variable/material-symbols-outlined';

const user = userService.getProfile();

const profileContent: ProfileProps = {
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
};

const profile = new Profile(profileContent);
const profileElement = profile.element();

if (profileElement) {
  document.getElementById('profile-container')!.appendChild(profileElement);
}
