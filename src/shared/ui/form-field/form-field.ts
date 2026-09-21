import { BaseBlock, type BaseProps } from '../../../shared/ui/base/base';
import template from './form-field.hbs';
import './form-field.scss';
export interface FormFieldProps extends BaseProps {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'tel' | 'number';
  placeholder?: string;
  value?: string | Number;
  labelPosition?: 'top' | 'left';
  enabled?: boolean;
}

export class FormField extends BaseBlock<FormFieldProps> {
  static componentName = 'FormField';
  protected template = template;
  constructor(props: FormFieldProps) {
    super({
      ...props,
      enabled: props.enabled ?? true,
    });
  }
}

