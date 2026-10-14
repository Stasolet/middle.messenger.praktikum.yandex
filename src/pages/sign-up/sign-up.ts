import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { validations } from '../../shared/lib';
import { type FormProps, Form } from '../../widgets/form';
import type { PageProps } from '../../shared/router';
import template from './sign-up.hbs';

interface SignUpPageRefs extends BaseRefs {
  root: HTMLElement;
}

export class SignUpPage extends BaseBlock<PageProps, SignUpPageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    const form = new Form(this.buildFormProps());

    const formElement = form.element();
    if (formElement) {
      this.refs.root.appendChild(formElement);
    }
  }

  private buildFormProps(): FormProps {
    return {
      title: 'Регистрация',
      buttonText: 'Зарегистрироваться',
      onSubmit: () => {
        this.props.navigation.navigate('/');
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
      footer: { text: 'Войти?', link: '/' },
    };
  }
}
