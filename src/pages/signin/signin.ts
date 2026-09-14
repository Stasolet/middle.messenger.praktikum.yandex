import { Form, type FormProps } from '../../widgets/form';
import { initHbs } from '../../shared/lib';
initHbs();

const formContents: FormProps = {
  title: 'Регистрация',
  buttonText: 'Зарегистрироваться',
  action: '/pages/login/login.html',
  fields: [
    { label: 'Почта', name: 'email', type: 'email', labelPosition: 'top' },
    { label: 'Логин', name: 'login', type: 'text', labelPosition: 'top' },
    { label: 'Имя', name: 'first_name', type: 'text', labelPosition: 'top' },
    { label: 'Фамилия', name: 'second_name', type: 'text', labelPosition: 'top' },
    { label: 'Телефон', name: 'phone', type: 'tel', labelPosition: 'top' },
    {
      label: 'Пароль',
      name: 'password',
      type: 'password',
      labelPosition: 'top',
    },
    {
      label: 'Пароль (ещё раз)',
      name: 'passwordRepeat',
      type: 'password',
      labelPosition: 'top',
    },
  ],
  footer: { text: 'Войти?', link: '/pages/login/login.html' },
};

const form = new Form(formContents);
const formElement = form.element();
if (formElement) {
  document.getElementById('signin-form')!.appendChild(formElement);
}
