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

  /** Форма создана императивно: страница отвечает за её размонтирование */
  private form: Form | null = null;

  protected componentDidMount(): void {
    this.form = new Form(this.buildFormProps());

    const formElement = this.form.element();
    if (formElement) {
      this.refs.root.appendChild(formElement);
    }
  }

  protected componentWillUnmount(): void {
    this.form?.unmountComponent();
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
