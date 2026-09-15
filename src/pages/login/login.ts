import { Form, type FormProps } from '../../widgets/form';
import { initHbs } from '../../shared/lib';
initHbs();

const formContents: FormProps = {
  title: 'Вход',
  buttonText: 'Авторизоваться',
  action: '/pages/chat/chat.html',
  fields: [
    { label: 'Логин', name: 'login', type: 'text', labelPosition: 'top', ref: 'login' },
    {
      label: 'Пароль',
      name: 'password',
      type: 'password',
      labelPosition: 'top',
      ref: 'password',
    },
  ],
  footer: { text: 'Нет аккаунта?', link: '/pages/signin/signin.html' },
};

const form = new Form(formContents);
const formElement = form.element();
if (formElement) {
  document.getElementById('login-form')!.appendChild(formElement);
}
