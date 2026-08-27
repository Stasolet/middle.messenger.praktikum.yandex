import Handlebars from 'handlebars';
import formFieldTpl from '../../components/form-field/form-field.hbs?raw';
import formTpl from './profile.hbs?raw';

import '../../layouts/form/form.scss';
import '../../components/form-field/form-field.scss';
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
      name: 'name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.name,
    },
    {
      label: 'Фамилия',
      name: 'surname',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.surname,
    },
    {
      label: 'Имя в чате',
      name: 'nickName',
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
  ],
};

const compiledLoginForm = Handlebars.compile(formTpl);

document.getElementById('profile-container').innerHTML = compiledLoginForm(profileContent);
const elements = document.querySelectorAll('.form-field__input');
elements.forEach((element) => {
  element.disabled = true;
});
