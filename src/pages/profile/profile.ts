import Handlebars from 'handlebars';
import formFieldTpl from '../../shared/ui/form-field/form-field.hbs';
import profileFormTpl from './profile.hbs';

import '../../widgets/form/ui/form.scss';
import '../../shared/ui/form-field/form-field.scss';
import './profile.scss';
import '@fontsource-variable/material-symbols-outlined';

Handlebars.registerPartial('form-field', formFieldTpl);

const profileMock = {
  email: 'stasolet@gmail.com',
  login: 'stasolet',
  name: 'Станислав',
  surname: 'Емельянов',
  nickName: 'Stasolet',
  phone: 88005553535,
};

const profileContent = {
  title: profileMock.nickName,
  fields: [
    {
      label: 'Почта',
      name: 'email',
      type: 'email',
      labelPosition: 'left',
      value: profileMock.email,
    },
    {
      label: 'Логин',
      name: 'login',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.login,
    },
    {
      label: 'Имя',
      name: 'first_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.name,
    },
    {
      label: 'Фамилия',
      name: 'second_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.surname,
    },
    {
      label: 'Имя в чате',
      name: 'display_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.nickName,
    },
    {
      label: 'Телефон',
      name: 'phone',
      type: 'tel',
      labelPosition: 'left',
      value: profileMock.phone,
    },
    {
      label: 'Старый пароль',
      name: 'old_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
    },
    {
      label: 'Новый пароль',
      name: 'new_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
    },
    {
      label: 'Повторите новый пароль',
      name: 'new_password_repeat',
      type: 'password',
      placeholder: '•••••••••••',
      labelPosition: 'left',
    },
  ],
};

interface Enableble extends Element {
  disabled: boolean;
}

const compiledProfileForm = Handlebars.compile(profileFormTpl);
document.getElementById('profile-container')!.innerHTML = compiledProfileForm(profileContent);
const elements: NodeListOf<Enableble> = document.querySelectorAll('.form-field__input');
elements.forEach((element) => {
  element.disabled = true;
});

const avatarInput = document.getElementById('avatar-input')!;
document.querySelector('.load-photo')!.addEventListener('click', () => {
  avatarInput.click();
});
