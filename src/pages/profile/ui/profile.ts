import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  type BaseRefs,
  type FormField,
  isFormField,
} from '../../../shared/ui';
import { collectFormValues, logFormValues } from '../../../shared/lib';
import '../../../widgets/form/ui/form.scss';

import template from './profile.hbs';
import './profile.scss';

export interface ProfileProps extends BaseProps {
  title: string;
  fields: FormFieldProps[];
}

interface ProfileRefs extends BaseRefs {
  avatarInput: HTMLElement;
  avatarButton: HTMLElement;
}

export class Profile extends BaseBlock<ProfileProps, ProfileRefs> {
  protected template = template;

  /** Все поля настроек, отрендеренные из props.fields */
  protected get fields(): FormField[] {
    return this.children.filter(isFormField);
  }

  protected events = {
    click: (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-action="change-avatar"]')) {
        const avatarInput = this.refs['avatarInput'] as HTMLInputElement;
        avatarInput.click();
      }
    },
    submit: (e: Event) => {
      e.preventDefault();

      const root = this.element();
      if (!(root instanceof HTMLFormElement)) {
        return;
      }

      const fieldErrors = this.fields.map((field) => field.validate());
      if (fieldErrors.some((error) => error !== null)) {
        return;
      }

      logFormValues(collectFormValues(root));
    },
  };
}
