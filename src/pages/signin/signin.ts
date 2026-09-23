import { Form, type FormProps } from '../../widgets/form';
import { initHbs, logFormValues, validations } from '../../shared/lib';
initHbs();

const formContents: FormProps = {
  title: 'Регистрация',
  buttonText: 'Зарегистрироваться',
  onSubmit: (values) => {
    logFormValues(values);
    window.location.assign('/pages/login/login.html');
  },
  onValidate: (values): Record<string, string> =>
    values.password === values.passwordRepeat ? {} : { passwordRepeat: 'Пароли не совпадают' },
  fields: [
    {
      label: 'Почта',
      name: 'email',
      type: 'email',
      labelPosition: 'top',
      validators: [validations.required, validations.email],
    },
    {
      label: 'Логин',
      name: 'login',
      type: 'text',
      labelPosition: 'top',
      validators: [validations.required, validations.login],
    },
    {
      label: 'Имя',
      name: 'first_name',
      type: 'text',
      labelPosition: 'top',
      validators: [validations.required, validations.name],
    },
    {
      label: 'Фамилия',
      name: 'second_name',
      type: 'text',
      labelPosition: 'top',
      validators: [validations.required, validations.name],
    },
    {
      label: 'Телефон',
      name: 'phone',
      type: 'tel',
      labelPosition: 'top',
      validators: [validations.required, validations.phone],
    },
    {
      label: 'Пароль',
      name: 'password',
      type: 'password',
      labelPosition: 'top',
      validators: [validations.required, validations.password],
    },
    {
      label: 'Пароль (ещё раз)',
      name: 'passwordRepeat',
      type: 'password',
      labelPosition: 'top',
      validators: [validations.required, validations.password],
    },
  ],
  footer: { text: 'Войти?', link: '/pages/login/login.html' },
};

const form = new Form(formContents);
const formElement = form.element();
if (formElement) {
  document.getElementById('signin-form')!.appendChild(formElement);
}
