import { BaseBlock, type BaseProps, type FormFieldProps, FormField } from '../../../shared/ui';
import template from './form.hbs';
import './form.scss';

export interface FormProps extends BaseProps {
  title: string;
  buttonText: string;
  action?: string;
  fields: FormFieldProps[];
  footer?: {
    text: string;
    link: string;
  };
  onSubmit?: (e: Event) => void;
}

export class Form extends BaseBlock<FormProps> {
  static componentName = 'Form';
  protected template = template;
  protected events = {
    submit: (e: Event) => {
      e.preventDefault();
      const fields = Object.values(this.namedChildren) as unknown as FormField[];
      if (fields.some((field) => field.validate() !== null)) {
        return;
      }
      if (this.props.onSubmit) {
        this.props.onSubmit(e);
      } else if (this.props.action) {
        window.location.href = this.props.action;
      }
    },
  };
}
