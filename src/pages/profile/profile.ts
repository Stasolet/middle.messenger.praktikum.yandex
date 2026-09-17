import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  type BaseEventsMap,
  type BaseRefs,
} from '../../shared/ui';
import { initHbs } from '../../shared/lib';
initHbs();
import '../../widgets/form/ui/form.scss';

import template from './profile.hbs';
import './profile.scss';

import '@fontsource-variable/material-symbols-outlined';

const profileMock = {
  email: 'stasolet@gmail.com',
  login: 'stasolet',
  name: 'Станислав',
  surname: 'Емельянов',
  nickName: 'Stasolet',
  phone: 88005553535,
};

interface ProfileProps extends BaseProps {
  title: string;
  fields: FormFieldProps[];
}

const profileContent: ProfileProps = {
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
      name: 'first_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.name,
    },
    {
      label: 'Фамилия',
      name: 'second_name',
      type: 'text',
      labelPosition: 'left',
      value: profileMock.surname,
    },
    {
      label: 'Имя в чате',
      name: 'display_name',
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
    {
      label: 'Старый пароль',
      name: 'old_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
    },
    {
      label: 'Новый пароль',
      name: 'new_password',
      type: 'password',
      labelPosition: 'left',
      placeholder: '•••••••••••',
    },
    {
      label: 'Повторите новый пароль',
      name: 'new_password_repeat',
      type: 'password',
      placeholder: '•••••••••••',
      labelPosition: 'left',
    },
  ],
};

interface Enableble extends Element {
  disabled: boolean;
}

interface ProfileRefs extends BaseRefs {
  avatarInput: HTMLElement;
  avatarButton: HTMLElement;
}
class Profile extends BaseBlock<ProfileProps, BaseEventsMap, ProfileRefs> {
  protected template = template;
  private avatarCallback?: (e: Event) => void;
  protected componentDidMount(): void {
    const elements: NodeListOf<Enableble> = document.querySelectorAll('.form-field__input');
    elements.forEach((element) => {
      element.disabled = true;
    });

    const avatarInput = this.refs['avatarInput'];
    this.avatarCallback = () => {
      avatarInput.click();
    };
    this.refs['avatarButton'].addEventListener('click', this.avatarCallback);
  }
  protected componentWillUnmount(): void {
    if (this.avatarCallback && this.refs['avatarButton']) {
      this.refs['avatarButton'].removeEventListener('click', this.avatarCallback);
    }
  }
}
const profile = new Profile(profileContent);
const profileElement = profile.element();

if (profileElement) {
  document.getElementById('profile-container')!.appendChild(profileElement);
}
