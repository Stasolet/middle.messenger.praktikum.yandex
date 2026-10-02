import { BaseBlock, type BaseProps, type ComponentLike } from '../../../shared/ui/base/base';
import template from './form-field.hbs';
import './form-field.scss';
import { validations } from '../../../shared/lib/';
import { composeValidators } from '../../lib/validations';
import { Input } from '../input/input';
export interface FormFieldProps extends BaseProps {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'tel' | 'number';
  placeholder?: string;
  value?: string | number;
  labelPosition?: 'top' | 'left';
  enabled?: boolean;
  validators?: validations.Validator[];
  error?: string;
}

type FormFieldRefs = {
  input: HTMLInputElement;
  error: HTMLElement;
};

export class FormField extends BaseBlock<FormFieldProps, FormFieldRefs> {
  static componentName = 'FormField';
  protected template = template;
  constructor(props: FormFieldProps) {
    super({
      ...props,
      enabled: props.enabled ?? true,
    });
  }

  protected componentDidMount() {
    const input = this.namedChildren['input'] as unknown as Input | undefined;
    if (!input) {
      return;
    }
    input.onBlur = () => {
      this.validate();
    };
    input.onInput = () => {
      if (this.props.error) {
        this.setError('');
      }
    };
  }

  /** Имя поля из props */
  get name(): string {
    return this.props.name;
  }

  getValue(): string {
    return this.refs.input?.value ?? '';
  }

  setError(error: string) {
    this.props.error = error;
    const node = this.refs.error;
    if (!node) {
      return;
    }
    node.textContent = error;
    node.hidden = !error;
  }

  /**
   * Возвращает ошибку или null если всё нормально
   * На лету создаёт валидатор на основе props
   */
  validate(): string | null {
    const value = this.getValue();
    const validators = this.props.validators ?? [];
    const validator = composeValidators(validators);

    const error = validator(value);
    this.setError(error ?? '');
    return error;
  }
}

/**
 * Type guard: дочерний компонент — поле формы.
 * FormField формально не расширяет ComponentLike (unmountComponent protected),
 * поэтому предикат — пересечение.
 */
export const isFormField = (component: ComponentLike): component is FormField & ComponentLike =>
  component instanceof FormField;
