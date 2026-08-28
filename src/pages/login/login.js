import Handlebars from 'handlebars';
import formFieldTpl from '../../components/form-field/form-field.hbs?raw';
import formTpl from '../../layouts/form/form.hbs?raw';

import '../../layouts/form/form.scss';
import '../../components/form-field/form-field.scss';

Handlebars.registerPartial('form-field', formFieldTpl);

const formContents = {
  title: 'Вход',
  buttonText: 'Авторизоваться',
  action: '/pages/chat/chat.html',
  fields: [
    { label: 'Логин', name: 'login', type: 'text', labelPosition: 'top' },
    {
      label: 'Пароль',
      name: 'password',
      type: 'password',
      labelPosition: 'top',
    },
  ],
  footer: { text: 'Нет аккаунта?', link: '/pages/signin/signin.html' },
};

const compiledLoginForm = Handlebars.compile(formTpl);
document.getElementById('login-form').innerHTML = compiledLoginForm(formContents);
