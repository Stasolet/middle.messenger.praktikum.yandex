import { BaseBlock, type BlockOwnProps, type FormFieldProps } from '../../../shared/ui';
import template from './form.hbs';
import './form.scss';

export interface FormProps extends BlockOwnProps {
  title: string;
  buttonText?: string;
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
}
