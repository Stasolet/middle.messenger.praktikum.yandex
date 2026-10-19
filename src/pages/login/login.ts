import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { validations } from '../../shared/lib';
import { auth } from '../../entities/user';
import { type FormProps, Form } from '../../widgets/form';
import type { PageProps } from '../../shared/router';
import template from './login.hbs';

interface LoginPageRefs extends BaseRefs {
  root: HTMLElement;
}

export class LoginPage extends BaseBlock<PageProps, LoginPageRefs> {
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
      title: 'Вход',
      buttonText: 'Авторизоваться',
      onSubmit: async (values) => {
        await auth.signIn({ login: values.login, password: values.password });
        this.props.navigation.navigate('/messenger');
      },
      fields: [
        {
          label: 'Логин',
          name: 'login',
          type: 'text',
          labelPosition: 'top',
          // формат и сложность проверяются только при регистрации:
          // существующие данные могут им не соответствовать
          validators: [validations.required],
        },
        {
          label: 'Пароль',
          name: 'password',
          type: 'password',
          labelPosition: 'top',
          validators: [validations.required],
        },
      ],
      footer: { text: 'Нет аккаунта?', link: '/sign-up' },
    };
  }
}
