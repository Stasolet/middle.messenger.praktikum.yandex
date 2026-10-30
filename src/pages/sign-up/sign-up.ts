import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { validations } from '../../shared/lib';
import { auth } from '../../entities/user';
import { type FormProps, Form } from '../../widgets/form';
import type { PageProps } from '../../shared/router';
import template from './sign-up.hbs';

interface SignUpPageRefs extends BaseRefs {
  root: HTMLElement;
}

export class SignUpPage extends BaseBlock<PageProps, SignUpPageRefs> {
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
      title: 'Регистрация',
      buttonText: 'Зарегистрироваться',
      onSubmit: async (values) => {
        await auth.signUp({
          email: values.email,
          login: values.login,
          first_name: values.first_name,
          second_name: values.second_name,
          phone: values.phone,
          password: values.password,
        });
        this.props.navigation.navigate('/messenger');
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
