import { Form, type FormProps } from '../../widgets/form';
import { initHbs, logFormValues, validations } from '../../shared/lib';
initHbs();

const formContents: FormProps = {
  title: 'Вход',
  buttonText: 'Авторизоваться',
  onSubmit: (values) => {
    logFormValues(values);
    window.location.href = '/pages/chat/chat.html';
  },
  fields: [
    {
      label: 'Логин',
      name: 'login',
      type: 'text',
      labelPosition: 'top',
      validators: [validations.required, validations.login],
    },
    {
      label: 'Пароль',
      name: 'password',
      type: 'password',
      labelPosition: 'top',
      validators: [validations.required, validations.password],
    },
  ],
  footer: { text: 'Нет аккаунта?', link: '/pages/signin/signin.html' },
};

const form = new Form(formContents);
const formElement = form.element();
if (formElement) {
  document.getElementById('login-form')!.appendChild(formElement);
}
